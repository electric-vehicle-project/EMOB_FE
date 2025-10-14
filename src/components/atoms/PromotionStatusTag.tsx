import { Tag } from "antd";
import type { PromotionStatus } from "../../model/Promotion";

export default function PromotionStatusTag({
  status,
}: {
  status: PromotionStatus;
}) {
  const map: Record<PromotionStatus, string> = {
    ACTIVE: "success",
    INACTIVE: "default",
    UPCOMING: "warning",
    EXPIRED: "error",
  };
  return <Tag color={map[status]}>{status}</Tag>;
}
