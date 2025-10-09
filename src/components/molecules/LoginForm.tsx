import { Checkbox, Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { ButtonGoogle } from "../atoms/ButtonGoogle";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username && password) {
      // Giả lập login thành công
      navigate("/dashboard");
    }
  };

  return (
    <Form layout="vertical" className="space-y-5">
      <div className="h-12">
        <InputField
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="h-12">
        <InputField
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center">
        <Checkbox className="text-[#627254]">Ghi nhớ mật khẩu</Checkbox>
        <button
          onClick={() => navigate("/auth/forget-password")}
          className="text-sm text-[#627254]"
        >
          Quên mật khẩu?
        </button>
      </div>

      <div className="h-12">
        <ButtonPrimary onClick={handleLogin}>Đăng nhập</ButtonPrimary>
      </div>

      <div className="h-12">
        <ButtonGoogle />
      </div>
    </Form>
  );
};
