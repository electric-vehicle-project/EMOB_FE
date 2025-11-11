import { Segmented, Typography, Space } from "antd";

interface Props {
  counts: { all: number; active: number; upcoming: number; expired: number };
  defaultScope: "LOCAL" | "GLOBAL";
  onScopeChange: (s: "LOCAL" | "GLOBAL") => void;
}

export const PromotionFilterBar = ({
  counts,
  defaultScope,
  onScopeChange,
}: Props) => {
  const { Text } = Typography;

  const options = [
    { label: `Cục bộ (${counts.all})`, value: "LOCAL" },
    { label: `Toàn hệ thống (${counts.all})`, value: "GLOBAL" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginBottom: 20,
        gap: 10,
      }}
    >
      <Text strong style={{ color: "#627254" }}>
        Phạm vi hiển thị:
      </Text>

      <Space wrap>
        <Segmented
          options={options}
          value={defaultScope}
          onChange={(val) => onScopeChange(val as "LOCAL" | "GLOBAL")}
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            padding: "4px 8px",
          }}
        />
      </Space>
    </div>
  );
};
