import { Form } from "antd";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { InputField } from "../atoms/InputField";

export const OTPForm = () => {
  return (
    <Form layout="vertical" className="space-y-5 lg:space-y-8">
      <div className="h-8 sm:h-9 md:h-10 lg:h-12 ">
        <InputField placeholder="OTP" />
      </div>

      <div className="h-8 sm:h-9 md:h-10 lg:h-12">
        <ButtonPrimary>Xác nhận</ButtonPrimary>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-[#627254]">Chưa nhận được mã? <a>Gửi lại</a></p>
        <a className="text-sm ">Đăng nhập</a>
      </div>

    </Form>
  );
};
