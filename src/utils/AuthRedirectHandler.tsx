import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

/**
 * ✅ AuthRedirectHandler
 * Tự động kiểm tra token + refreshToken + user trong Redux
 * Nếu hợp lệ → điều hướng đến trang tương ứng với role.
 */
export const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (token && refreshToken && user?.role) {
      const rolePath = `/${user.role.toLowerCase().replaceAll("_", "-")}`;

      // ✅ Chỉ redirect nếu đang ở trang login hoặc root
      if (location.pathname === "/" || location.pathname === "/login") {
        navigate(rolePath, { replace: true });
      }
    }
  }, [navigate, location, user]);

  return null;
};
