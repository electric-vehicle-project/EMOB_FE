import { useEffect, useState } from "react";
import { Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { useNavigate } from "react-router-dom";

export const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  // --- Kiểm tra khớp mật khẩu theo thời gian thực ---
  useEffect(() => {
    if (confirmPwd && password !== confirmPwd) {
      setError("Mật khẩu xác nhận không khớp");
    } else {
      setError("");
    }
  }, [password, confirmPwd]);

  // --- Khi nhấn nút đổi mật khẩu ---
  const handleSubmit = () => {
    if (!error && password && confirmPwd) {
      setSuccess(true);
      // Bắt đầu đếm ngược 5s trước khi redirect
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      setTimeout(() => {
        clearInterval(interval);
        navigate("/auth/login");
      }, 5000);
    }
  };


  return (
    <Form layout="vertical" className="space-y-6 pt-8">
      {/* Input mật khẩu mới */}
      <div className="h-12">
        <InputField
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Input xác nhận mật khẩu */}
      <div className="h-12">
        <InputField
          type="password"
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
        />
      </div>

      {/* Hiển thị lỗi */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Nút đổi mật khẩu */}
      
      <div  className="h-12">
        <ButtonPrimary
          onClick={handleSubmit}
        >
          Đổi mật khẩu
        </ButtonPrimary>
      </div>

      {/* Thông báo thành công */}
      {success && (
        <div className="text-[#627254] text-center font-medium pt-2">
          <p>Đổi mật khẩu thành công! </p>
          <p>  Chuyển hướng về trang đăng nhập sau{" "}
          <span className="font-semibold">{countdown}</span> giây...</p>
        </div>
      )}
    </Form>
  );
};
