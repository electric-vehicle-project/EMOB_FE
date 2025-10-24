import { Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { supabase } from "../../config/supabase";

export const ButtonGoogle = () => {
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // hoặc route bạn muốn sau khi login
      },
    });

    if (error) {
      console.error("Google login error:", error);
    } else {
      console.log("Redirecting to Google OAuth:", data);
    }
  };
  return (
    <>
      <Button
        onClick={handleGoogleLogin}
        className="!h-12 w-full !bg-white !text-[#627254] hover:!bg-[var(--default-color)]  hover:!text-white"
        type="default"
      >
        <GoogleOutlined className="text-lg" />

        <p className="font-medium">Đăng nhập với Google</p>
      </Button>

    </>
  );
};
