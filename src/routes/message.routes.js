import { Router } from "express";
import {
  postMessage,
  getMessageForSeller,
  markMessageAsRead,
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/postmessage").post(verifyJWT, postMessage);
router.route("/getmessageforseller/:sellerId").get(verifyJWT, getMessageForSeller);
router.route("/markmessageasread/:messageId").put(verifyJWT, markMessageAsRead);

export default router;
