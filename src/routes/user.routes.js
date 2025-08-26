import {Router} from "express";
import { registerUser, loginUser, logoutUser, getCurrentUser, updateUserData, refreshAccessToken, getUserById, getAllUsers, getUserRole } from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";


// Create a new router instance
const router = Router();

//router.route("/register").post(registerUser); // or 
router.post("/register", registerUser);
router.route("/login").post(loginUser);

// secure/protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/getcurrentuser").get(verifyJWT, getCurrentUser);
router.route("/updateuserdata/:id").put(verifyJWT, updateUserData);
router.route("/getuserbyid/:id").get(verifyJWT, getUserById);
router.route("/getuserrole/:id/role").get(verifyJWT, getUserRole);
router.route("/getallusers").get(verifyJWT, getAllUsers);


export default router;
