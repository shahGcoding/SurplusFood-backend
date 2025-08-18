import Router from "express";
import { postComplaint, getAllComplaint, updateComplaintStatus, deleteComplaint } from "../controllers/complaint.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/postcomplaint").post(verifyJWT, postComplaint);
router.route("/getallcomplaint").get(verifyJWT, getAllComplaint);
router.route("/updatecomplaintstatus/:id").put(verifyJWT, updateComplaintStatus);
router.route("/deletecomplaint/:id").delete(verifyJWT, deleteComplaint);


export default router;