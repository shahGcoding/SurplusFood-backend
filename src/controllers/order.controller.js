import {Order} from '../models/order.model.js';
import { Food } from '../models/food.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


const postOrder = asyncHandler(async (req, res) => {
    const { foodId, buyerId, quantity, paymentMethod, deliveryMethod } = req.body;

    if (!foodId || !buyerId || !quantity || !paymentMethod) {
        throw new ApiError(400, "All fields are required");
    }

    const food = await Food.findById(foodId);
    if (!food) {
        throw new ApiError(404, "Food item not found");
    }

    const totalPrice = food.price * quantity;

    const comissionRate = 0.1; // Example commission rate
    const comission = totalPrice * comissionRate;

    const order = await Order.create({
        foodId,
        sellerId: food.userId,
        buyerId,
        deliveryMethod: deliveryMethod || "online-delivery",
        quantity,
        totalPrice,
        paymentMethod: paymentMethod || "cash on delivery",
        comission: comission,
    });

    return res.status(201).json(new ApiResponse(201, order, "Order created successfully"));

});

const getOrderBySellerId = asyncHandler(async (req, res) => {

    if (!sellerId) {
        throw new ApiError(400, "Seller ID is required");
    }

    const orders = await Order.find({ sellerId: req.user?._id })
    .populate('foodId', "title price")
    .populate('buyerId', "username email");

    if (!orders || orders.length === 0) {
        throw new ApiError(404, "No orders found for this seller");
    }

    return res.status(200).json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

const getOrderByBuyerId = asyncHandler(async (req, res) => {

    if (!buyerId) {
        throw new ApiError(400, "Buyer ID is required");
    }

    const orders = await Order.find({ buyerId: req.user?._id })
    .populate('foodId', "title price")
    .populate('sellerId', "username email");

    if (!orders || orders.length === 0) {
        throw new ApiError(404, "No orders found for this buyer");
    }

    return res.status(200).json(new ApiResponse(200, orders, "Orders retrieved successfully"));
})

const updateOrderStatus = asyncHandler(async (req, res) => {

    const {status} = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(403, "No order found")   
    }

    if(order.sellerId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this order");
    }

    order.status = status;

    if (status === "Delivered"){
        order.comission = (order.totalPrice * 10) / 100; // Example commission rate of 10%
        order.deliveredAt = new Date();
        order.comissionPaid = false; // Set to false initially, can be updated later when commission is paid
    }

    await order.save();

    return res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));

})



export {postOrder, getOrderBySellerId, getOrderByBuyerId, updateOrderStatus};