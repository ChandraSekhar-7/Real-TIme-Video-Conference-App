const BARS = [40, 70, 30, 90, 50, 65, 35, 80, 45, 60, 25, 75];

export default function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-surface border-r border-line px-14 py-14">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(240,168,104,0.12), transparent 35%), radial-gradient(circle at 85% 80%, rgba(79,209,197,0.12), transparent 40%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-amber flex items-center justify-center font-display font-bold text-void">
            C
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">convene</span>
        </div>
      </div>

      <div className="relative">
        <p className="font-display text-4xl leading-tight font-semibold max-w-md">
          Every room starts the moment someone shows up.
        </p>
        <p className="text-inkdim mt-4 max-w-sm text-sm">
          Video, whiteboard, files and chat — encrypted and in one place. No downloads, no
          waiting room theatrics.
        </p>

        {/* Signature element: a live presence waveform standing in for "who's talking" */}
        <div className="mt-10 flex items-end gap-1 h-16">
          {BARS.map((h, i) => (
            <span
              key={i}
              className="w-2 rounded-full bg-gradient-to-t from-amber to-teal"
              style={{
                height: `${h}%`,
                animation: `pulseBar 1.4s ease-in-out ${i * 0.08}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes pulseBar {
            0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
            50% { transform: scaleY(1); opacity: 1; }
          }
        `}</style>
      </div>

      <p className="relative text-inkdim text-xs font-mono">
        end-to-end room codes · AES-256 at rest · DTLS-SRTP media
      </p>
    </div>
  );
}
