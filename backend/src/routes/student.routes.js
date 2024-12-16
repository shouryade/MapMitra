import express from "express";
import pkg from "express-openid-connect";
import {
  googleAuthCallback,
  completeProfile,
  createNewRide,
  getRideStatus,
  getAutoAvailability,
} from "../controllers/student.controllers.js";

const router = express.Router();

const { requiresAuth } = pkg;

// router.get("/callback", requiresAuth(), googleAuthCallback);
// router.post("/complete-profile", requiresAuth(), completeProfile);
router.post("/new-ride", createNewRide);
router.get("/get-status/:requestID", getRideStatus);
router.get("/get-auto-available/:x/:y", getAutoAvailability);

export default router;
