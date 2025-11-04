import { Table, Tag, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { EyeOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import type { SaleOrderResponse } from "../../../model/SaleOrder";

interface SaleOrderTableProps {
  data: SaleOrderResponse[];
  loading?: boolean;
  canDelete?: boolean;
  canComplete?: boolean;
  showDealerColumn?: boolean; // ✅ hiển thị cột đại lý khi cần
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
}

export const SaleOrderTable: React.FC<SaleOrderTableProps> = ({
  data,
  loading = false,
  canDelete = false,
  canComplete = false,
  showDealerColumn = false,
  onDelete,
  onComplete,
  onViewDetail,
  onSortChange,
}) => {
  // =============================
  // Columns
  // =============================
  const columns: ColumnsType<SaleOrderResponse> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      align: "left",
      ellipsis: true,
      render: (id) => (
        <span className="font-mono text-[#555]">{id?.slice(0, 22)}...</span>
      ),
      sorter: true,
    },

    showDealerColumn
      ? {
          title: "Đại lý",
          dataIndex: "dealerName",
          key: "dealerName",
          align: "center",
          render: (text) => <span>{text || "—"}</span>,
        }
      : null,

    {
      title: "Tổng SL",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center",
      render: (value) => <span>{value ?? 0}</span>,
    },
    {
      title: "Tổng tiền (VNĐ)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "center",
      render: (price) => (
        <span>{price ? price.toLocaleString("vi-VN") : "0"}</span>
      ),
      sorter: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—",
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const colorMap: Record<string, string> = {
          CREATED: "processing",
          COMPLETED: "success",
          CANCELED: "error",
        };
        const textMap: Record<string, string> = {
          CREATED: "Đang xử lý",
          COMPLETED: "Hoàn tất",
          CANCELED: "Đã hủy",
        };
        return (
          <Tag
            color={colorMap[status] || "default"}
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 500,
              padding: "2px 10px",
              minWidth: 70, // vừa phải, không bó hẹp
              borderRadius: 6,
            }}
          >
            {textMap[status] || status}
          </Tag>
        );
      },
    },

    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small" align="center">
          <Button
            icon={<EyeOutlined />}
            onClick={() => onViewDetail?.(record.id)}
            size="small"
            type="primary"
            style={{ display: "flex", alignItems: "center" }}
          >
            Xem
          </Button>

          {canComplete && record.status === "CREATED" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onComplete?.(record.id)}
              size="small"
              style={{ display: "flex", alignItems: "center" }}
            >
              Hoàn tất
            </Button>
          )}

          {canDelete && record.status === "CREATED" && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete?.(record.id)}
              size="small"
              style={{ display: "flex", alignItems: "center" }}
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ].filter(Boolean) as ColumnsType<SaleOrderResponse>;

  // =============================
  // Sort handler
  // =============================
  const handleChange = (_: any, __: any, sorter: any) => {
    if (sorter?.order) {
      const order = sorter.order === "ascend" ? "asc" : "desc";
      onSortChange?.(sorter.field, order);
    } else {
      onSortChange?.("createdAt", "desc");
    }
  };

  // =============================
  // Render Table
  // =============================
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      onChange={handleChange}
      bordered={false} // ✅ bỏ border giữa các ô
      className="rounded-lg shadow-sm text-center"
      style={{
        textAlign: "center", // ✅ căn giữa toàn bộ nội dung
      }}
    />
  );
};

export default SaleOrderTable;
