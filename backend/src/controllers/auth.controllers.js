import passport from "passport";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.models.js";

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/login",
});

export const handleOAuth = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Authentication failed");
  }

  if (!user.phone) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { requiresProfileCompletion: true },
          "Profile completion required"
        )
      );
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { accessToken, user }, "Logged in successfully")
    );
});

export const completeProfile = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const user = req.user;

  if (!phone) {
    throw new ApiError(400, "Phone number is required to complete the profile");
  }

  const existingUser = await User.findOne({ phone });
  if (existingUser && existingUser._id.toString() !== user._id.toString()) {
    throw new ApiError(409, "Phone number is already in use");
  }

  user.phone = phone;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile completed successfully"));
});
