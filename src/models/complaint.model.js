import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({

    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
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
    messageBy: {
        type: mongoose.Schema.Types.String,
        ref: "User",
        required: true,
    }



}, { timestamps: true });

export const Complaint = mongoose.model("Complaint", complaintSchema);