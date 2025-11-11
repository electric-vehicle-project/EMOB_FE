import { Table, Button, Tag } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../../model/SaleOrder";

interface SaleOrderTableProps {
  data: SaleOrderResponse[];
  loading?: boolean;
  showDealerColumn?: boolean;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  onSortChange?: (
    field: keyof SaleOrderResponse,
    order: "asc" | "desc"
  ) => void;
  pagination?: TableProps<SaleOrderResponse>["pagination"];
  sortField?: keyof SaleOrderResponse;
  sortDir?: "asc" | "desc";
}

export const SaleOrderTable: React.FC<SaleOrderTableProps> = ({
  data,
  loading = false,
  showDealerColumn = false,
  onDelete,
  onComplete,
  onViewDetail,
  onSortChange,
  pagination,
  sortField,
  sortDir = "desc",
}) => {
  const role = useSelector((state: RootState) => state.user?.role ?? null);
  const canComplete = role === "EVM_STAFF" || role === "DEALER_STAFF";
  const canDelete = role === "EVM_STAFF" || role === "DEALER_STAFF";
  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#627254",
    color: "#fff",
    fontWeight: 600,
    textAlign: "center",
  };

  const columns: ColumnsType<SaleOrderResponse> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 220,
      ellipsis: true,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (id: string) => (
        <span className="font-medium text-gray-700">
          {id.length > 8 ? `${id.slice(0, 8)}...` : id}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder: sortField === "createdAt" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (createdAt: string) =>
        dayjs(createdAt).format("HH:mm DD/MM/YYYY"),
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: true,
      sortOrder: sortField === "totalQuantity" ? order : null,
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
    },
    {
      title: "Tổng tiền (VAT)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: true,
      sortOrder: sortField === "totalPrice" ? order : null,
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (price: number) => (
        <span className="text-gray-800 font-medium">
          {price?.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    ...(showDealerColumn
      ? [
          {
            title: "Đại lý",
            dataIndex: "dealerName",
            key: "dealerName",
            align: "left" as const,
            onHeaderCell: () => ({ style: headerStyle }),
            render: (name?: string) => (
              <span className="text-gray-700 font-medium">
                {name ?? "Không xác định"}
              </span>
            ),
          },
        ]
      : []),
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (status: OrderStatus) => {
        const map: Record<OrderStatus, { color: string; text: string }> = {
          CREATED: { color: "blue", text: "Đã tạo" },
          COMPLETED: { color: "green", text: "Hoàn tất" },
          CANCELED: { color: "red", text: "Đã huỷ" },
        };
        return <Tag color={map[status].color}>{map[status].text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 220,
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail?.(record.id)}
            className="!bg-[#627254] hover:!bg-[#4f6f52] !border-none"
          >
            Xem
          </Button>

          {canComplete && record.status === "CREATED" && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => onComplete?.(record.id)}
              className=" !border-none"
            >
              Hoàn tất
            </Button>
          )}

          {canDelete && record.status === "CREATED" && (
            <Button
              size="small"
              icon={<CloseOutlined />}
              className="!bg-red-600 hover:!bg-red-700 !text-white !border-none"
              onClick={() => onDelete?.(record.id)}
            >
              Huỷ
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleChange: TableProps<SaleOrderResponse>["onChange"] = (
    _pagination,
    _filters,
    sorter
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (onSortChange && s?.field && typeof s.field === "string" && s.order) {
      const order = s.order === "ascend" ? "asc" : "desc";
      onSortChange(s.field as keyof SaleOrderResponse, order);
    }
  };

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      bordered
      onChange={handleChange}
      className="shadow-sm rounded-lg"
      scroll={{ x: "max-content" }}
      sticky
    />
  );
};

export default SaleOrderTable;
