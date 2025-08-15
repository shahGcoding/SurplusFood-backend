import {Router} from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
//import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";


console.log("registerUser", registerUser);
console.log("loginUser", loginUser);

// Create a new router instance
const router = Router();

//router.route("/register").post(registerUser); // or 
router.post("/register", registerUser);
router.route("/login").post(loginUser);


// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);


export default router;
