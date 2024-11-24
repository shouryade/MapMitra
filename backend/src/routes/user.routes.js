import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  googleOAuthCallback,
  firebaseAuthCallback,
  getUserProfile,
  updateUserDetails,
  logoutUser,
} from "../controllers/user.controllers.js";
import { completeProfile } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/auth/google/callback", googleOAuthCallback);
router.post("/auth/firebase/callback", firebaseAuthCallback);
router.post("/logout", verifyJWT, logoutUser);
router.get("/profile", verifyJWT, getUserProfile);
router.put("/profile", verifyJWT, updateUserDetails);
router.post("/profile/complete", verifyJWT, completeProfile);

export default router;
