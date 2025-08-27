import { sendVerificationCode, WelcomeEmail } from "../middlewares/email.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Error generating access and refresh tokens:", error);
    throw new ApiError(500, "Internal server error while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    username,
    role,
    businessAddress,
    businessName,
    phone,
    latitude,
    longitude
  } = req.body;

  if (!email || !password || !username || !role) {
    throw new ApiError(400, "All fields are required");
  }

  if (!["buyer", "seller"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be 'buyer' or 'seller'");
  }

  if (role === "seller" && (!businessAddress || !businessName || !phone)) {
    throw new ApiError(400, "Business details are required for sellers");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

  const user = await User.create({
    email,
    password,
    username,
    verificationCode,
    role,
    status: role === "seller" ? "pending" : "active",
    businessAddress: role === "seller" ? businessAddress : undefined,
    businessName: role === "seller" ? businessName : undefined,
    phone: role === "seller" ? phone : undefined,
    latitude,
    longitude,
  });

   sendVerificationCode(user.email, verificationCode);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, {
      _id: createdUser._id,
      email: createdUser.email,
      username: createdUser.username,
      role: createdUser.role,
      isverified: createdUser.isverified,   // IMPORTANT
    }, "User registered successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {

  const {code} = req.body;

  const user = await User.findOne({
    verificationCode: code
  });

  if(!user){
    throw new ApiError(400, "Invalid or Expired Code");
  }

  user.isverified = true;
  user.verificationCode = undefined;
  
  await user.save();
  await WelcomeEmail(user.email, user.username);

  return res
      .status(200)
      .json(new ApiResponse(200, {
    _id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    isverified: user.isverified,
  }, "Email verified successfully"));

})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }

  if( !user.isverified){
    throw new ApiError(401, "Please verify your email !");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});



const logoutUser = asyncHandler(async (req, res) => {
  // Check if req.user exists
  if (!req.user || !req.user._id) {
    // Even if user doesn’t exist, clear cookies
    const options = { httpOnly: true, secure: true };

    return res
      .cookie("accessToken", "", options)
      .cookie("refreshToken", "", options)
      .status(200)
      .json(new ApiResponse(200, null, "User already deleted, cleared session"));
  }

  // If user exists, update refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );

  const options = { httpOnly: true, secure: true };

  return res
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true, // Use secure cookies in production
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message, "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const updateUserData = asyncHandler(async (req, res) => {
  const { userId } = req.params; // /users/:userId
  const updateData = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true } // return updated doc & validate schema
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user fetched successfully"));
});

const getUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(id).select("role");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { role: user.role },
        "User role fetched successfully"
      )
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

export {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserData,
  getUserById,
  getUserRole,
  getAllUsers,
};
