import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://httpbin.org", 
});

export default axiosInstance;
