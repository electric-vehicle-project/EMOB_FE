import { Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { Link } from "react-router-dom"

export const ForgetPasswordForm = () => {
  return (
    <Form layout="vertical" className="space-y-8">
      <div className="h-12 ">
        <InputField placeholder="Email" />
      </div>

      <div className="h-12">
        <Link to="/auth/forget-password-otp"><ButtonPrimary>Gửi OTP</ButtonPrimary></Link>
      </div>

      <div className="flex justify-center">
        <Link to="/auth/login" className="text-sm text-[#627254]">Đăng nhập</Link>
      </div>

    </Form>
  );
};
