import { Checkbox, Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { ButtonGoogle } from "../atoms/ButtonGoogle";

export const LoginForm = () => {
  return (
    <Form layout="vertical" className="space-y-5 lg:space-y-10">
      <div className="h-8 sm:h-9 md:h-10 lg:h-12 ">
        <InputField type="text" placeholder="Tên đăng nhập" />
      </div>

      <div className="h-8 sm:h-9 md:h-10 lg:h-12">
        <InputField type="password" placeholder="Mật khẩu" />
      </div>

      <div className="flex justify-between items-center">
        <Checkbox>Ghi nhớ mật khẩu</Checkbox>
        <a className="text-sm ">Quên mật khẩu?</a>
      </div>

      <div className="h-8 sm:h-9 md:h-10 lg:h-12">
        <ButtonPrimary>Đăng nhập</ButtonPrimary>
      </div>

      <div className="h-8 sm:h-9 md:h-10 lg:h-12">
        <ButtonGoogle />
      </div>
    </Form>
  );
};
