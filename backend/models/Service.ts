import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true ,min: 20 },
  duration: String,
  image: String,
  location: { type: String, required: true, default: "Global" },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
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
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

serviceSchema.set("toJSON", {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Service = mongoose.model("Service", serviceSchema);
