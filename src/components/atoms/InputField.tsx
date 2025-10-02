import { Input } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

type Props = {
  type?: "text" | "password";
  placeholder: string;
};

export const InputField: React.FC<Props> = ({ type = "text", placeholder }) => {
  return type === "password" ? (
    <Input.Password
      className="!h-full w-full"
      prefix={<LockOutlined />}
      placeholder={placeholder}

    />
  ) : (
    <Input
      className="!h-full w-full"
      prefix={<UserOutlined />}
      placeholder={placeholder}

    />
  );
};

