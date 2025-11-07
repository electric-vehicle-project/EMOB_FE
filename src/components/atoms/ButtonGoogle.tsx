
import { Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useGoogleLogin } from "../../hook/useGoogleLogin";

export const ButtonGoogle = () => {
  const { startGoogleLogin, loading } = useGoogleLogin();

  return (
    <Button
      onClick={startGoogleLogin}
      loading={loading}
      className="!h-12 w-full !bg-white !text-[#627254] hover:!bg-[var(--default-color)] hover:!text-white"
      type="default"
    >
      <GoogleOutlined className="text-lg" />
      <p className="font-medium ml-2">Đăng nhập với Google</p>
    </Button>
  );
};
