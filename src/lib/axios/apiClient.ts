import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  AxiosHeaders,
} from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  console.log("[Request]", config.url, config.method);

  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  if (isFormData) {
    headers.delete("Content-Type");
  } else {
    headers.set("Content-Type", "application/json");
  }

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
    } else if (error.response?.status === 500) {
      console.error("서버 내부 오류:", error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
