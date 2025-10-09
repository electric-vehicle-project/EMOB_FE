import { useEffect, useRef, useState } from "react";
import { Form } from "antd";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { useNavigate, useLocation } from "react-router-dom";

export const OTPForm = () => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "user@example.com"; // mock

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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      if (index < inputsRef.current.length - 1)
        inputsRef.current[index + 1]?.focus();
    } else e.target.value = "";
  };

  const handleConfirm = () => {
    // mock OTP success
    navigate("/auth/reset-password", { state: { email } });
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <Form layout="vertical" className="space-y-3">
      <div className="flex justify-between px-10 pb-10">
        {[0, 1, 2, 3, 4].map((_, index) => (
          <input
            key={index}
            ref={(el) => {inputsRef.current[index] = el}}
            type="text"
            maxLength={1}
            className="w-14 h-14 text-white text-center text-xl bg-[#96a987] rounded-[15px] focus:outline-none"
            onChange={(e) => handleChange(e, index)}
          />
        ))}
      </div>

      <div className="h-12">
        <ButtonPrimary onClick={handleConfirm}>Xác nhận</ButtonPrimary>
      </div>

      <div className="flex justify-between items-center pt-6">
        <p className="text-sm text-[#627254]">
          {canResend ? (
            <>
              Chưa nhận được mã?{" "}
              <button
                onClick={handleResendOTP}
                className="cursor-pointer text-[#414d38] font-medium underline"
              >
                Gửi lại
              </button>
            </>
          ) : (
            <>Gửi lại OTP sau: <span className="font-semibold">{formatTime(countdown)}</span></>
          )}
        </p>

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
