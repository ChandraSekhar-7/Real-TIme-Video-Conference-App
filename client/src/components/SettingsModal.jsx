import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sun,
  Moon,
  Video,
  Sliders,
  Bell,
  Check,
  Mic,
} from "lucide-react";

export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("appearance");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  const [audioInput, setAudioInput] = useState("default");
  const [videoInput, setVideoInput] = useState("default");
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Apply Light/Dark mode changes directly to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md">
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-line shadow-2xl flex flex-col md:flex-row h-[520px]"
        >
          {/* Sidebar Tabs */}
          <div className="w-full md:w-56 bg-surface/80 border-r border-line/60 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6 px-2">
                <Sliders className="w-5 h-5 text-amber" />
                <h2 className="font-display font-semibold text-ink text-base">
                  Settings
                </h2>
              </div>

              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("appearance")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "appearance"
                      ? "bg-amber text-void font-semibold"
                      : "text-inkdim hover:text-ink hover:bg-surface2"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Appearance & Theme
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("media")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "media"
                      ? "bg-amber text-void font-semibold"
                      : "text-inkdim hover:text-ink hover:bg-surface2"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Audio & Video
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "notifications"
                      ? "bg-amber text-void font-semibold"
                      : "text-inkdim hover:text-ink hover:bg-surface2"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>
              </nav>
            </div>

            <span className="text-[10px] font-mono text-inkdim/60 px-2">
              Convene v1.2.0
            </span>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 flex flex-col justify-between p-6 bg-surface2/30 overflow-y-auto">
            <div>
              {/* Close Button */}
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-inkdim hover:text-ink hover:bg-surface2 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* APPEARANCE TAB */}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-ink mb-1">
                      Theme Mode
                    </h3>
                    <p className="text-xs text-inkdim mb-4">
                      Customize how Convene looks on your screen.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Dark Mode Card */}
                      <button
                        type="button"
                        onClick={() => handleThemeChange("dark")}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all cursor-pointer ${
                          theme === "dark"
                            ? "bg-surface border-amber ring-2 ring-amber/50"
                            : "bg-surface/40 border-line hover:border-line/80"
                        }`}
                      >
                        <div className="h-10 w-10 rounded-full bg-void border border-line flex items-center justify-center text-amber">
                          <Moon className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-ink flex items-center justify-center gap-1">
                            Dark Mode
                            {theme === "dark" && (
                              <Check className="w-3 h-3 text-amber" />
                            )}
                          </div>
                          <span className="text-[10px] text-inkdim">
                            Optimal for dim light
                          </span>
                        </div>
                      </button>

                      {/* Light Mode Card */}
                      <button
                        type="button"
                        onClick={() => handleThemeChange("light")}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all cursor-pointer ${
                          theme === "light"
                            ? "bg-surface border-amber ring-2 ring-amber/50"
                            : "bg-surface/40 border-line hover:border-line/80"
                        }`}
                      >
                        <div className="h-10 w-10 rounded-full bg-ink/10 border border-line flex items-center justify-center text-amber">
                          <Sun className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-ink flex items-center justify-center gap-1">
                            Light Mode
                            {theme === "light" && (
                              <Check className="w-3 h-3 text-amber" />
                            )}
                          </div>
                          <span className="text-[10px] text-inkdim">
                            Bright & clear layout
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AUDIO & VIDEO TAB */}
              {activeTab === "media" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-2">
                      Microphone Device
                    </label>
                    <select
                      value={audioInput}
                      onChange={(e) => setAudioInput(e.target.value)}
                      className="input-field text-xs cursor-pointer"
                    >
                      <option value="default">Default Microphone</option>
                      <option value="mic-1">System Internal Microphone</option>
                      <option value="mic-2">External Headset Microphone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink mb-2">
                      Camera Device
                    </label>
                    <select
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      className="input-field text-xs cursor-pointer"
                    >
                      <option value="default">Default HD WebCam</option>
                      <option value="cam-1">Integrated Camera</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-xs font-medium text-ink">
                        AI Noise Suppression
                      </div>
                      <div className="text-[11px] text-inkdim">
                        Filters background noise automatically
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={noiseCancellation}
                      onChange={(e) => setNoiseCancellation(e.target.checked)}
                      className="accent-amber h-4 w-4 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-ink">
                        In-call Chat Sounds
                      </div>
                      <div className="text-[11px] text-inkdim">
                        Play sound when new messages arrive
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="accent-amber h-4 w-4 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action */}
            <div className="pt-4 border-t border-line/40 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-xs px-5 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}