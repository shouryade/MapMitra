import express from "express";
import pkg from "express-openid-connect";

const router = express.Router();

const { requiresAuth } = pkg;

// router.get("/callback", requiresAuth(), googleAuthCallback);
// router.post("/complete-profile", requiresAuth(), completeProfile);

export default router;
