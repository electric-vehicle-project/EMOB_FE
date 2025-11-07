import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const FindFreeVehicleButton = ({
  onClick,
  disabled,
  loading,
}: Props) => {
  return (
    <Button
      type="primary"
      icon={<SearchOutlined />}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      style={{
        backgroundColor: disabled ? "#a0a0a0" : "#627254",
        border: "none",
        height: 42,
        width: "100%",
        fontWeight: 500,
        transition: "all 0.2s ease",
      }}
    >
      Tìm xe trống lịch
    </Button>
  );
};