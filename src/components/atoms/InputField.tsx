import { Input } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

type Props = {
  type?: "text" | "password";
  placeholder: string;
};

export const InputField: React.FC<Props> = ({ type = "text", placeholder }) => {
  return type === "password" ? (
    <Input.Password
      prefix={<LockOutlined />}
      placeholder={placeholder}
      size="large"
      className="rounded-full"
    />
  ) : (
    <Input
      prefix={<UserOutlined />}
      placeholder={placeholder}
      size="large"
      className="rounded-full"
    />
  );
};

