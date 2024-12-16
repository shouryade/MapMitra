import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pkg from "express-openid-connect";
import axios from "axios";
import asyncHandler from "./utils/asyncHandler.js";
const { auth } = pkg;

const app = express();

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH_CLIENT_ID,
  issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
  secret: process.env.AUTH_SECRET,
};

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(auth(config));

// Routers
import studentRouter from "./routes/student.routes.js";
import rideRouter from "./routes/rides.routes.js";

// Routes
app.use("/api/student", studentRouter);
app.use("/api/rides", rideRouter);

app.get(
  "/api/service/health-check",
  asyncHandler(async (req, res) => {
    const response = await axios.get(
      process.env.GO_MICROSERVICE_ENDPOINT + "/health/"
    );
    res.status(response.status).json(response.data);
  })
);

export default app;
