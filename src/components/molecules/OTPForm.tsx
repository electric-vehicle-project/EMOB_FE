import { useRef } from "react";
import { Form } from "antd";
import { ButtonPrimary } from "../atoms/ButtonPrimary";

export const OTPForm = () => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      // Move to next box if valid number
      if (index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      e.target.value = ""; // only digits allowed
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <Form layout="vertical" className="space-y-5 ">
      {/* OTP input boxes */}
      <div className="flex justify-between pr-10 pl-10 space-y-5">
        {[0, 1, 2, 3, 4].map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            type="text"
            maxLength={1}
            className="w-15 h-15 text-white text-center text-xl bg-[#96a987] rounded-[15px] !focus:outline-none transition-all duration-150 border-none"
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </div>

      {/* Confirm button */}
      <div className="h-8 sm:h-9 md:h-10 lg:h-12">
        <ButtonPrimary>Xác nhận</ButtonPrimary>
      </div>

      {/* Helper text */}
      <div className="flex justify-between items-center pt-10">
        <p className="text-sm text-[#627254]">
          Chưa nhận được mã? <a className="cursor-pointer text-[#414d38] font-medium">Gửi lại</a>
        </p>
        <a className="text-sm text-[#414d38] font-medium cursor-pointer">Đăng nhập</a>
      </div>
    </Form>
  );
};
