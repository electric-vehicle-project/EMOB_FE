/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoginByGoogleMutation } from "../service/authenticationService";

/**
 * Custom hook để xử lý luồng đăng nhập Google
 */
export const useGoogleLogin = () => {
  const { mutate: loginMutation } = useLoginByGoogleMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  /** Bắt đầu quá trình login Google */
  const startGoogleLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (data?.url) {
        const width = 1000;
        const height = 850;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        window.open(
          data.url,
          "GoogleLogin",
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no`
        );
      }
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("Không thể khởi tạo đăng nhập Google");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: any) => {
      // Kiểm tra nguồn gửi có hợp lệ không
      if (event.origin !== window.location.origin) return;

      const { access_token } = event.data;

      // Nếu type là session của Supabase
      if (access_token) {
        console.log("Nhận được session:", access_token);

        loginMutation(
          { token: access_token }, // đây là "variables" gửi lên backend
          {
            onSuccess: (res) => {
              const { token, refreshToken, ...user } = res.data.result;
              localStorage.setItem("token", token);
              localStorage.setItem("refreshToken", refreshToken);

              //lưu thông tin user vào Redux store
              dispatch(login(user));

              //thông báo & điều hướng
              toast.success("Đăng nhập thành công!");
              navigate(`/${user.role.toLowerCase()}`);
            },
            onError: (error) => {
              console.error("Login thất bại:", error);
            },
          }
        );
      }
    };

    window.addEventListener("message", handleMessage);

    // Dọn dẹp
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch, navigate]);

  return { startGoogleLogin, loading };
};
