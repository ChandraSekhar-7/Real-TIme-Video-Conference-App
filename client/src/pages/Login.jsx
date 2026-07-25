import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import BrandPanel from "../components/BrandPanel.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign you in. Check your details.");
    } finally {
      setBusy(false);
    }
  }

  // Quick helper to fill demo credentials if needed
  const fillDemoUser = () => {
    setForm({ email: "demo@convene.app", password: "password123" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-void grain-bg relative overflow-hidden">
      <BrandPanel />

      <div className="flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-line/80 shadow-2xl relative"
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-10 w-10 rounded-2xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber shadow-glow">
              <LogIn className="w-5 h-5" />
            </div>
            <button
              type="button"
              onClick={fillDemoUser}
              className="flex items-center gap-1.5 text-xs text-amber font-medium bg-amber/10 border border-amber/20 hover:bg-amber/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Demo Fill
            </button>
          </div>

          <h2 className="font-display text-3xl font-bold text-ink tracking-tight">Welcome back</h2>
          <p className="text-inkdim mt-2 text-sm">Sign in to access your meeting rooms and team workspace.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email Field */}
            <div>
              <label className="text-xs font-medium text-inkdim mb-1.5 block flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="input-field py-3 pl-3.5 pr-4 text-sm"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <label className="text-xs font-medium text-inkdim mb-1.5 block flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field py-3 pl-3.5 pr-10 text-sm"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-inkdim hover:text-ink transition-colors cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-coral text-xs bg-coral/10 border border-coral/30 rounded-xl px-4 py-3"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 group"
            >
              <span>{busy ? "Signing in…" : "Sign In to Convene"}</span>
              {!busy && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-line/50 text-center">
            <p className="text-inkdim text-sm">
              New to Convene?{" "}
              <Link to="/register" className="text-amber font-medium hover:underline inline-flex items-center gap-1">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

