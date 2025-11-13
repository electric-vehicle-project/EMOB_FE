import { Button } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

interface Props {
  size?: number;
}

export const EllipsisButton = ({ size = 22 }: Props) => {
  return (
    <Button
      type="text"
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        boxShadow: "none",
        padding: 0,
      }}
      icon={<EllipsisOutlined style={{ fontSize: size }} />}
    />
  );
};
