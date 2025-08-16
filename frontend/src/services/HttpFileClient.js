import axios from 'axios';

const unauthorizedCode = [401];

const BASE_URL = 'http://localhost:3000/api/v1';

const HttpFileClient = axios.create({
  timeout: 60000,
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Device-Platform': 'web',
  },
});

HttpFileClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
HttpFileClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && unauthorizedCode.includes(response?.status)) {
      // store.dispatch(logOutSuccess());
    }
    return Promise.reject(error);
  }
);

export default HttpFileClient;
