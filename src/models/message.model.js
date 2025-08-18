import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

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
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["Unread", "Read"],
        default: "Unread",
    },


}, { timestamps: true });


export const Message = mongoose.model("Message", messageSchema);