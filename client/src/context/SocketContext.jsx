import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed Client Origins (using Node.js process.env instead of Vite import.meta)
const CLIENT_URL = (process.env.CLIENT_URL || "https://real-time-video-conference-app.onrender.com").replace(/\/$/, "");
const ALLOWED_ORIGINS = [
  CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

// Express Middleware
app.use(express.json());
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

// Initialize Socket.IO with CORS & Polling/WebSocket Transports
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Socket.IO Middleware for JWT Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.IO Connection & Event Handlers
io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id} (User ID: ${socket.user?.id || "Authenticated"})`);

  // Join Meeting Room
  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", { socketId: socket.id, user });
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // WebRTC Signaling Events
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  // Chat & Reaction Events
  socket.on("send-message", ({ roomId, message }) => {
    io.to(roomId).emit("receive-message", message);
  });

  socket.on("send-reaction", ({ roomId, reaction }) => {
    io.to(roomId).emit("receive-reaction", { from: socket.id, reaction });
  });

  // Disconnect Handler
  socket.on("disconnect", (reason) => {
    console.log(`❌ User disconnected: ${socket.id} Reason: ${reason}`);
    io.emit("user-disconnected", { socketId: socket.id });
  });
});

// Health check endpoint for Render
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Convene Server Running" });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});