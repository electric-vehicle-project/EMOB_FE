import { Checkbox, Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { ButtonGoogle } from "../atoms/ButtonGoogle";

export const LoginForm = () => {
  return (
    <Form layout="vertical" className="space-y-10">
      <InputField placeholder="Tên đăng nhập"/>
      <InputField type="password" placeholder="Mật khẩu"/>

      <div className="flex justify-between items-center">
        <Checkbox>Ghi nhớ mật khẩu</Checkbox>
        <a className="text-sm text-green-700">Quên mật khẩu?</a>
      </div>

      <ButtonPrimary>Đăng nhập</ButtonPrimary>
      <ButtonGoogle />
    </Form>
  );
};
