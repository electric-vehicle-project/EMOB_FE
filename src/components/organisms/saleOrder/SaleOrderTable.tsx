import { Table, Button, Space, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { SaleOrderResponse } from "../../../model/SaleOrder";
import { SaleOrderStatusTag } from "./SaleOrderStatusTag";

interface Props {
  data: SaleOrderResponse[];
  loading?: boolean;
  canDelete?: boolean;
  canComplete?: boolean;
  onViewDetail?: (id: string) => void;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
}

export const SaleOrderTable: React.FC<Props> = ({
  data,
  loading,
  canDelete,
  canComplete,
  onViewDetail,
  onDelete,
  onComplete,
  onSortChange,
}) => {
  const columns: ColumnsType<SaleOrderResponse> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      sorter: true,
      width: 230, // ✅ giới hạn độ rộng để tránh tràn nút
      ellipsis: true,
      render: (id: string) => (
        <Tooltip title={id}>
          <span className="truncate inline-block max-w-[210px]">{id}</span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      sorter: true,
      width: 150,
      render: (v: string) => (v ? new Date(v).toLocaleString("vi-VN") : "--"),
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      sorter: true,
      width: 100,
    },
    {
      title: "Tổng tiền (VNĐ)",
      dataIndex: "totalPrice",
      sorter: true,
      width: 130,
      render: (v: number) => (v?.toLocaleString("vi-VN") ?? "0") + " VNĐ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      filters: [
        { text: "Đã tạo", value: "CREATED" },
        { text: "Hoàn tất", value: "COMPLETED" },
        { text: "Đã hủy", value: "CANCELED" },
      ],
      width: 130,
      render: (_, r) => <SaleOrderStatusTag status={r.status} />,
    },
    {
      title: "Hành động",
      fixed: "right",
      width: 250, // đủ chỗ cho 3 nút
      render: (_, r) => (
        <Space wrap>
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail?.(r.id)}
            className="!border-[#627254]  hover:!border-[#4f6f52] "
          >
            Xem
          </Button>

          {canComplete && r.status === "CREATED" && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => onComplete?.(r.id)}
              className="!bg-[#627254] !border-[#627254] hover:!bg-[#4f6f52] hover:!border-[#4f6f52]"
            >
              Hoàn tất
            </Button>
          )}

          {canDelete && r.status === "CREATED" && (
            <Button
              size="small"
              icon={<StopOutlined />}
              onClick={() => onDelete?.(r.id)}
              className="!bg-[#dc2626] !text-white hover:!bg-[#b91c1c] hover:!text-white !border-none"
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table<SaleOrderResponse>
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={false}
      className="!rounded-xl !bg-white"
      onChange={(pagination, filters, sorter) => {
        if ("field" in sorter && sorter.field && sorter.order) {
          const field = sorter.field as string;
          const order = sorter.order === "ascend" ? "asc" : "desc";
          onSortChange?.(field, order);
        }
      }}
    />
  );
};
