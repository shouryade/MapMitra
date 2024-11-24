import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const googleOAuthCallback = asyncHandler(async (req, res) => {
  const { googleId, name, email } = req.body;

  if (!email.endsWith("@thapar.edu")) {
    throw new ApiError(403, "Only @thapar.edu email addresses are allowed");
  }

  let user = await User.findOne({ googleId });

  if (!user) {
    user = new User({
      googleId,
      name,
      email,
      phone: null,
      role: "student",
    });
    await user.save();
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

export const firebaseAuthCallback = asyncHandler(async (req, res) => {
  const { phone, role, name } = req.body;

  if (!phone || !role || !name) {
    throw new ApiError(400, "Phone, role, and name are required");
  }

  if (!["visitor", "driver"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  let user = await User.findOne({ phone });

  if (!user) {
    user = new User({
      phone,
      name,
      role,
    });
    await user.save();
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

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile retrieved successfully"));
});

export const updateUserDetails = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = req.user;

  if (name) user.name = name;
  if (phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      throw new ApiError(409, "Phone number is already in use");
    }
    user.phone = phone;
  }

  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  user.refreshToken = null;
  await user.save();
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});
