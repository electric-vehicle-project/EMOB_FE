import axios from "axios";

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

const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return;

  try {
    const response = await api.post("/auth/refresh", { token: refreshToken });
    const { token: newToken, refreshToken: newRefresh } = response.data.result;

    if (newToken && newRefresh) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefresh);
    }
  } catch (err) {
    console.error("Refresh token failed:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
};

//auto gọi refresh mỗi 3 phút
setInterval(refreshToken, 3 * 60 * 1000);

export default api;
