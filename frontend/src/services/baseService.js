import axios from 'axios';
import { APIS } from '@/constants/api.constant';



import { toast } from 'sonner';
const unauthorizedCode = [401, 403];

export const BaseUrl = `${import.meta.env.VITE_APP_BASE_URL_V1}`;

const AxiosInstance = axios.create({
    timeout: 60000,
    baseURL: BaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Device-Platform': 'web',
    },
});

// Helper function to get cookie value
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

AxiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage or cookies
        const token = localStorage.getItem('token') || getCookie('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Adding auth token to request:", config.url);
        } else {
            console.warn("No auth token found for request:", config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
AxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        // Don't show error for 404 (not found) as it's not an auth issue
        if (response?.status !== 404) {
            response?.data?.message &&
                toast.error(response?.data?.message || 'Something went wrong');
        }

        const isOtpVerificationError = response?.config?.url?.includes(
            APIS?.VERIFYOTP
        );
        
        // Only logout for actual authentication errors, not data not found
        if (
            response &&
            unauthorizedCode.includes(response?.status) &&
            !isOtpVerificationError &&
            response?.status !== 404
        ) {
            console.log("Authentication error, redirecting to login");
            
            // Check if this is an edit operation that failed
            const isEditOperation = response?.config?.url?.includes('/edit') || 
                                  response?.config?.url?.includes('/:id') ||
                                  response?.config?.method === 'patch' ||
                                  response?.config?.method === 'put';
            
            if (isEditOperation) {
                console.log("Edit operation failed, not logging out automatically");
                toast.error("Edit operation failed. Please check your permissions or try again.");
            } else {
                setTimeout(() => {
                    window.location.href = '/login';
                }, 100);
            }
        }
        return Promise.reject(error);
    }
);

export default AxiosInstance;
