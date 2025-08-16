import {Router} from "express";
import { postOrder, getOrderBySellerId, getOrderByBuyerId, updateOrderStatus} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


// Create a new router instance
const router = Router();

// Route to create a new order
router.route("/postorder").post(verifyJWT, postOrder)


router.get("/getOrderBySellerId", getOrderBySellerId);
router.get("/getOrderByBuyerId", getOrderByBuyerId);
router.put("/updateOrderStatus/:id", updateOrderStatus);


export default router;