import { Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const ForgetPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  // --- Kiểm tra định dạng email ---
  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // định dạng chuẩn RFC 5322
    return regex.test(value);
  };

  // --- Theo dõi thay đổi của email để hiện lỗi real-time ---
  useEffect(() => {
    if (!email) {
      setError("Email không được để trống");
      setIsValid(false);
    } else if (!validateEmail(email)) {
      setError("Định dạng email không hợp lệ");
      setIsValid(false);
    } else {
      setError("");
      setIsValid(true);
    }
  }, [email]);

  // --- Xử lý gửi OTP ---
  const handleSendOTP = () => {
    if (isValid) {
      navigate("/auth/forget-password-otp", { state: { email } });
    }
  };

  return (
    <Form layout="vertical" className="space-y-6">
      <div className="h-12">
        <InputField
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Hiển thị lỗi */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Nút gửi OTP */}
      <div className="h-12">
        <ButtonPrimary
          onClick={handleSendOTP}
          disabled={!isValid}
        >
          Gửi OTP
        </ButtonPrimary>
      </div>

      {/* Liên kết trở về đăng nhập */}
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
