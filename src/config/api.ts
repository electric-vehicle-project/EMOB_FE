import { useNavigate } from "react-router-dom";
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  // baseURL: "http://103.200.20.149/:8080/api/",
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // thành công thì trả response như bình thường
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // kiểm tra token hết hạn (401 + message "Expired token!")
    if (
      error.response?.data?.code === 401 &&
      error.response?.data?.message === "Expired token!" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // nếu refresh đang diễn ra, xếp request này vào hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers)
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        // gửi request refresh token
        const res = await axios.post("http://localhost:8080/api/auth/refresh", {
          token: refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } =
          res.data.result;

        // lưu lại token mới
        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // cập nhật header mặc định cho axios
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);

        // gửi lại request cũ
        if (originalRequest.headers)
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);

        // nếu có lỗi thì cho đăng nhập lại
      } catch {
        const navigate = useNavigate();
        toast.error("Phiên đã hết hạn, vui lòng đăng nhập lại!");
        navigate("/auth/login");
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
