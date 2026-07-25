import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, Plus, LogOut, User } from "lucide-react";
import SettingsModal from "../components/SettingsModal";
import CreateRoomModal from "../components/CreateRoomModal";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleCreateRoom = async (customName) => {
    setError("");
    setBusy(true);
    try {
      const finalName = customName || `${user?.name || "Meeting"}’s room`;
      const { data } = await api.post("/rooms", {
        name: finalName,
      });
      setCreateModalOpen(false);
      navigate(`/room/${data.room.code}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create room. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const trimmedCode = roomCodeInput.trim();
    if (!trimmedCode) {
      setError("Enter a room code to join.");
      return;
    }
    setError("");
    navigate(`/room/${trimmedCode}`);
  };

  return (
    <div className="min-h-screen bg-void text-ink grain-bg flex flex-col transition-colors duration-300">
      {/* Top Glass Header Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between glass-panel border-b border-line/60 sticky top-0 z-40">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber/20 border border-amber/40 flex items-center justify-center text-amber font-display font-bold text-xl shadow-glow">
            C
          </div>
          <span className="font-display font-bold text-lg text-ink tracking-tight">
            Convene
          </span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* User Profile Badge */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface2/60 border border-line text-xs font-medium">
              <User className="w-3.5 h-3.5 text-amber" />
              <span>{user.name || user.username || "User"}</span>
            </div>
          )}

          {/* Pre-call Settings Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 rounded-xl glass-button text-inkdim hover:text-amber border border-line flex items-center gap-2 text-xs font-medium cursor-pointer"
            title="Pre-call Settings"
          >
            <Settings className="w-4 h-4 text-amber" />
            <span className="hidden sm:inline">Settings</span>
          </motion.button>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="p-2.5 rounded-xl bg-coral/10 hover:bg-coral/20 text-coral border border-coral/30 flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </header>

      {/* Main Dashboard Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-display font-bold text-ink mb-4"
        >
          Seamless, high-quality video meetings.
        </motion.h1>
        
        <p className="text-inkdim text-sm max-w-md mb-8">
          Connect, collaborate, and present with real-time audio, screen sharing, and interactive whiteboards.
        </p>

        {error && (
          <p className="text-coral text-xs bg-coral/10 border border-coral/30 rounded-lg px-4 py-2.5 mb-6 max-w-md">
            {error}
          </p>
        )}

        {/* Room Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary flex items-center justify-center gap-2 py-4 text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            New Instant Meeting
          </button>

          <form onSubmit={handleJoinRoom} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Room Code"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value)}
              className="input-field text-xs py-3.5"
            />
            <button type="submit" className="btn-ghost text-xs px-5 font-semibold cursor-pointer">
              Join
            </button>
          </form>
        </div>
      </main>

      {/* Pre-Call Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Create Instant Meeting Modal */}
      <CreateRoomModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
        busy={busy}
      />
    </div>
  );
}