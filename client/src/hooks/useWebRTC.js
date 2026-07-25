import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  // In production, add a TURN server here for reliable NAT traversal:
  // { urls: "turn:your-turn-server.com:3478", username: "...", credential: "..." }
];

/**
 * Manages a full-mesh WebRTC topology: one RTCPeerConnection per remote
 * participant. Good for small rooms (roughly <= 8-10 people); a larger
 * production deployment would swap this for an SFU (e.g. mediasoup/LiveKit).
 */
export function useWebRTC({ socketRef, roomCode, localStream }) {
  const [remoteStreams, setRemoteStreams] = useState({}); // socketId -> MediaStream
  const peersRef = useRef({}); // socketId -> RTCPeerConnection

  const createPeerConnection = useCallback(
    (remoteSocketId) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      if (localStream) {
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
      }

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => ({ ...prev, [remoteSocketId]: event.streams[0] }));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("webrtc:ice-candidate", {
            to: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          closePeer(remoteSocketId);
        }
      };

      peersRef.current[remoteSocketId] = pc;
      return pc;
    },
    [localStream, socketRef]
  );

  const closePeer = useCallback((remoteSocketId) => {
    const pc = peersRef.current[remoteSocketId];
    if (pc) {
      pc.close();
      delete peersRef.current[remoteSocketId];
    }
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[remoteSocketId];
      return next;
    });
  }, []);

  const callPeer = useCallback(
    async (remoteSocketId) => {
      const pc = createPeerConnection(remoteSocketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("webrtc:offer", { to: remoteSocketId, offer });
    },
    [createPeerConnection, socketRef]
  );

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    async function handleOffer({ from, offer }) {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { to: from, answer });
    }

    async function handleAnswer({ from, answer }) {
      const pc = peersRef.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async function handleIce({ from, candidate }) {
      const pc = peersRef.current[from];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("ICE candidate error", err);
        }
      }
    }

    function handleMemberLeft({ socketId }) {
      closePeer(socketId);
    }

    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIce);
    socket.on("room:member-left", handleMemberLeft);

    return () => {
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIce);
      socket.off("room:member-left", handleMemberLeft);
    };
  }, [socketRef, createPeerConnection, closePeer]);

  // Replace the outgoing video track on every peer (used for screen-share toggle)
  const replaceVideoTrack = useCallback((newTrack) => {
    Object.values(peersRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender) sender.replaceTrack(newTrack);
    });
  }, []);

  const closeAll = useCallback(() => {
    Object.keys(peersRef.current).forEach(closePeer);
  }, [closePeer]);

  return { remoteStreams, callPeer, closePeer, closeAll, replaceVideoTrack };
}
