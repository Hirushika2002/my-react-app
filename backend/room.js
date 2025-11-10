import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ["available", "occupied", "maintenance"], default: "available" },
    amenities: { type: [String], default: [] },
    description: { type: String },
    images: { type: [String], default: [] },
    capacity: { type: Number, default: 2 },
    ownerNotes: { type: String }
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
