import { Table, Tag, Button, Space } from "antd";
import type {
  ColumnsType,
  TableProps,
  TablePaginationConfig,
} from "antd/es/table";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import type { RootState } from "../../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../../model/SaleOrder";

interface Props {
  data: SaleOrderResponse[];
  loading?: boolean;
  showDealerColumn?: boolean;
  onViewDetail?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;

  // --- Server sort & pagination
  sortField: string;
  sortDir: "asc" | "desc";
  onChangeSort: (field?: string, order?: "ascend" | "descend") => void;
  pagination?: TablePaginationConfig;
}

const headerStyle: React.CSSProperties = {
  backgroundColor: "#394e31",
  color: "#fff",
  ["--ant-table-header-sort-active-bg" as unknown as string]: "#394e31",
};

export const SaleOrderTable = ({
  data,
  loading,
  showDealerColumn = false,
  onViewDetail,
  onComplete,
  onDelete,
  sortField,
  sortDir,
  onChangeSort,
  pagination,
}: Props) => {
  const userRole = useSelector((state: RootState) => state.user?.role);
  const canComplete = userRole === "EVM_STAFF" || userRole === "DEALER_STAFF";
  const canDelete = userRole === "EVM_STAFF" || userRole === "DEALER_STAFF";
  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  const getStatusTag = (status: OrderStatus) => {
    const map: Record<OrderStatus, { color: string; text: string }> = {
      CREATED: { color: "blue", text: "Đã tạo" },
      COMPLETED: { color: "green", text: "Hoàn tất" },
      CANCELED: { color: "red", text: "Đã huỷ" },
    };
    return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
  };

  const columns: ColumnsType<SaleOrderResponse> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      sorter: true,
      sortOrder: sortField === "id" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (text: string, record) => (
        <a
          onClick={() => onViewDetail?.(record.id)}
          className="text-[#4f6f52] hover:text-[#627254] font-medium cursor-pointer"
        >
          {text?.length > 8 ? `${text.slice(0, 8)}...` : text}
        </a>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder: sortField === "createdAt" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (val: string) =>
        val ? dayjs(val).format("HH:mm DD/MM/YYYY") : "—",
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: true,
      align: "center",
      sortOrder: sortField === "totalQuantity" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
    },
    {
      title: "Tổng tiền (VAT)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: true,
      align: "center",
      sortOrder: sortField === "totalPrice" ? order : null,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (price?: number) =>
        price ? price.toLocaleString("vi-VN") + " ₫" : "—",
    },
    ...(showDealerColumn
      ? [
          {
            title: "Đại lý",
            dataIndex: "dealerName",
            key: "dealerName",
            sorter: true,
            sortOrder: sortField === "dealerName" ? order : null,
            onHeaderCell: () => ({ style: headerStyle }),
            render: (name?: string) => name || "Không xác định",
          },
        ]
      : []),
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (status: OrderStatus) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 230,
      onHeaderCell: () => ({ style: headerStyle }),
      render: (_, record) => (
        <Space size="middle">
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
              size="small"
              icon={<CheckOutlined />}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-none"
              onClick={() => onComplete?.(record.id)}
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
        </Space>
      ),
    },
  ];

  const handleChange: TableProps<SaleOrderResponse>["onChange"] = (
    _p,
    _f,
    sorter
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = s?.field as string | undefined;
    const order = s?.order as "ascend" | "descend" | undefined;
    onChangeSort?.(field, order);
  };

  return (
    <Table
      bordered
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={data}
      loading={loading}
      onChange={handleChange}
      pagination={pagination}
      scroll={{ x: "max-content", y: 560 }}
      sticky={{ offsetHeader: 0 }}
      className="bg-white [&_.ant-table-thead>tr>th]:!text-white"
    />
  );
};

export default SaleOrderTable;
