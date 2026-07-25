import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import fileRoutes from "./routes/files.js";
import { registerSignaling } from "./socket/signaling.js";

const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
  maxHttpBufferSize: 1e7,
});

// ---- Security middleware ----
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(mongoSanitize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/auth", authLimiter);

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/files", fileRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "convene-server" }));

registerSignaling(io);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`[server] Convene API on :${PORT}`));
  })
  .catch((err) => {
    console.error("[db] connection failed:", err.message);
    console.error("\nThe server needs a working MongoDB connection to start.");
    console.error("Check your server/.env MONGO_URI value, and confirm MongoDB");
    console.error("is running (local) or reachable (Atlas: DNS/network/IP whitelist).\n");
    process.exit(1);
  });