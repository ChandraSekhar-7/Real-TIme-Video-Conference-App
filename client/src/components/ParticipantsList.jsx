export default function ParticipantsList({ participants, onClose }) {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-line z-20 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h3 className="font-display font-semibold text-sm">
          In this room · {participants.length}
        </h3>
        <button onClick={onClose} className="text-inkdim hover:text-ink text-lg leading-none">
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {participants.map((p) => (
          <div
            key={p.socketId}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface2"
          >
            <span
              className="h-8 w-8 rounded-full flex items-center justify-center text-void text-sm font-semibold"
              style={{ background: p.avatarColor }}
            >
              {p.name?.[0]?.toUpperCase()}
            </span>
            <span className="text-sm flex-1 truncate">
              {p.name} {p.isLocal && <span className="text-inkdim">(you)</span>}
            </span>
            {p.handRaised && <span>✋</span>}
            <span className={`text-xs ${p.micOn ? "text-teal" : "text-coral"}`}>
              {p.micOn ? "🎙️" : "🔇"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
