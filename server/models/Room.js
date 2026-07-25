import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "Untitled room" },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isLocked: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 12 },
    whiteboardSnapshot: { type: String, default: null }, // last saved canvas state (JSON string)
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
