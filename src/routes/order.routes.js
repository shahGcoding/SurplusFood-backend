import {Router} from "express";
import { postOrder, getOrderBySellerId, getOrderByBuyerId, updateOrderStatus, updateCommissionStatus, getAllOrders} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


// Create a new router instance
const router = Router();

// Route to create a new order

router.route("/postorder").post(verifyJWT, postOrder)
router.get("/getorderbysellerid/:sellerId", verifyJWT, getOrderBySellerId);
router.get("/getorderbybuyerid/:buyerId", verifyJWT, getOrderByBuyerId);
router.put("/updateorderstatus/:id", verifyJWT, updateOrderStatus);
router.put("/updatecommisionstatus/:id", verifyJWT, updateCommissionStatus);
router.route("/getallorders").get(verifyJWT, getAllOrders);




export default router;