import { Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const ForgetPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSendOTP = () => {
    if (email) {
      // Sau này có thể mock gửi OTP API
      navigate("/auth/forget-password-otp", { state: { email } });
    }
  };

  return (
    <Form layout="vertical" className="space-y-8">
      <div className="h-12">
        <InputField
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="h-12">
        <ButtonPrimary onClick={handleSendOTP}>Gửi OTP</ButtonPrimary>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate("/auth/login")}
          className="text-sm !text-[#627254] hover:underline"
        >
          Đăng nhập
        </button>
      </div>
    </Form>
  );
};
