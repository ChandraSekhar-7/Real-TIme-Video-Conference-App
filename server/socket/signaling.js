import { verifyToken } from "../middleware/auth.js";
import Room from "../models/Room.js";
import Message from "../models/Message.js";
import { encryptText, decryptText } from "../utils/encryption.js";

// roomCode -> Map<socketId, { userId, name, avatarColor }>
const presence = new Map();

function getRoomMembers(roomCode) {
  const map = presence.get(roomCode);
  return map ? Array.from(map.entries()).map(([socketId, u]) => ({ socketId, ...u })) : [];
}

export function registerSignaling(io) {
  // Every socket connection must present a valid JWT, same as REST routes.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const user = verifyToken(token);
      socket.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    let currentRoom = null;

    socket.on("room:join", async ({ roomCode, avatarColor }) => {
      currentRoom = roomCode;
      socket.join(roomCode);

      if (!presence.has(roomCode)) presence.set(roomCode, new Map());
      presence.get(roomCode).set(socket.id, {
        userId: socket.user.id,
        name: socket.user.name,
        avatarColor: avatarColor || "#F0A868",
      });

      // Tell the newcomer who's already here, so they can initiate WebRTC offers
      const existingMembers = getRoomMembers(roomCode).filter((m) => m.socketId !== socket.id);
      socket.emit("room:existing-members", existingMembers);

      // Tell everyone else a new peer has arrived
      socket.to(roomCode).emit("room:member-joined", {
        socketId: socket.id,
        userId: socket.user.id,
        name: socket.user.name,
        avatarColor: avatarColor || "#F0A868",
      });

      await Room.findOneAndUpdate({ code: roomCode }, { lastActiveAt: new Date() });
    });

    // ---- WebRTC signaling relay (mesh topology) ----
    socket.on("webrtc:offer", ({ to, offer }) => {
      io.to(to).emit("webrtc:offer", { from: socket.id, offer });
    });
    socket.on("webrtc:answer", ({ to, answer }) => {
      io.to(to).emit("webrtc:answer", { from: socket.id, answer });
    });
    socket.on("webrtc:ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("webrtc:ice-candidate", { from: socket.id, candidate });
    });

    // ---- Media state (mute/camera/screen-share badges) ----
    socket.on("media:state", ({ roomCode, micOn, camOn, sharingScreen }) => {
      socket.to(roomCode).emit("media:state", { socketId: socket.id, micOn, camOn, sharingScreen });
    });

    // ---- Whiteboard: broadcast draw events + persist periodic snapshots ----
    socket.on("whiteboard:draw", ({ roomCode, stroke }) => {
      socket.to(roomCode).emit("whiteboard:draw", stroke);
    });
    socket.on("whiteboard:clear", ({ roomCode }) => {
      socket.to(roomCode).emit("whiteboard:clear");
    });
    socket.on("whiteboard:save", async ({ roomCode, snapshot }) => {
      await Room.findOneAndUpdate({ code: roomCode }, { whiteboardSnapshot: snapshot });
    });

    // ---- Chat (encrypted at rest) ----
    socket.on("chat:message", async ({ roomCode, text }) => {
      const room = await Room.findOne({ code: roomCode });
      if (!room) return;
      const message = await Message.create({
        room: room._id,
        sender: socket.user.id,
        senderName: socket.user.name,
        cipherText: encryptText(text),
        type: "text",
      });
      io.to(roomCode).emit("chat:message", {
        id: message._id,
        senderName: message.senderName,
        text: decryptText(message.cipherText),
        type: "text",
        createdAt: message.createdAt,
      });
    });

    // ---- File-share notification (upload itself goes over REST) ----
    socket.on("chat:file-shared", ({ roomCode, message }) => {
      socket.to(roomCode).emit("chat:message", message);
    });

    // ---- Emoji reactions (floating burst, non-persistent) ----
    socket.on("reaction:send", ({ roomCode, emoji }) => {
      io.to(roomCode).emit("reaction:receive", { emoji, socketId: socket.id, name: socket.user.name });
    });

    // ---- Raised hand ----
    socket.on("hand:toggle", ({ roomCode, raised }) => {
      socket.to(roomCode).emit("hand:toggle", { socketId: socket.id, raised });
    });

    function leaveRoom() {
      if (!currentRoom) return;
      const map = presence.get(currentRoom);
      if (map) {
        map.delete(socket.id);
        if (map.size === 0) presence.delete(currentRoom);
      }
      socket.to(currentRoom).emit("room:member-left", { socketId: socket.id });
      currentRoom = null;
    }

    socket.on("room:leave", leaveRoom);
    socket.on("disconnect", leaveRoom);
  });
}
