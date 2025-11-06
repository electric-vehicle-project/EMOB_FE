import { useEffect, useState } from "react";
import { Button, message } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { supabase } from "../../config/supabase";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ButtonGoogle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // 👈 callback mới
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(
          data.url,
          "GoogleLogin",
          "width=600,height=700,left=400,top=100"
        );
      }
    } catch (err) {
      console.error("Google login error:", err);
      message.error("Không thể khởi tạo đăng nhập Google");
    } finally {
      setLoading(false);
    }
  };

  // Nhận message từ popup sau khi đăng nhập thành công
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_SIGNED_IN") {
        try {
          const session = await supabase.auth.getSession();
          const googleToken = session.data.session?.access_token;
          console.log({googleToken});
          

          if (!googleToken) {
            message.error("Không tìm thấy token Google");
            return;
          }

          const res = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: googleToken }),
          });

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
          message.error("Đăng nhập Google thất bại");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch, navigate]);

  return (
    <Button
      onClick={handleGoogleLogin}
      loading={loading}
      className="!h-12 w-full !bg-white !text-[#627254] hover:!bg-[var(--default-color)] hover:!text-white"
      type="default"
    >
      <GoogleOutlined className="text-lg" />
      <p className="font-medium ml-2">Đăng nhập với Google</p>
    </Button>
  );
};
