import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Video, Mic, Sparkles, Lock, Layers } from "lucide-react";

const BARS = [40, 75, 35, 95, 55, 70, 40, 85, 50, 65, 30, 80];

export default function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-void border-r border-line/60 p-12 select-none">
      {/* Animated Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Brand Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber to-amber/60 flex items-center justify-center font-display font-bold text-void text-xl shadow-glow">
            C
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-ink">
            convene
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber/10 border border-amber/30 text-amber font-semibold">
            v2.0 Live
          </span>
        </div>
      </div>

      {/* Center Interactive WebRTC Mockup Card */}
      <div className="relative z-10 my-auto py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-6 rounded-3xl border border-line/80 shadow-2xl relative overflow-hidden max-w-lg"
        >
          {/* Top Live Badge Bar */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-line/50">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-teal animate-pulse" />
              <span className="text-xs font-semibold text-ink font-display">Live Meeting Demo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-inkdim bg-surface2 px-2 py-0.5 rounded-md border border-line">
                code: sync-room-402
              </span>
            </div>
          </div>

          {/* Video Grid Preview */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Tile 1: Alex */}
            <div className="relative rounded-2xl bg-surface/80 border border-amber/40 p-4 h-36 flex flex-col justify-between overflow-hidden shadow-glow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber" /> Alex (Host)
                </span>
                <Mic className="w-3.5 h-3.5 text-amber" />
              </div>
              <div className="flex items-center justify-center py-2">
                <div className="h-12 w-12 rounded-full bg-amber/20 border border-amber/50 flex items-center justify-center font-display font-bold text-amber text-lg">
                  A
                </div>
              </div>
              {/* Speaking Glow Wave */}
              <div className="flex items-center justify-center gap-1 h-3">
                {BARS.slice(0, 6).map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-amber"
                    style={{
                      height: `${h * 0.4}%`,
                      animation: `pulseBar 1.2s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Tile 2: Sarah */}
            <div className="relative rounded-2xl bg-surface/80 border border-line p-4 h-36 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal" /> Sarah
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-teal/20 text-teal font-mono">✋ Raised</span>
              </div>
              <div className="flex items-center justify-center py-2">
                <div className="h-12 w-12 rounded-full bg-teal/20 border border-teal/50 flex items-center justify-center font-display font-bold text-teal text-lg">
                  S
                </div>
              </div>
              <div className="text-[10px] text-center text-inkdim font-mono">
                Sharing screen...
              </div>
            </div>
          </div>

          {/* Floating Emoji Particles & Whiteboard Badge */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-inkdim bg-surface2/60 px-3 py-1.5 rounded-xl border border-line">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <span>Collaborative Whiteboard Active</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.span animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 2 }} className="text-sm">🔥</motion.span>
              <motion.span animate={{ y: [2, -2, 2] }} transition={{ repeat: Infinity, duration: 2.2 }} className="text-sm">❤️</motion.span>
              <motion.span animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-sm">👏</motion.span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Security & Features Footer */}
      <div className="relative z-10 flex items-center justify-between text-xs text-inkdim border-t border-line/40 pt-6">
        <div className="flex items-center gap-2 text-teal">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-mono">AES-256 Encrypted</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Lock className="w-3 h-3 text-amber" />
          <span>Zero Server Logs</span>
        </div>
      </div>

      <style>{`
        @keyframes pulseBar {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

