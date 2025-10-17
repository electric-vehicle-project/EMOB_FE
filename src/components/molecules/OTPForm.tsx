import { useEffect, useRef, useState } from "react";
import { Form } from "antd";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useVerifyOtpMutation } from "../../service/authenticationService";
import { ROUTES } from "../../model/routePaths";
import { toast } from "react-toastify";

export const OTPForm = () => {
  const [form] = Form.useForm();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // mock email


  // --- Countdown ---
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
    setOtp(["", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  };

  // --- Handle input change ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto focus next
    if (index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // auto validate
    if (newOtp.join("").length === 5) {
      form.validateFields(["otp"]);
    }
  };

  // --- Handle Backspace ---
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      // Nếu ô hiện tại rỗng → focus về trước
      if (!newOtp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        newOtp[index - 1] = ""; // Xóa ô trước luôn nếu cần
        setOtp(newOtp);
      } else {
        // Xóa ký tự hiện tại
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };


  const otpValue = otp.join("");
  const { mutate: verifyOtpMutation } = useVerifyOtpMutation(otpValue);

  // --- Submit ---
  const handleConfirm = () => {

    if (otpValue.length !== 5) {
      toast.warning("Mã OTP phải gồm 5 chữ số");
      return;
    }

    verifyOtpMutation(
      { email }, // body JSON
      {
        onSuccess: (res: any) => {
          const token = res?.data?.result?.token;
          if (token) {
            localStorage.setItem("token", token);
            toast.success("Xác thực OTP thành công!");
            navigate(ROUTES.RESET_PASSWORD, { state: { token } });
          } else {
            toast.error("Phản hồi không hợp lệ từ server!");
          }
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.toast || "Mã OTP không hợp lệ hoặc đã hết hạn!";
          toast.error(msg);
        },
      },
    );
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
      {/* OTP Inputs */}
      <Form.Item
        name="otp"
        rules={[
          {
            validator: () => {
              const otpValue = otp.join("");
              if (!otpValue) return Promise.reject("Vui lòng nhập mã OTP");
              if (otpValue.length !== 5)
                return Promise.reject("Mã OTP gồm 5 chữ số");
              return Promise.resolve();
            },
          },
        ]}
      >
        <div className="flex justify-between px-10 py-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputsRef.current[index] = el }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-14 text-white text-center text-xl bg-[#96a987] rounded-[15px] focus:outline-none"
            />
          ))}
        </div>
      </Form.Item>

      {/* Confirm Button */}
      <Form.Item className="!pt-5">
        <ButtonPrimary className="!h-12 w-full" htmlType="submit">
          Xác nhận
        </ButtonPrimary>
      </Form.Item>

      {/* Resend OTP & Login link */}
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
          <p className="text-sm text-[#627254] hover:underline">Đăng nhập</p>
        </Link>
      </div>
    </Form>
  );
};
