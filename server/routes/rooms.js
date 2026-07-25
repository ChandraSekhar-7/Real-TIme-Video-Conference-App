import { Router } from "express";
import { customAlphabet } from "nanoid";
import Room from "../models/Room.js";
import Message from "../models/Message.js";
import { requireAuth } from "../middleware/auth.js";
import { decryptText } from "../utils/encryption.js";

const router = Router();
const genCode = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 4);

function makeRoomCode() {
  return `${genCode()}-${genCode()}-${genCode()}`;
}

router.use(requireAuth);

// Create a new room, owned by the current user
router.post("/", async (req, res) => {
  const { name, maxParticipants } = req.body;
  let code = makeRoomCode();
  // extremely unlikely collision, but guard anyway
  while (await Room.findOne({ code })) code = makeRoomCode();

  const room = await Room.create({
    code,
    name: name?.trim() || "Untitled room",
    host: req.user.id,
    maxParticipants: maxParticipants || 12,
  });

  res.status(201).json({ room });
});

// Look up a room by its shareable code before joining
router.get("/:code", async (req, res) => {
  const room = await Room.findOne({ code: req.params.code.toLowerCase() }).populate(
    "host",
    "name"
  );
  if (!room) return res.status(404).json({ message: "Room not found" });
  res.json({ room });
});

// Encrypted chat history, decrypted just before it leaves the server
router.get("/:code/messages", async (req, res) => {
  const room = await Room.findOne({ code: req.params.code.toLowerCase() });
  if (!room) return res.status(404).json({ message: "Room not found" });

  const messages = await Message.find({ room: room._id }).sort({ createdAt: 1 }).limit(200);
  res.json({
    messages: messages.map((m) => ({
      id: m._id,
      senderName: m.senderName,
      text: decryptText(m.cipherText),
      type: m.type,
      fileMeta: m.fileMeta,
      createdAt: m.createdAt,
    })),
  });
});

export default router;
