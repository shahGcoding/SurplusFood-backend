import {Router} from "express";
import { registerUser, verifyEmail, loginUser, logoutUser, getCurrentUser, updateUserData, refreshAccessToken, getUserById, getAllUsers, getUserRole, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";


// Create a new router instance
const router = Router();

//router.route("/register").post(registerUser); // or 
router.post("/register", registerUser);
router.post('/verifyemail', verifyEmail);
router.route("/login").post(loginUser);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);

// secure/protected routes
router.route("/logout").post(logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/getcurrentuser").get(verifyJWT, getCurrentUser);
router.route("/updateuserdata/:userId").put(verifyJWT, updateUserData);
router.route("/getuserbyid/:id").get(verifyJWT, getUserById);
router.route("/getuserrole/:id/role").get(verifyJWT, getUserRole);
router.route("/getallusers").get(verifyJWT, getAllUsers);


export default router;
