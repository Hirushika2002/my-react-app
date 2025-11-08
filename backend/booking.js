import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    guestName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, enum: ["confirmed", "checked-in", "checked-out", "cancelled"], default: "confirmed" },
    notes: { type: String },
    // associate booking with a user (optional)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // which hotel this booking belongs to (optional for now)
  hotelId: { type: mongoose.Schema.Types.Mixed },
    // payment metadata
    payment: {
      status: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
      provider: { type: String },
      providerId: { type: String },
      receiptUrl: { type: String }
    },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
