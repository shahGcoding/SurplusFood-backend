import { Order } from "../models/order.model.js";
import { Food } from "../models/food.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const postOrder = asyncHandler(async (req, res) => {
  const { foodId, buyerId, quantity, paymentMethod, deliveryMethod } = req.body;

  if (!foodId || !buyerId || !quantity || !paymentMethod) {
    throw new ApiError(400, "All fields are required");
  }

  const food = await Food.findById(foodId);
  if (!food) {
    throw new ApiError(404, "Food item not found");
  }

  // Calculate price and commission
  const totalPrice = food.price * quantity;
  const comissionRate = 0.1;
  const comission = totalPrice * comissionRate;

  
  const order = await Order.create({
    foodId,
    sellerId: food.userId,
    buyerId,
    deliveryMethod: deliveryMethod || "online-delivery",
    quantity,
    totalPrice,
    paymentMethod: paymentMethod || "cash on delivery",
    comission,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});


const getOrderBySellerId = asyncHandler(async (req, res) => {
  const sellerId = req.user._id; // from auth middleware

  const orders = await Order.find({ sellerId })
    .populate("foodId", "title price")
    .populate("buyerId", "username email");

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found for this seller");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});


const getOrderByBuyerId = asyncHandler(async (req, res) => {
  const buyerId = req.user._id; // from auth middleware

  const orders = await Order.find({ buyerId })
    .populate("foodId", "title price")
    .populate("sellerId", "username email");

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found for this buyer");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});


const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "No order found");
  }

  // Only seller can update their order
  if (order.sellerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this order");
  }

  order.status = status;

  if (status === "Delivered") {
    order.comission = (order.totalPrice * 10) / 100; // 10% commission
    order.deliveredAt = new Date();
    order.comissionPaid = false;
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});


const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("foodId", "title price")
    .populate("buyerId", "username email")
    .populate("sellerId", "username email");

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "All orders retrieved successfully"));
});

export {
  postOrder,
  getOrderBySellerId,
  getOrderByBuyerId,
  updateOrderStatus,
  getAllOrders,
};
