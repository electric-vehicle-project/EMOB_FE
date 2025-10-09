import { useEffect, useRef, useState } from "react";
import { Form } from "antd";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { Link } from "react-router-dom";

export const OTPForm = () => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(120); // 2 phút = 120 giây
  const [canResend, setCanResend] = useState(false);

  // --- Hook: Tự động đếm ngược ---
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // --- Xử lý khi click Gửi lại ---
  const handleResendOTP = () => {
    setCountdown(120); // reset lại 2 phút
    setCanResend(false);
    // 🧠 tại đây bạn có thể thêm logic gọi API resend OTP sau này
  };

  // --- Điều hướng giữa các ô OTP ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      if (index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      e.target.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // --- Hàm hiển thị thời gian (mm:ss) ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Form layout="vertical" className="space-y-3">
      {/* OTP input boxes */}
      <div className="flex justify-between px-10 pb-10">
        {[0, 1, 2, 3, 4].map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el }}
            type="text"
            maxLength={1}
            className="w-14 h-14 text-white text-center text-xl bg-[#96a987] rounded-[15px] focus:outline-none transition-all duration-150 border-none"
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </div>

      {/* Confirm button */}
      <div className="h-10 sm:h-12">
        <ButtonPrimary>Xác nhận</ButtonPrimary>
      </div>

      {/* Helper text + resend */}
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

        <Link to="/auth/login" className="text-sm text-[#627254] hover:underline">
          Đăng nhập
        </Link>
      </div>
    </Form>
  );
};
