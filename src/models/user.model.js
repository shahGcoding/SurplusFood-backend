import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // it is bearer token
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "approved", "rejected"],
      default: "active",
    },
    longitude: { 
      type: Number, 
      default: null
     },
    latitude: { 
      type: Number, 
      default: null
    },
    businessName: {
      type: String,
      required: function () {return this.role === "seller"},

    },
    businessAddress: {
        type: String,
        required: function () {return this.role === "seller"},
        
    },
    phone: {
        type: Number,
        required: function () {return this.role === "seller"},
        trim: true,
    },
    password: { 
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password.length < 8) {
    return next(new Error("Password must be at least 8 characters long"));
  }
  this.password = await bcrypt.hash(this.password, 10); // change here in await if error occurs
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,  
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

export const User = mongoose.model("User", userSchema);
