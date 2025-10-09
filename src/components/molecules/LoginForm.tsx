import { Checkbox, Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { ButtonGoogle } from "../atoms/ButtonGoogle";
import { Link } from "react-router-dom";

export const LoginForm = () => {
  return (
    <Form layout="vertical" className="space-y-5">
      <div className="h-12 ">
        <InputField type="text" placeholder="Tên đăng nhập" />
      </div>

      <div className="h-12">
        <InputField type="password" placeholder="Mật khẩu" />
      </div>

      <div className="flex justify-between items-center">
        <Checkbox className="text-[#627254]">Ghi nhớ mật khẩu</Checkbox>
        <Link to="/auth/forget-password" className="text-sm text-[#627254]">Quên mật khẩu?</Link>
      </div>

      <div className="h-12">
        <ButtonPrimary>Đăng nhập</ButtonPrimary>
      </div>

      <div className="h-12">
        <ButtonGoogle />
      </div>
    </Form>
  );
};
