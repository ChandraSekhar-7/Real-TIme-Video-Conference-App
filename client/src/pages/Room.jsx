import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useWebRTC } from "../hooks/useWebRTC";
import { api } from "../utils/api";
import VideoTile from "../components/VideoTile.jsx";
import Controls from "../components/Controls.jsx";
import Whiteboard from "../components/Whiteboard.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import ParticipantsList from "../components/ParticipantsList.jsx";
import Reactions from "../components/Reactions.jsx";

export default function Room() {
  const { code } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [pinnedId, setPinnedId] = useState(null);
  const [members, setMembers] = useState([]); // [{socketId, userId, name, avatarColor}]
  const [mediaStates, setMediaStates] = useState({}); // socketId -> {micOn, camOn}
  const [handStates, setHandStates] = useState({}); // socketId -> bool
  const [reactions, setReactions] = useState([]);
  const [whiteboardSnapshot, setWhiteboardSnapshot] = useState(null);
  const [joinError, setJoinError] = useState("");

  const cameraTrackRef = useRef(null);
  const screenStreamRef = useRef(null);

  const { remoteStreams, callPeer, replaceVideoTrack, closeAll } = useWebRTC({
    socketRef: socket,
    roomCode: code,
    localStream,
  });

  // 1. Validate room + fetch any saved whiteboard, 2. acquire camera/mic
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const { data } = await api.get(`/rooms/${code}`);
        if (!cancelled) setWhiteboardSnapshot(data.room.whiteboardSnapshot);
      } catch {
        if (!cancelled) setJoinError("This room doesn't exist or has expired.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        cameraTrackRef.current = stream.getVideoTracks()[0];
        setLocalStream(stream);
      } catch {
        if (!cancelled) setJoinError("Camera/microphone access is required to join.");
      }
    }
    setup();

    return () => {
      cancelled = true;
    };
  }, [code]);

  // Join the signaling room once we have both a socket and local media
  useEffect(() => {
    const s = socket.current;
    if (!s || !localStream) return;

    s.emit("room:join", { roomCode: code, avatarColor: user.avatarColor });

    function onExisting(existingMembers) {
      setMembers((prev) => mergeMembers(prev, existingMembers));
      existingMembers.forEach((m) => callPeer(m.socketId));
    }
    function onJoined(member) {
      setMembers((prev) => mergeMembers(prev, [member]));
    }
    function onLeft({ socketId }) {
      setMembers((prev) => prev.filter((m) => m.socketId !== socketId));
      setMediaStates((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    }
    function onMediaState({ socketId, micOn: m, camOn: c, sharingScreen: s2 }) {
      setMediaStates((prev) => ({ ...prev, [socketId]: { micOn: m, camOn: c, sharingScreen: s2 } }));
    }
    function onHand({ socketId, raised }) {
      setHandStates((prev) => ({ ...prev, [socketId]: raised }));
    }
    function onReaction({ emoji }) {
      const id = Math.random().toString(36).slice(2);
      setReactions((prev) => [...prev, { id, emoji, x: 20 + Math.random() * 60 }]);
      setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2300);
    }

    s.on("room:existing-members", onExisting);
    s.on("room:member-joined", onJoined);
    s.on("room:member-left", onLeft);
    s.on("media:state", onMediaState);
    s.on("hand:toggle", onHand);
    s.on("reaction:receive", onReaction);

    return () => {
      s.off("room:existing-members", onExisting);
      s.off("room:member-joined", onJoined);
      s.off("room:member-left", onLeft);
      s.off("media:state", onMediaState);
      s.off("hand:toggle", onHand);
      s.off("reaction:receive", onReaction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, localStream, code]);

  function mergeMembers(prev, incoming) {
    const map = new Map(prev.map((m) => [m.socketId, m]));
    incoming.forEach((m) => map.set(m.socketId, m));
    return Array.from(map.values());
  }

  function toggleMic() {
    const next = !micOn;
    localStream?.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
    socket.current?.emit("media:state", { roomCode: code, micOn: next, camOn, sharingScreen });
  }

  function toggleCam() {
    const next = !camOn;
    localStream?.getVideoTracks().forEach((t) => (t.enabled = next));
    setCamOn(next);
    socket.current?.emit("media:state", { roomCode: code, micOn, camOn: next, sharingScreen });
  }

  async function toggleScreenShare() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert("Screen sharing is not supported by this browser.");
      return;
    }

    if (!sharingScreen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        replaceVideoTrack(screenTrack);
        setSharingScreen(true);
        socket.current?.emit("media:state", { roomCode: code, micOn, camOn, sharingScreen: true });

        screenTrack.onended = () => stopScreenShare();
      } catch {
        /* user cancelled the picker */
      }
    } else {
      stopScreenShare();
    }
  }

  function stopScreenShare() {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (cameraTrackRef.current) replaceVideoTrack(cameraTrackRef.current);
    setSharingScreen(false);
    socket.current?.emit("media:state", { roomCode: code, micOn, camOn, sharingScreen: false });
  }

  function toggleHand() {
    const next = !handRaised;
    setHandRaised(next);
    socket.current?.emit("hand:toggle", { roomCode: code, raised: next });
  }

  function sendReaction(emoji) {
    socket.current?.emit("reaction:send", { roomCode: code, emoji });
  }

  function leaveCall() {
    localStream?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    socket.current?.emit("room:leave");
    closeAll();
    navigate("/");
  }

  const tiles = useMemo(() => {
    const remote = members.map((m) => ({
      id: m.socketId,
      name: m.name,
      avatarColor: m.avatarColor,
      stream: remoteStreams[m.socketId],
      micOn: mediaStates[m.socketId]?.micOn ?? true,
      camOn: mediaStates[m.socketId]?.camOn ?? true,
      handRaised: handStates[m.socketId] ?? false,
      isLocal: false,
    }));
    return [
      {
        id: "local",
        name: user.name,
        avatarColor: user.avatarColor,
        stream: localStream,
        micOn,
        camOn,
        handRaised,
        isLocal: true,
      },
      ...remote,
    ];
  }, [members, remoteStreams, mediaStates, handStates, localStream, micOn, camOn, handRaised, user]);

  const pinnedTile = tiles.find((t) => t.id === pinnedId);
  const gridTiles = pinnedTile ? tiles.filter((t) => t.id !== pinnedId) : tiles;

  if (joinError) {
    return (
      <div className="h-screen flex items-center justify-center bg-void text-center px-6">
        <div>
          <p className="text-coral text-lg font-display">{joinError}</p>
          <button onClick={() => navigate("/")} className="btn-ghost mt-4">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-void grain-bg relative overflow-hidden flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-line z-10">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal animate-pulseRing" />
          <span className="text-sm text-inkdim">Live · {tiles.length} in room</span>
        </div>
        <button
          onClick={() => setParticipantsOpen((v) => !v)}
          className="btn-ghost text-xs px-3 py-1.5"
        >
          Participants
        </button>
      </header>

      <main className="flex-1 relative p-4 overflow-hidden">
        {pinnedTile ? (
          <div className="h-full flex flex-col gap-3">
            <div className="flex-1 min-h-0">
              <VideoTile
                {...pinnedTile}
                isPinned
                onTogglePin={() => setPinnedId(null)}
              />
            </div>
            <div className="h-28 flex gap-3 overflow-x-auto">
              {gridTiles.map((t) => (
                <div key={t.id} className="w-40 shrink-0">
                  <VideoTile {...t} onTogglePin={() => setPinnedId(t.id)} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="h-full grid gap-3 auto-rows-fr"
            style={{ gridTemplateColumns: `repeat(${gridColumns(tiles.length)}, minmax(0,1fr))` }}
          >
            {gridTiles.map((t) => (
              <VideoTile key={t.id} {...t} onTogglePin={() => setPinnedId(t.id)} />
            ))}
          </div>
        )}

        {whiteboardOpen && (
          <Whiteboard
            socketRef={socket}
            roomCode={code}
            initialSnapshot={whiteboardSnapshot}
            onClose={() => setWhiteboardOpen(false)}
          />
        )}
        {chatOpen && <ChatPanel socketRef={socket} roomCode={code} onClose={() => setChatOpen(false)} />}
        {participantsOpen && (
          <ParticipantsList
            participants={tiles.map((t) => ({ ...t, socketId: t.id }))}
            onClose={() => setParticipantsOpen(false)}
          />
        )}
      </main>

      <Reactions reactions={reactions} />

      <Controls
        micOn={micOn}
        camOn={camOn}
        sharingScreen={sharingScreen}
        whiteboardOpen={whiteboardOpen}
        chatOpen={chatOpen}
        handRaised={handRaised}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleScreenShare={toggleScreenShare}
        onToggleWhiteboard={() => setWhiteboardOpen((v) => !v)}
        onToggleChat={() => setChatOpen((v) => !v)}
        onToggleHand={toggleHand}
        onSendReaction={sendReaction}
        onLeave={leaveCall}
        roomCode={code}
      />
    </div>
  );
}

function gridColumns(count) {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}
