import { useEffect, useRef, useState } from "react";
import { api, FILE_DOWNLOAD_URL } from "../utils/api";

export default function ChatPanel({ socketRef, roomCode, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get(`/rooms/${roomCode}/messages`).then(({ data }) => setMessages(data.messages));
  }, [roomCode]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    function onMessage(msg) {
      setMessages((prev) => [...prev, msg]);
    }
    socket.on("chat:message", onMessage);
    return () => socket.off("chat:message", onMessage);
  }, [socketRef]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit("chat:message", { roomCode, text: text.trim() });
    setText("");
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(`/files/${roomCode}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((prev) => [...prev, data.message]);
      socketRef.current?.emit("chat:file-shared", { roomCode, message: data.message });
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function formatSize(bytes = 0) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-surface border-l border-line z-20 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <h3 className="font-display font-semibold text-sm">Chat & files</h3>
          <p className="text-[11px] text-inkdim">messages are encrypted at rest</p>
        </div>
        <button onClick={onClose} className="text-inkdim hover:text-ink text-lg leading-none">
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-inkdim text-sm text-center mt-10">
            No messages yet. Say hello or drop a file.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id}>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-teal">{m.senderName}</span>
              <span className="text-[10px] text-inkdim">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {m.type === "file" ? (
              <a
                href={FILE_DOWNLOAD_URL(m.fileMeta.storedName)}
                className="mt-1 flex items-center gap-2 bg-surface2 border border-line rounded-lg px-3 py-2 hover:border-amber/50 transition-colors"
              >
                <span className="text-amber">⇪</span>
                <span className="text-sm truncate flex-1">{m.fileMeta.originalName}</span>
                <span className="text-[10px] text-inkdim">{formatSize(m.fileMeta.size)}</span>
              </a>
            ) : (
              <p className="text-sm text-ink mt-0.5 break-words">{m.text}</p>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-line flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-10 w-10 shrink-0 rounded-lg bg-surface2 border border-line flex items-center justify-center hover:border-amber/50"
          title="Share a file"
        >
          {uploading ? "…" : "＋"}
        </button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        <input
          className="input-field flex-1 py-2.5"
          placeholder="Message the room…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary px-4 py-2.5">
          Send
        </button>
      </form>
    </div>
  );
}
