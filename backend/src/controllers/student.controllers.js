import User from "../models/User.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import axios from "axios";

export const googleAuthCallback = asyncHandler(async (req, res) => {
  const { sub: googleId, name, email } = req.oidc.user;

  if (!email.endsWith("@thapar.edu")) {
    throw new ApiError(403, "Only @thapar.edu emails are allowed.");
  }

  let user = await User.findOne({ googleId });
  if (!user) {
    user = new User({ googleId, name, email, phone: null, role: "student" });
    await user.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          "Registration successful. Please complete your profile."
        )
      );
  }

  if (!user.phone) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Please complete your profile."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Logged in successfully."));
});

export const completeProfile = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new ApiError(400, "Phone number is required.");
  }

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new ApiError(409, "Phone number already in use.");
  }

  const user = await User.findOne({ googleId: req.oidc.user.sub });
  if (!user) {
    throw new ApiError(404, "Student not found.");
  }

  user.phone = phone;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile completed successfully."));
});

export const createNewRide = asyncHandler(async (req, res) => {
  const { requestID, level, pickup } = req.body;
  // console.log(requestID, level, pickup);
  const response = await axios.post(
    process.env.GO_MICROSERVICE_ENDPOINT + "/rides/new",
    {
      requestID,
      level,
      pickup,
    }
  );
  res.status(response.status).json(response.data);
});

export const getRideStatus = asyncHandler(async (req, res) => {
  const { requestID } = req.params;
  const response = await axios.get(
    process.env.GO_MICROSERVICE_ENDPOINT + `/status/${requestID}`
  );
  res.status(response.status).json(response.data);
});

export const getAutoAvailability = asyncHandler(async (req, res) => {
  const { x, y } = req.body;
  const response = await axios.get(
    process.env.GO_MICROSERVICE_ENDPOINT + `/available/${x}/${y}`
  );
  res.status(response.status).json(response.data);
});
