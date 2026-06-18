import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  address: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending",
  },
  rejectionReason: {
    type: String,
    default: "",
  },

  approvedAt: {
    type: Date,
  },

  rejectedAt: {
    type: Date,
  },
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  stripeSessionId: String,
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
    
  }
});

export const Booking = mongoose.model('Booking', bookingSchema);
