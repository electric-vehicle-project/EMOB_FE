import { Tag } from "antd";

export const TestDriveStatusTag = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    PENDING: "gold",
    CONFIRMED: "blue",
    COMPLETED: "green",
    CANCELLED: "red",
  };
  return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
};
