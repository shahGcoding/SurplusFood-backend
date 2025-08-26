import { Router } from "express";
import {
  createFoodPost,
  updateFoodPost,
  deleteFoodPost,
  getAllFoodPosts,
  getFoodPostById,
  getFoodPostsByUser,
  getAllFoodPostsForAdmin,
  getSellerFoodPosts,
  getFilteredFoodPosts,
  getListingByAllSeller,
  getListingsBySeller,
  uploadFile,
  deleteFile
} from "../controllers/food.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/uploadfile").post(verifyJWT, upload.single("featuredImage"), uploadFile);
router.route("/deletefile").delete(verifyJWT, deleteFile);

router.route("/foodpost").post(verifyJWT, createFoodPost);
router.route("/updatefoodpost/:id").put(verifyJWT, upload.single("featuredImage"), updateFoodPost);

router.route("/deletefoodpost/:id").delete(verifyJWT, deleteFoodPost);
router.route("/getallfoodposts").get(getAllFoodPosts);
router.route("/getfoodpostbyid/:id").get(getFoodPostById);
router.route("/getfoodpostsbyuser/:userId").get(verifyJWT, getFoodPostsByUser);

router
  .route("/getallfoodpostsforadmin")
  .get(verifyJWT, getAllFoodPostsForAdmin);
router.route("/getsellerfoodposts").get(verifyJWT, getSellerFoodPosts);
router.route("/getfilteredfoodposts").get(verifyJWT, getFilteredFoodPosts);
router.route("/getlistingbyallseller").get(verifyJWT, getListingByAllSeller);
router
  .route("/getlistingsbyseller/:sellerId")
  .get(verifyJWT, getListingsBySeller);

export default router;
