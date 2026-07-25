export default function Reactions({ reactions }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {reactions.map((r) => (
        <span
          key={r.id}
          className="absolute text-3xl animate-floatUp"
          style={{ left: `${r.x}%`, bottom: "8rem" }}
        >
          {r.emoji}
        </span>
      ))}
    </div>
  );
}
