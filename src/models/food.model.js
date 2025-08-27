import mongoose from "mongoose";


const foodSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    featuredImage: {
        type: String,
        required: true,
    },
    status: {
        type: String,   
        enum: ["active", "inactive"],
        default: "active",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    }

},{timestamps: true});


export const Food = mongoose.model("Food", foodSchema);