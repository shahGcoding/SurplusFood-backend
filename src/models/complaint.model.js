import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Unresolved", "Resolved"],
      default: "Unresolved",
    },
    messageBy: { type: String, enum: ["buyer", "seller"], required: true },
  },
  { timestamps: true }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
