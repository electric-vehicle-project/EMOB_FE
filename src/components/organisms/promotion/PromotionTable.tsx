import { Tag, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { TablePaginationConfig } from "antd";
import type { TableProps } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import dayjs from "dayjs";

import type { Promotion, PromotionStatus } from "../../../model/Promotion";
import { EMOBTable } from "../../molecules/EMOBTable";
import type { JSX } from "react";

interface Props {
  data: Promotion[];
  loading?: boolean;
  role: "ADMIN" | "EVM_STAFF" | "MANAGER" | "DEALER_STAFF";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onChangeSort: (field?: string, order?: "ascend" | "descend") => void;
  pagination?: TablePaginationConfig;
}

const STATUS_LABELS: Record<PromotionStatus, string> = {
  ACTIVE: "Đang hiệu lực",
  UPCOMING: "Sắp diễn ra",
  EXPIRED: "Đã kết thúc",
  INACTIVE: "Không hoạt động",
};

const SCOPE_LABELS: Record<string, string> = {
  GLOBAL: "Toàn hệ thống",
  LOCAL: "Đại lý",
};

const TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: "Giảm theo %",
  FIXED: "Giảm số tiền",
  FIXED_AMOUNT: "Giảm số tiền",
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

const canEditPromotion = (role: Props["role"]): boolean =>
  role === "ADMIN" || role === "EVM_STAFF";

const canDeletePromotion = (role: Props["role"]): boolean => role === "ADMIN";

export const PromotionTable = ({
  data,
  loading,
  role,
  onEdit,
  onDelete,
  sortField,
  sortDir,
  onChangeSort,
  pagination,
}: Props) => {
  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên chương trình",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: sortField === "name" ? order : null,
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type?: string) =>
        type ? (
          <Tag color="purple">{TYPE_LABELS[type] ?? type}</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      align: "center",
      sorter: true,
      sortOrder: sortField === "value" ? order : null,
      render: (val?: number) =>
        typeof val === "number" ? (
          `${val}%`
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Thời gian áp dụng",
      key: "startDate",
      align: "center",
      sorter: true,
      sortOrder: sortField === "startDate" ? order : null,
      render: (_, record) => {
        const start = dayjs(record.startDate);
        const end = dayjs(record.endDate);

        if (!start.isValid() || !end.isValid()) {
          return <span className="text-gray-400">—</span>;
        }

        return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
      },
    },
    {
      title: "Phạm vi",
      dataIndex: "scope",
      key: "scope",
      align: "center",
      render: (scope: string) => (
        <Tag color={scope === "GLOBAL" ? "geekblue" : "success"}>
          {SCOPE_LABELS[scope]}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status?: PromotionStatus) =>
        status ? (
          <Tag color={getStatusColor(status)}>{STATUS_LABELS[status]}</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  const handleChange: TableProps<Promotion>["onChange"] = (
    _pagination,
    _filters,
    sorter
  ) => {
    const s = Array.isArray(sorter)
      ? sorter[0]
      : (sorter as SorterResult<Promotion>);

    if (!s?.field || !s.order) return;

    onChangeSort(s.field as string, s.order as "ascend" | "descend");
  };

  /** dropdown thao tác */
  const actions =
    role === "DEALER_STAFF" || role === "MANAGER"
      ? undefined
      : (record: Promotion) => {
          const menu: { key: string; label: JSX.Element }[] = [];

          if (canEditPromotion(role)) {
            menu.push({
              key: "edit",
              label: (
                <Button
                  type="link"
                  className="!text-[#627254]"
                  icon={<EditOutlined />}
                  onClick={() => onEdit?.(record.id)}
                >
                  Chỉnh sửa
                </Button>
              ),
            });
          }

          if (canDeletePromotion(role)) {
            menu.push({
              key: "delete",
              label: (
                <Button
                  type="link"
                  className="!text-red-600"
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete?.(record.id)}
                >
                  Xoá
                </Button>
              ),
            });
          }

          return menu;
        };

  return (
    <EMOBTable<Promotion>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={handleChange}
      actions={actions}
    />
  );
};
