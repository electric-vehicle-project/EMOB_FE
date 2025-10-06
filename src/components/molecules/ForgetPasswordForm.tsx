import { Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";

export const ForgetPasswordForm = () => {
  return (
    <Form layout="vertical" className="space-y-5 lg:space-y-8">
      <div className="h-8 sm:h-9 md:h-10 lg:h-12 ">
        <InputField placeholder="Email" />
      </div>

      <div className="h-8 sm:h-9 md:h-10 lg:h-12">
        <ButtonPrimary>Gửi OTP</ButtonPrimary>
      </div>

      <div className="flex justify-center">
        <a className="text-sm ">Đăng nhập</a>
      </div>

    </Form>
  );
};
