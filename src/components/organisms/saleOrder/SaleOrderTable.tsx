import { Table, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { SaleOrderResponse } from "../../../model/SaleOrder";

interface SaleOrderTableProps {
  data: SaleOrderResponse[];
  loading?: boolean;
  showDealerColumn?: boolean;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
}

export const SaleOrderTable: React.FC<SaleOrderTableProps> = ({
  data,
  loading = false,
  showDealerColumn = false,
  onDelete,
  onComplete,
  onViewDetail,
  onSortChange,
}) => {
  const role = useSelector((state: RootState) => (state.user as any)?.role);

  // 🔹 Phân quyền
  const canComplete = role === "EVM_STAFF";
  const canDelete = role === "EVM_STAFF" || role === "DEALER_STAFF";

  // ==========================
  // Table columns
  // ==========================
  const columns: ColumnsType<SaleOrderResponse> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 220,
      ellipsis: true,
      render: (id) => (
        <span className="font-medium text-gray-700">{id.slice(0, 8)}...</span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: true,
      render: (createdAt: string) =>
        dayjs(createdAt).format("HH:mm DD/MM/YYYY"),
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 130,
      sorter: true,
      align: "center",
      render: (qty) => <span>{qty}</span>,
    },
    {
      title: "Tổng tiền (VAT)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 180,
      sorter: true,
      align: "center",
      render: (price: number) => (
        <span>{price?.toLocaleString("vi-VN")} ₫</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 150,
      filters: [
        { text: "Đã tạo", value: "CREATED" },
        { text: "Hoàn tất", value: "COMPLETED" },
        { text: "Đã huỷ", value: "CANCELED" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        let color = "default";
        let text = "";
        switch (status) {
          case "CREATED":
            color = "blue";
            text = "Đã tạo";
            break;
          case "COMPLETED":
            color = "green";
            text = "Hoàn tất";
            break;
          case "CANCELED":
            color = "red";
            text = "Đã huỷ";
            break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 220,
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail?.(record.id)}
          >
            Xem
          </Button>

          {canComplete && record.status === "CREATED" && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => onComplete?.(record.id)}
            >
              Hoàn tất
            </Button>
          )}

          {canDelete && record.status === "CREATED" && (
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => onDelete?.(record.id)}
            >
              Huỷ
            </Button>
          )}
        </div>
      ),
    },
  ];

  // ==========================
  // Table render
  // ==========================
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      bordered={false}
      onChange={(pagination, filters, sorter: any) => {
        if (onSortChange && sorter.field && sorter.order) {
          const order = sorter.order === "ascend" ? "asc" : "desc";
          onSortChange(sorter.field, order);
        }
      }}
      className="shadow-sm rounded-lg"
    />
  );
};

export default SaleOrderTable;
