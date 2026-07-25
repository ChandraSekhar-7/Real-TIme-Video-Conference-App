import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { requireAuth } from "../middleware/auth.js";
import Room from "../models/Room.js";
import Message from "../models/Message.js";
import { encryptText, decryptText } from "../utils/encryption.js";

const router = Router();
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Block executable/script types outright; everything else capped at 25MB
const BLOCKED_EXT = new Set([".exe", ".bat", ".sh", ".cmd", ".msi", ".js", ".jar"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid(12)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (BLOCKED_EXT.has(ext)) {
      return cb(new Error("This file type is not allowed for security reasons"));
    }
    cb(null, true);
  },
});

router.use(requireAuth);

router.post("/:roomCode", upload.single("file"), async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.roomCode.toLowerCase() });
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const message = await Message.create({
      room: room._id,
      sender: req.user.id,
      senderName: req.user.name,
      cipherText: encryptText(`shared a file: ${req.file.originalname}`),
      type: "file",
      fileMeta: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });

    res.status(201).json({
      message: {
        id: message._id,
        senderName: message.senderName,
        text: decryptText(message.cipherText),
        type: "file",
        fileMeta: message.fileMeta,
        createdAt: message.createdAt,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Upload failed" });
  }
});

router.get("/download/:storedName", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, path.basename(req.params.storedName));
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });
  res.download(filePath);
});

export default router;
