import { Router } from "express";
import {
  createNewRide,
  getAutoAvailability,
  getRideStatus,
} from "../controllers/rides.controllers.js";

const router = Router();

router.post("/new", createNewRide);
router.get("/status/:requestID", getRideStatus);
router.get("/available/:x/:y", getAutoAvailability);

export default router;
