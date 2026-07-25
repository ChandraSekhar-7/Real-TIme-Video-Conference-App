import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Room from "./pages/Room.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function SplashLoader() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-void grain-bg">
      <div className="flex items-center gap-3 text-inkdim font-mono text-sm">
        <span className="h-2 w-2 rounded-full bg-amber animate-pulseRing" />
        loading convene…
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/room/:code"
          element={
            <Protected>
              <Room />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  );
}
