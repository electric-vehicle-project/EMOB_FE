import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * Custom hook để xử lý luồng đăng nhập Google
 */
export const useGoogleLogin = () => {
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

      //   if (data?.url) {
      //     window.open(
      //       data.url,
      //       "GoogleLogin",
      //       "width=600,height=700,left=400,top=100"
      //     );
      //   }

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
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_SIGNED_IN") {
        try {
          const session = await supabase.auth.getSession();
          const googleToken = session.data.session?.access_token;

          if (!googleToken) {
            toast.error("Không tìm thấy token Google");
            return;
          }

          const res = await fetch(
            `${import.meta.env.VITE_BASE_URL}/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: googleToken }),
            }
          );

          if (!res.ok) throw new Error("Xác thực Google thất bại");
          const data = await res.json();
          const user = data.result;

          localStorage.setItem("token", user.token);
          localStorage.setItem("refreshToken", user.refreshToken);
          dispatch(login(user));

          toast.success("Đăng nhập Google thành công!");
          navigate(`/${user.role.toLowerCase()}`);
        } catch (error) {
          console.error("Error handling Google login:", error);
          toast.error("Đăng nhập Google thất bại");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch, navigate]);

  return { startGoogleLogin, loading };
};
