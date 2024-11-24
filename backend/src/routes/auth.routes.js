import express from "express";
import verifyJWT from "../middlewares/auth.middlewares.js";
import {
  googleAuth,
  googleAuthCallback,
  handleOAuth,
  completeProfile,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback, handleOAuth);
router.post("/complete-profile", verifyJWT, completeProfile);

export default router;
