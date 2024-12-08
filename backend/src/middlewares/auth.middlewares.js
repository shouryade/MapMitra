import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.models.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized");
  }

  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  const foundUser = await User.findById(decodedToken.id).select(
    "-refreshToken"
  );

  if (!foundUser) {
    throw new ApiError(401, "Invalid access token");
  }

  req.user = foundUser;

  next();
});

export default verifyJWT;
