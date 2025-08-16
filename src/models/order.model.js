import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Delivered"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      default: "cash on delivery",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    comissionPaid: {
      type: Boolean,
      default: false,
    },
    comission: {
      type: Number,
      default: 0,
    },
    deliveryMethod: {
      type: String,
      enum: ["online-delivery", "self-pickup"],
      default: "online-delivery",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
