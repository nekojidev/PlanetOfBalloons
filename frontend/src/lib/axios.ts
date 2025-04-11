import axios from "axios";

// Create axios instance with the correct configuration for cross-domain requests
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }
});

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Axios error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default axiosInstance;

