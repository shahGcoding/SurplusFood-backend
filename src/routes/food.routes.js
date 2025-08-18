import { Router } from "express";
import {
  createFoodPost,
  updateFoodPost,
  deleteFoodPost,
  getAllFoodPosts,
  getFoodPostById,
  getAllFoodPostsForAdmin,
  getSellerFoodPosts,
  getFilteredFoodPosts,
  getListingByAllSeller,
  getListingsBySeller,
} from "../controllers/food.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/foodpost").post(
  verifyJWT,
  upload.fields([
    {
      name: "featuredImage",
      maxCount: 1,
    },
  ]),
  createFoodPost
);

router.route("/updatefoodpost/:id").put(
  verifyJWT,
  upload.fields([
    {
      name: "featuredImage",
      maxCount: 1,
    },
  ]),
  updateFoodPost
);

router.route("/deletefoodpost/:id").delete(verifyJWT, deleteFoodPost);
router.route("/getallfoodposts").get(verifyJWT, getAllFoodPosts);
router.route("/getfoodpostbyid/:id").get(verifyJWT, getFoodPostById);

router.route("/getallfoodpostsforadmin").get(verifyJWT, getAllFoodPostsForAdmin);
router.route("/getsellerfoodposts/:userId").get(verifyJWT, getSellerFoodPosts);
router.route("/getfilteredfoodposts").get(verifyJWT, getFilteredFoodPosts);
router.route("/getlistingbyallseller").get(verifyJWT, getListingByAllSeller);
router.route("/getlistingsbyseller/:userId").get(verifyJWT, getListingsBySeller);

export default router;
