import axios from "axios";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createNewRide = asyncHandler(async (req, res) => {
  const { requestID, level, pickup } = req.body;
  const response = await axios.post(
    process.env.GO_MICROSERVICE_ENDPOINT + "/rides/new",
    {
      requestID,
      level,
      pickup,
    }
  );
  res
    .status(response.status)
    .json(new ApiResponse(response.status, response.data));
});

export const getRideStatus = asyncHandler(async (req, res) => {
  const { requestID } = req.params;
  const response = await axios.get(
    process.env.GO_MICROSERVICE_ENDPOINT + `/rides/status/${requestID}`
  );
  res
    .status(response.status)
    .json(new ApiResponse(response.status, response.data));
});

export const getAutoAvailability = asyncHandler(async (req, res) => {
  const { x, y } = req.params;
  const response = await axios.get(
    process.env.GO_MICROSERVICE_ENDPOINT + `/rides/available/${x}/${y}`
  );
  res
    .status(response.status)
    .json(new ApiResponse(response.status, response.data));
});
