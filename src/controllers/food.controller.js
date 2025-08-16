import { Food } from "../models/food.model.js";
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const createFoodPost = asyncHandler(async (req, res) => {

    const {title, content, price, quantity} = req.body;
    
    if (!title || !content || price == null || quantity == null) {
        throw new ApiError(400, "All fields are required");
    }

    const featuredImageLocalPath = req.files?.featuredImage[0]?.path;
    if (!featuredImageLocalPath) {
        throw new ApiError(400, "Image is required !");
    }

    const featuredImage = await uploadOnCloudinary(featuredImageLocalPath)
    if(!featuredImage){
        throw new ApiError(400, "Image is required");   
    }

    const userId = req.user?._id;

    const food = await Food.create({

        title,
        content,
        featuredImage: featuredImage.url, 
        userId: userId,
        price,
        quantity,
    });

    res
    .status(201)
    .json(new ApiResponse(200, food, "Food post created successfully"));
    
});

const getAllFoodPosts = asyncHandler(async (req, res) => {
    const foods = await Food.find({ status: "active" }).populate("userId", "name email");
    res.json(new ApiResponse(200, foods, "Food posts fetched successfully"));
});


const getFoodPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const food = await Food.findById(id).populate("userId", "name email");
    if (!food) throw new ApiError(404, "Food post not found");
    res.json(new ApiResponse(200, food, "Food post fetched successfully"));
});


const updateFoodPost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, price, quantity, status, featuredImage } = req.body;

    let food = await Food.findById(id);
    if (!food) throw new ApiError(404, "Food post not found");

    if (food.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this food post");
    }

    food.title = title || food.title;
    food.content = content || food.content;
    food.price = price ?? food.price;
    food.quantity = quantity ?? food.quantity;
    food.status = status || food.status;
    food.featuredImage = featuredImage || food.featuredImage;

    await food.save();

    res.json(new ApiResponse(200, food, "Food post updated successfully"));
});



const deleteFoodPost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const food = await Food.findById(id);
    if (!food) throw new ApiError(404, "Food post not found");

    if (food.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this food post");
    }

    await food.deleteOne();
    res.json(new ApiResponse(200, {}, "Food post deleted successfully"));
});


const getSellerFoodPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id; 
    const foods = await Food.find({ userId });
    res.json(new ApiResponse(200, foods, "Seller food posts fetched successfully"));
});



export {createFoodPost, getAllFoodPosts, getFoodPostById, updateFoodPost, deleteFoodPost, getSellerFoodPosts}