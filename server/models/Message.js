import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    // stored AES-encrypted; decrypted just-in-time for API responses
    cipherText: { type: String, required: true },
    type: { type: String, enum: ["text", "file", "system"], default: "text" },
    fileMeta: {
      originalName: String,
      storedName: String,
      mimeType: String,
      size: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
