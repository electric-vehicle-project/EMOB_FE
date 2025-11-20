// src/components/organisms/promotion/PromotionTable.tsx
import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TablePaginationConfig } from "antd";
import dayjs from "dayjs";

import type {
  Promotion,
  PromotionStatus,
  PromotionType,
} from "../../../model/Promotion";
import { EMOBTable } from "../../molecules/EMOBTable";

interface Props {
  data: Promotion[];
  loading?: boolean;
  role: "ADMIN" | "EVM_STAFF" | "MANAGER" | "DEALER_STAFF";
  userDealerId?: string;

  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;

  onChangeSort?: (field?: string, order?: "ascend" | "descend") => void;

  pagination?: TablePaginationConfig;
}

/* ======================
   LABELS
====================== */

const STATUS_LABELS: Record<PromotionStatus, string> = {
  ACTIVE: "Đang hiệu lực",
  UPCOMING: "Sắp diễn ra",
  EXPIRED: "Đã kết thúc",
  INACTIVE: "Không hoạt động",
};

const TYPE_LABELS: Record<PromotionType, string> = {
  PERCENTAGE: "Giảm theo %",
  FIXED_AMOUNT: "Giảm số tiền cố định",
  POINT: "Tặng điểm thưởng",
};

const getStatusColor = (status: PromotionStatus): string => {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "UPCOMING":
      return "blue";
    case "EXPIRED":
      return "red";
    case "INACTIVE":
      return "volcano";
    default:
      return "default";
  }
};

// ADMIN luôn được xoá.
// MANAGER được xoá khuyến mãi LOCAL của đại lý mình.
const canDeletePromotion = (
  role: Props["role"],
  record: Promotion,
  userDealerId?: string
): boolean => {
  if (role === "ADMIN") return true;

  if (role === "MANAGER" && record.scope === "LOCAL") {
    if (!userDealerId) return false;
    const dealers = record.dealerIds ?? [];
    return dealers.includes(userDealerId);
  }

  return false;
};

// ADMIN / EVM_STAFF chỉnh sửa tất cả.
// MANAGER và DEALER_STAFF chỉ được chỉnh sửa LOCAL của đại lý mình.
const canEditPromotion = (
  role: Props["role"],
  record: Promotion,
  userDealerId?: string
): boolean => {
  if (role === "ADMIN" || role === "EVM_STAFF") return true;

  if (role === "MANAGER" || role === "DEALER_STAFF") {
    if (!userDealerId) return false;
    const dealers = record.dealerIds ?? [];
    return record.scope === "LOCAL" && dealers.includes(userDealerId);
  }

  return false;
};

/* ======================
   COMPONENT
====================== */

export const PromotionTable = ({
  data,
  loading,
  role,
  userDealerId,
  onEdit,
  onDelete,
  onView,
  onChangeSort,
  pagination,
}: Props) => {
  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên chương trình",
      dataIndex: "name",
      key: "name",
      width: 220,
      ellipsis: true,
      render: (text: string, record: Promotion) => (
        <div
          className="font-medium text-[#4f6f52] hover:text-[#627254] cursor-pointer truncate"
          onClick={() => onView?.(record.id)}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      align: "center",
      width: 140,
      render: (type?: PromotionType) =>
        type ? (
          <Tag color="purple">{TYPE_LABELS[type]}</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      align: "center",
      width: 120,
      render: (val: Promotion["value"], record: Promotion) => {
        if (val == null) return <span className="text-gray-400">—</span>;
        if (record.type === "PERCENTAGE") return `${val}%`;
        return `${val.toLocaleString("vi-VN")} ₫`;
      },
    },
    {
      title: "Thời gian áp dụng",
      key: "startDate",
      align: "center",
      width: 210,
      render: (_: unknown, record: Promotion) => {
        const start = dayjs(record.startDate);
        const end = dayjs(record.endDate);

        if (!start.isValid() || !end.isValid()) {
          return <span className="text-gray-400">—</span>;
        }

        return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
      },
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 150,
      onHeaderCell: () => ({
        onClick: () => {
          onChangeSort?.("status", undefined);
        },
      }),
      render: (status?: PromotionStatus) =>
        status ? (
          <Tag color={getStatusColor(status)}>{STATUS_LABELS[status]}</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  return (
    <EMOBTable<Promotion>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      actions={(record) => {
        const items = [
          {
            key: "detail",
            label: (
              <div
                className="cursor-pointer"
                onClick={() => onView?.(record.id)}
              >
                Xem chi tiết
              </div>
            ),
          },
        ];

        if (canEditPromotion(role, record, userDealerId)) {
          items.push({
            key: "edit",
            label: (
              <div
                className="cursor-pointer"
                onClick={() => onEdit?.(record.id)}
              >
                Chỉnh sửa
              </div>
            ),
          });
        }

        if (canDeletePromotion(role, record, userDealerId)) {
          items.push({
            key: "delete",
            label: (
              <div
                className="text-red-600 cursor-pointer"
                onClick={() => onDelete?.(record.id)}
              >
                Xoá
              </div>
            ),
          });
        }

        return items;
      }}
    />
  );
};
