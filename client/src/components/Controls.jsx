import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Edit3,
  MessageSquare,
  Hand,
  PhoneOff,
  Copy,
  Check,
  Smile,
  Settings,
} from "lucide-react";
import SettingsModal from "./SettingsModal";

const REACTIONS = ["👍", "🎉", "😂", "❤️", "👏"];

function CtrlBtn({ active, danger, onClick, children, label }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      title={label}
      className={`relative h-12 w-12 rounded-2xl flex items-center justify-center text-lg transition-all duration-200 group ${
        danger
          ? "bg-coral/90 text-void hover:bg-coral shadow-[0_0_20px_rgba(242,125,125,0.4)]"
          : active
          ? "bg-amber text-void shadow-[0_0_20px_rgba(240,168,104,0.35)]"
          : "glass-button text-ink hover:text-amber"
      }`}
    >
      {children}
      
      {/* Floating Tooltip on Hover */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] font-medium text-ink bg-void/90 backdrop-blur-md border border-line px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-lg">
        {label}
      </span>
    </motion.button>
  );
}

export default function Controls({
  micOn,
  camOn,
  sharingScreen,
  whiteboardOpen,
  chatOpen,
  handRaised,
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
  onToggleWhiteboard,
  onToggleChat,
  onToggleHand,
  onSendReaction,
  onLeave,
  roomCode,
}) {
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);

  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed bottom-0 inset-x-0 z-30 flex flex-col items-center gap-2.5 pb-5 pointer-events-none"
      >
        {/* Emoji Reactions Bar */}
        {reactionsOpen && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="pointer-events-auto flex items-center gap-1.5 glass-panel rounded-full px-3.5 py-1.5 shadow-2xl border border-white/10"
          >
            {REACTIONS.map((emoji) => (
              <motion.button
                key={emoji}
                type="button"
                whileHover={{ scale: 1.35, y: -3 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => onSendReaction && onSendReaction(emoji)}
                className="text-xl p-1 transition-transform"
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Main Bottom Toolbar Floating Dock */}
        <div className="pointer-events-auto flex items-center gap-2.5 glass-panel rounded-3xl px-5 py-3 shadow-2xl border border-white/10 backdrop-blur-glass">
          {/* Audio Toggle */}
          <CtrlBtn active={micOn} onClick={onToggleMic} label={micOn ? "Mute mic" : "Unmute mic"}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-coral" />}
          </CtrlBtn>

          {/* Video Toggle */}
          <CtrlBtn active={camOn} onClick={onToggleCam} label={camOn ? "Turn camera off" : "Turn camera on"}>
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-coral" />}
          </CtrlBtn>

          {/* Screen Share Toggle */}
          <CtrlBtn
            active={sharingScreen}
            onClick={onToggleScreenShare}
            label={sharingScreen ? "Stop screen share" : "Share screen"}
          >
            <Monitor className="w-5 h-5" />
          </CtrlBtn>

          {/* Whiteboard Toggle */}
          <CtrlBtn active={whiteboardOpen} onClick={onToggleWhiteboard} label="Whiteboard">
            <Edit3 className="w-5 h-5" />
          </CtrlBtn>

          {/* Reactions Toggle */}
          <CtrlBtn
            active={reactionsOpen}
            onClick={() => setReactionsOpen((prev) => !prev)}
            label={reactionsOpen ? "Hide reactions" : "Show reactions"}
          >
            <Smile className="w-5 h-5" />
          </CtrlBtn>

          {/* Chat & Files Toggle */}
          <CtrlBtn active={chatOpen} onClick={onToggleChat} label="Chat & files">
            <MessageSquare className="w-5 h-5" />
          </CtrlBtn>

          {/* Hand Raise Toggle */}
          <CtrlBtn active={handRaised} onClick={onToggleHand} label={handRaised ? "Lower hand" : "Raise hand"}>
            <Hand className={`w-5 h-5 ${handRaised ? "animate-bounce" : ""}`} />
          </CtrlBtn>

          {/* Settings Modal Toggle Button */}
          <CtrlBtn active={settingsOpen} onClick={() => setSettingsOpen(true)} label="Settings">
            <Settings className="w-5 h-5" />
          </CtrlBtn>

          {/* Divider */}
          <div className="w-px h-7 bg-line/80 mx-1" />

          {/* End Call Button */}
          <CtrlBtn danger onClick={onLeave} label="Leave call">
            <PhoneOff className="w-5 h-5" />
          </CtrlBtn>
        </div>

        {/* Interactive Room Code Pill with Copy Action */}
        <motion.button
          type="button"
          onClick={handleCopyRoomCode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto flex items-center gap-1.5 text-[11px] font-mono text-inkdim hover:text-ink bg-void/80 backdrop-blur-md border border-line/60 px-3 py-1 rounded-full shadow-lg transition-colors cursor-pointer"
          title="Click to copy room code"
        >
          <span>room {roomCode}</span>
          {copied ? <Check className="w-3 h-3 text-teal" /> : <Copy className="w-3 h-3 text-inkdim" />}
        </motion.button>
      </motion.div>

      {/* Render Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </>
  );
}