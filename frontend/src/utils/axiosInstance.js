import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://glts.shouryadoes.tech",
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Log the request data
    console.log("Request JSON:", config.data); // Logs the request payload
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
