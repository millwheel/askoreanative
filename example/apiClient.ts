import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  withCredentials: false,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    if (isTokenExpired(accessToken)) {
      clearTokens();
      return Promise.reject(new axios.Cancel("access token expired"));
    }
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  console.log("[Request]", config.url, config.method);
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("[Response]", response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn(error.response?.data);
      console.warn("인증 없음.");
      clearTokens();
    } else if (error.response?.status === 500) {
      console.error("서버 내부 오류:", error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
