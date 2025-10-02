import { Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";

export const ButtonGoogle = () => (
  <Button className="!h-full w-full" type="default">
    <GoogleOutlined />
    <p className="">Đăng nhập với Google</p>
  </Button>
);
