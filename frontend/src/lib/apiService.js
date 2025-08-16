import useStore from "@/store";
import axios from "axios";
import { toast } from "sonner";
export const BASE_URL = `${import.meta.env.VITE_APP_BASE_URL_V1}`;
import LogoutHelper from "@/utils/LogoutHelper";

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};
// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // Set a timeout if needed
  headers: {
    "Content-Type": "application/json",
    "Device-Platform": "web",
  },
});

// Interceptors to handle request/response logging or error handling
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies
    const token = localStorage.getItem('token') || getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response; // Return the whole response to access headers if needed
  },
  (error) => {
    const { response } = error;

    if ([401, 403, 429].includes(response?.status)) {
      if (response?.data?.message === "Unauthorized") {
        return Promise.reject(error);
      }

      toast.error(
        response?.data?.message ||
          "Session has been expired, please login again"
      );
      //   TODO: handle error for session expiration
      const setIsAuthenticated = useStore.getState().setIsAuthenticated;
      const setUser = useStore.getState().setUser;

      LogoutHelper({ setIsAuthenticated, setUser });
    }
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  get: async (endpoint, config = {}) =>
    axiosInstance.get(endpoint, config).then((response) => response.data),

  post: async (endpoint, data, config = {}) =>
    axiosInstance
      .post(endpoint, data, config)
      .then((response) => response.data),

  put: async (endpoint, data, config = {}) =>
    axiosInstance.put(endpoint, data, config).then((response) => response.data),

  patch: async (endpoint, data, config = {}) =>
    axiosInstance
      .patch(endpoint, data, config)
      .then((response) => response.data),

  delete: async (endpoint, config = {}) =>
    axiosInstance.delete(endpoint, config).then((response) => response.data),
};

export default apiService;
