import { Food } from "../models/food.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const createFoodPost = asyncHandler(async (req, res) => {
  const { title, content, price, quantity, status, featuredImage } = req.body;

  if (!title || !content || price == null || quantity == null) {
    throw new ApiError(400, "All fields are required");
  }

  if (!featuredImage) {
    throw new ApiError(400, "Image is required");
  }

  // const featuredImageLocalPath = req.file?.path;
  // if (!featuredImageLocalPath) {
  //   throw new ApiError(400, "Image is required");
  // }

  // const featuredImage = await uploadOnCloudinary(featuredImageLocalPath);
  // if (!featuredImage?.url) {
  //   throw new ApiError(400, "Image upload failed");
  // }

  const food = await Food.create({
    title,
    content,
    featuredImage,
    status: status || "active",
    price,
    quantity,
    userId: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, food, "Food post created successfully"));
});

const updateFoodPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let food = await Food.findById(id);
  if (!food) throw new ApiError(404, "Food post not found");

  if (food.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to update this food post");
  }

  // If image is updated
  if (req.file?.path) {
    const featuredImage = await uploadOnCloudinary(req.file.path);
    if (featuredImage?.url) {
      updates.featuredImage = featuredImage.url;
    }
  }

  food = await Food.findByIdAndUpdate(id, updates, { new: true });

  return res
    .status(200)
    .json(new ApiResponse(200, food, "Food post updated successfully"));
});

const deleteFoodPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const food = await Food.findById(id);
  if (!food) throw new ApiError(404, "Food post not found");

  if (food.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to delete this food post");
  }

  await food.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Food post deleted successfully"));
});

const getFoodPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const food = await Food.findById(id).populate("userId", "name email");
  if (!food) throw new ApiError(404, "Food post not found");

  return res
    .status(200)
    .json(new ApiResponse(200, food, "Food post fetched successfully"));
});

// const getAllFoodPosts = asyncHandler(async (req, res) => {
//   const foods = await Food.find({ status: "active" }).populate(
//     "userId",
//     "name email"
//   );
//   return res
//     .status(200)
//     .json(new ApiResponse(200, foods, "Food posts fetched successfully"));
// });

const getAllFoodPosts = asyncHandler(async (req, res) => {
  const { location, price, quantity } = req.query;

  let query = { status: "active" };

  if (location) query.location = { $regex: location, $options: "i" };
  if (price) query.price = { $lte: Number(price) };
  if (quantity) query.quantity = { $gte: Number(quantity) };

  const foods = await Food.find(query).populate("userId", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, foods, "Food posts fetched successfully"));
});

const getFoodPostsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const foods = await Food.find({ userId }).populate("userId", "name email");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        foods,
        `Food posts for user ${userId} fetched successfully`
      )
    );
});

const getAllFoodPostsForAdmin = asyncHandler(async (req, res) => {
  const foods = await Food.find().populate("userId", "name email");
  return res
    .status(200)
    .json(new ApiResponse(200, foods, "All food posts fetched successfully"));
});

const getSellerFoodPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const foods = await Food.find({ userId });
  return res
    .status(200)
    .json(
      new ApiResponse(200, foods, "Seller food posts fetched successfully")
    );
});

const getFilteredFoodPosts = asyncHandler(async (req, res) => {
  const filters = req.body; // Example: { status: "active", price: { $lte: 500 } }
  const foods = await Food.find(filters).populate("userId", "name email");
  return res
    .status(200)
    .json(new ApiResponse(200, foods, "Filtered food posts fetched"));
});

const getListingsBySeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const foods = await Food.find({ userId: sellerId });
  return res
    .status(200)
    .json(
      new ApiResponse(200, foods, "Listings by seller fetched successfully")
    );
});

const getListingByAllSeller = asyncHandler(async (req, res) => {
  const foods = await Food.find().populate("userId", "name email");
  return res
    .status(200)
    .json(new ApiResponse(200, foods, "Listings by all sellers fetched"));
});

const uploadFile = asyncHandler(async (req, res) => {
  const localFilePath = req.file?.path;

  if (!req.file) {
    throw new ApiError(400, "No file provided");
  }

  const uploadedFile = await uploadOnCloudinary(localFilePath);

  if (!uploadedFile?.secure_url) {
    throw new ApiError(500, "File upload failed");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { url: uploadedFile.secure_url, public_id: uploadedFile.public_id },
        "File uploaded successfully"
      )
    );
});

const deleteFile = asyncHandler(async (req, res) => {
  const { public_id } = req.body; // Cloudinary requires public_id, not just URL

  if (!public_id) {
    throw new ApiError(400, "public_id is required for deletion");
  }

  const deleted = await deleteFromCloudinary(public_id);

  if (deleted.result !== "ok") {
    throw new ApiError(500, "File deletion failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "File deleted successfully"));
});

export {
  createFoodPost,
  updateFoodPost,
  deleteFoodPost,
  getFoodPostById,
  getAllFoodPosts,
  getFoodPostsByUser,
  getAllFoodPostsForAdmin,
  getSellerFoodPosts,
  getFilteredFoodPosts,
  getListingsBySeller,
  getListingByAllSeller,
  uploadFile,
  deleteFile,
};
