import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Video, Sparkles } from "lucide-react";

export default function CreateRoomModal({ isOpen, onClose, onCreateRoom, busy }) {
  const [roomName, setRoomName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateRoom(roomName.trim());
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md glass-panel p-6 rounded-2xl border border-line shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-inkdim hover:text-ink hover:bg-surface2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-amber/20 border border-amber/40 flex items-center justify-center text-amber shadow-glow">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-ink">New Instant Meeting</h3>
              <p className="text-xs text-inkdim">Give your meeting room a name before launching.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-inkdim mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber" />
                Room Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Weekly Sync, Design Review, Quick Chat"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="input-field text-sm py-3"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-line text-inkdim hover:text-ink text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {busy ? "Creating..." : "Start Meeting"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
