import axios from "axios";

const api = axios.create({
  // baseURL: "http://103.200.20.149/:8080/api/",
  baseURL: "http://localhost:8080/api",
});

// let refreshTimer: number | null = null;
// let isRefreshing = false;

api.interceptors.request.use(function (config) {
  // Do something before request is sent
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
  
// async function refreshOnce() {
//   const refreshToken = localStorage.getItem("refreshToken");
//   if (!refreshToken) {
//     stopTokenAutoRefresh();
//     return;
//   }

//   try {
//     // Backend expects { token: <refreshToken> }
//     const res = await api.post("/auth/refresh", { token: refreshToken });

//     // Server trả về dạng wrapper có result.token & result.refreshToken (xem Swagger)
//     const newToken = res.data.result.token;
//     const newRefresh = res.data.result.refreshToken;

//     if (newToken) localStorage.setItem("token", newToken);
//     if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
//   } catch {
//     // Không còn hợp lệ / account DEACTIVE / đã logout
//     stopTokenAutoRefresh();
//     localStorage.removeItem("token");
//     localStorage.removeItem("refreshToken");
//   }
//   // Các lỗi khác có thể giữ nguyên để lần sau thử lạisa
// }

// export function startTokenAutoRefresh() {
//   if (refreshTimer !== null) return; // đã chạy ở tab này

//   // Chạy đồng bộ 1 lần để cập nhật token nếu đã hết hạn
//   void refreshOnce();

//   refreshTimer = window.setInterval(async () => {
//     if (isRefreshing) return;
//     isRefreshing = true;
//     try {
//       await refreshOnce();
//     } finally {
//       isRefreshing = false;
//     }
//   }, 3 * 60 * 1000); // 3 phút
// }

// export function stopTokenAutoRefresh() {
//   if (refreshTimer !== null) {
//     clearInterval(refreshTimer);
//     refreshTimer = null;
//   }
// }

export default api;
