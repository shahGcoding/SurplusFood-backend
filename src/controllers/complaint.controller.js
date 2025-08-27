import { Complaint } from "../models/complaint.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const postComplaint = asyncHandler(async (req, res) => {
  const { sellerId, buyerId, orderId, message, messageBy } = req.body;

  if (!sellerId || !message || !messageBy) {
    throw new ApiError(400, "All fields are required");
  }

  const seller = await User.findById(sellerId);

  if (!seller) {
    throw new ApiError(404, "Seller and buyer not found");
  }

  const complaint = await Complaint.create({
    sellerId,
    buyerId,
    orderId,
    message,
    status: "Unresolved",
    messageBy,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, "Complaint post successfully"));
}); 

const getAllComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.find()
    .populate("buyerId", "username email")
    .populate("sellerId", "username email")
    .populate("orderId");

  if (!complaint) {
    throw new ApiError(404, "complaints not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, "Complaints fetched succefully"));
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Resolved", "Unresolved"].includes(status)) {
    throw new ApiError(400, "Status must be Resolved or Unresolved");
  }

  const updateComplaint = await Complaint.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!updateComplaint) {
    throw new ApiError(404, "Complaint not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateComplaint, "Complaint status updated"));
});

const deleteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleteComplaint = await Complaint.findByIdAndDelete(id);

  if (!deleteComplaint) {
    throw new ApiError(404, "Complaint not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deleteComplaint, "Complaint deleted successfully")
    );
});

export {
  postComplaint,
  getAllComplaint,
  updateComplaintStatus,
  deleteComplaint,
};
