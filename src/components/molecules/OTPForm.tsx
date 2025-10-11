import { useEffect, useRef, useState } from "react";
import { Form } from "antd";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { useNavigate, useLocation, Link } from "react-router-dom";

export const OTPForm = () => {
  const [form] = Form.useForm();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // mock email

  // --- Đếm ngược thời gian ---
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResendOTP = () => {
    setCountdown(120);
    setCanResend(false);
    //sau này có thể gọi API resend OTP ở đây
  };

  // --- Khi người dùng nhập mỗi ô ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      if (index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      e.target.value = "";
    }

    //cập nhật lại giá trị tổng OTP cho form
    const otp = inputsRef.current.map((input) => input?.value || "").join("");
    form.setFieldValue("otp", otp);
  };

  // --- Khi bấm xác nhận ---
  interface FormValues {
    otp: string;
  }

  const handleConfirm = (values: FormValues) => {
    if (values.otp && values.otp.length === 5) {
      //giả lập thành công
      navigate("/auth/reset-password", { state: { email } });
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleConfirm}
      className="space-y-3"
    >
      {/* --- Nhập mã OTP --- */}
      <Form.Item
        name="otp"
        label="Nhập mã xác thực"
        rules={[
          { required: true, message: "Vui lòng nhập mã OTP" },
          {
            len: 5,
            message: "Mã OTP gồm 5 chữ số",
          },
        ]}
      >
        <div className="flex justify-between px-10 py-2">
          {[0, 1, 2, 3, 4].map((_, index) => (
            <input
              key={index}
              ref={(el) => { inputsRef.current[index] = el }}
              type="text"
              maxLength={1}
              className="w-14 h-14 text-white text-center text-xl bg-[#96a987] rounded-[15px] focus:outline-none"
              onChange={(e) => handleChange(e, index)}
            />
          ))}
        </div>
      </Form.Item>

      {/* --- Nút xác nhận --- */}
      <Form.Item className="!pt-5">
        <Link to="/auth/reset-password">
          <ButtonPrimary>Xác nhận</ButtonPrimary>
        </Link>

      </Form.Item>

      {/* --- Gửi lại OTP và quay về đăng nhập --- */}
      <div className="flex justify-between items-center px-5">
        <p className="text-sm text-[#627254]">
          {canResend ? (
            <>
              Chưa nhận được mã?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                className="cursor-pointer text-[#414d38] font-medium underline"
              >
                Gửi lại
              </button>
            </>
          ) : (
            <>
              Gửi lại OTP sau:{" "}
              <span className="font-semibold">{formatTime(countdown)}</span>
            </>
          )}
        </p>

        <Link to="/auth/login">
          <p className="text-sm text-[#627254] hover:underline">
            Đăng nhập
          </p>
        </Link>
      </div>
    </Form>
  );
};
