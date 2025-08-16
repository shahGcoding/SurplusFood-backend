import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
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

    const { email, password, username, role, businessAddress, businessName, phone } = req.body;

    if (!email || !password || !username || !role) {
        throw new ApiError(400, "All fields are required");
    }

    if (!["buyer", "seller"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be 'buyer' or 'seller'");
}

    
    if( role === "seller" && (!businessAddress || !businessName || !phone)) {
        throw new ApiError(400, "Business details are required for sellers");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email");
    }

    const user = await User.create({
        email,
        password,
        username,
        role,
        businessAddress: role === "seller" ? businessAddress : undefined,
        businessName: role === "seller" ? businessName : undefined,
        phone: role === "seller" ? phone : undefined,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(404, "User not found");
    }

    return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));

});


const loginUser = asyncHandler(async (req, res) => {

    const {email, password} = req.body

    if( !email || !password) {
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

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

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

    await User.findByIdAndUpdate(req.user._id, { $set: {refreshToken: null} }, { new: true });

    const options = {
        httpOnly: true,
        secure: true,
    };  

    return res
        .cookie("accessToken", "", options)
        .cookie("refreshToken", "", options)
        .status(200)
        .json(new ApiResponse(200, null, "User logged out successfully"));

});


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
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
        
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken}, "Access token refreshed") )
    } catch (error) {
            throw new ApiError(401, error?.message, "Invalid refresh token");
    }

})


export {registerUser, loginUser, logoutUser, refreshAccessToken};   