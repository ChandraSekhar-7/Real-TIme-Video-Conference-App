import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MicOff, Pin, Hand } from "lucide-react";

/**
 * Renders one participant's video. Supports:
 * - double-click / double-tap to pin (spotlight) a tile
 * - live speaking indicator driven by the Web Audio API analyser
 * - glassmorphism overlays and framer-motion micro-interactions
 */
export default function VideoTile({
  stream,
  name,
  avatarColor,
  isLocal,
  micOn = true,
  camOn = true,
  isPinned,
  onTogglePin,
  handRaised,
}) {
  const videoRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);

  // Sync video stream when provided
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Audio Analyzer for speaking detection
  useEffect(() => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    let audioCtx, analyser, dataArray, rafId;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setSpeaking(avg > 18);
        rafId = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* Web Audio not available; skip the indicator gracefully */
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (audioCtx) audioCtx.close();
    };
  }, [stream]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onDoubleClick={onTogglePin}
      className={`relative rounded-2xl overflow-hidden glass-panel transition-all duration-300 cursor-pointer group aspect-video flex items-center justify-center select-none ${
        speaking
          ? "border-amber ring-2 ring-amber/50 shadow-glow"
          : "border-line/60 hover:border-line"
      } ${isPinned ? "ring-2 ring-teal shadow-tealglow border-teal/80" : ""}`}
    >
      {/* Video Stream or Avatar Fallback */}
      {camOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover rounded-2xl transition-transform duration-300 ${
            isLocal ? "-scale-x-100" : ""
          }`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-surface/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: speaking ? [1, 1.08, 1] : 1 }}
            transition={{ repeat: speaking ? Infinity : 0, duration: 1.5 }}
            className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-display font-bold text-void shadow-lg ring-4 ring-void/40"
            style={{ background: avatarColor || "#F0A868" }}
          >
            {name?.[0]?.toUpperCase() || "?"}
          </motion.div>
        </div>
      )}

      {/* Hand Raised Notification Badge */}
      <AnimatePresence>
        {handRaised && (
          <motion.div
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -10 }}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-amber/95 text-void flex items-center justify-center shadow-lg animate-pulseRing z-10"
          >
            <Hand className="w-5 h-5 fill-void" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned Indicator Badge */}
      {isPinned && (
        <div className="absolute top-3 right-3 bg-teal/20 backdrop-blur-md border border-teal/40 text-teal p-1.5 rounded-lg z-10">
          <Pin className="w-4 h-4 fill-teal" />
        </div>
      )}

      {/* Floating Bottom Info Bar */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-void/70 backdrop-blur-md border border-white/10 text-xs z-10 transition-colors">
        <div className="flex items-center gap-2 max-w-[70%]">
          {/* Active Speaking Visualizer Dot */}
          {speaking ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber"></span>
            </span>
          ) : null}

          <span className="font-medium text-ink truncate">
            {name} {isLocal && <span className="text-inkdim font-normal">(you)</span>}
          </span>
        </div>

        {/* Mic Status */}
        <div className="flex items-center gap-1.5">
          {micOn ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal bg-teal/10 px-2 py-0.5 rounded-full border border-teal/20">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
              On
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-coral bg-coral/10 px-2 py-0.5 rounded-full border border-coral/20">
              <MicOff className="w-3 h-3" />
              Muted
            </span>
          )}
        </div>
      </div>

      {/* Double click hover tooltip */}
      <span className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] text-inkdim bg-void/80 backdrop-blur-sm border border-line/50 rounded-lg px-2.5 py-1 z-10">
        Double-click to {isPinned ? "unpin" : "pin"}
      </span>
    </motion.div>
  );
}