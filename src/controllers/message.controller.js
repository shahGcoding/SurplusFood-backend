import { Message } from "../models/message.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const postMessage = asyncHandler(async (req, res) => {
  const { sellerId, buyerId, orderId, message } = req.body;

  if (!sellerId || !buyerId || !orderId || !message) {
    throw new ApiError(400, "All fields are required");
  }

  const buyer = await User.findById(buyerId);
  const seller = await User.findById(sellerId);

  if(!buyer || !seller){
    throw new ApiError(404, "Buyer or Seller not found");
  }

  const order = await Order.findById(orderId);

  if(!order){
      throw new ApiError(404, "Order not found");
  }

  const newMessage = await Message.create({
    sellerId,
    buyerId,
    orderId,
    message,
    status: "Unread"
  })
  
  return res
        .status(201)
        .json(new ApiResponse(201, newMessage, "Message sent successfully"));

});

const getMessageForSeller = asyncHandler(async (req, res) => {
    
    const {sellerId} = req.params;

    if(!sellerId){
        throw new ApiError(400, "sellerId is required");    
    }

    const messages = await Message.find({sellerId})
        .populate("buyerId", "username email")
        .populate("orderId", "status totalPrice")
        .sort({createdAt: -1});

    return res
          .status(200)
          .json(new ApiResponse(200, messages, "Messages fetched Successfully"));      

});

const markMessageAsRead = asyncHandler(async(req, res) => {

    const {messageId} = req.params;

    if(!messageId){
        throw new ApiError(400, "MessageId is required");
    }

    const updateMessage = await Message.findByIdAndUpdate(
        messageId,
        { status: "Read" },
        { new: true }
    );

    if(!updateMessage){
        throw new ApiError(404, "Message not found");
    }

    return res
          .status(200)
          .json(new ApiResponse(200, updateMessage, "Message Mark as Read"));  

});


export {postMessage, getMessageForSeller, markMessageAsRead }
