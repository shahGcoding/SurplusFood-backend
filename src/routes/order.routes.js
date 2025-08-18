import {Router} from "express";
import { postOrder, getOrderBySellerId, getOrderByBuyerId, updateOrderStatus, getAllOrders} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


// Create a new router instance
const router = Router();

// Route to create a new order

router.route("/postorder").post(verifyJWT, postOrder)
router.get("/getOrderBySellerId/:sellerId", verifyJWT, getOrderBySellerId);
router.get("/getOrderByBuyerId/:buyerId", verifyJWT, getOrderByBuyerId);
router.put("/updateOrderStatus/:id", verifyJWT, updateOrderStatus);
router.route("/getAllOrders").get(verifyJWT, getAllOrders);




export default router;