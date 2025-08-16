import { Router } from "express";
import { createFoodPost, getAllFoodPosts, getFoodPostById, updateFoodPost, deleteFoodPost, getSellerFoodPosts } from "../controllers/food.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();

router.route("/foodpost").post(
    verifyJWT,
    upload.fields([
        {
            name: "featuredImage",
            maxCount: 1
        }
    ]),
    createFoodPost
)



export default router;