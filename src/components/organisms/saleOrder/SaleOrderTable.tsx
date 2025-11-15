import { Button, Tag } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../../model/SaleOrder";
import { EMOBTable } from "../../molecules/EMOBTable";
import type { TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

import { useDealerByIdQuery } from "../../../service/dealerService";

const DealerName = ({ dealerId }: { dealerId: string }) => {
  const { data, isLoading } = useDealerByIdQuery(dealerId);

  if (isLoading) return <span className="text-gray-400">...</span>;

  return (
    <span className="text-gray-700 font-medium">
      {data?.result?.name || "Không xác định"}
    </span>
  );
};

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
  pagination?: TablePaginationConfig;
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

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 100,
      ellipsis: true,
      render: (id: string) => (
        <span className="font-medium text-gray-700">
          {id.length > 8 ? `${id.slice(0, 50)}` : id}
        </span>
      ),
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      align: "center" as const,
      sorter: true,
      sortOrder: sortField === "createdAt" ? order : null,
      render: (createdAt: string) =>
        dayjs(createdAt).format("HH:mm DD/MM/YYYY"),
    },

    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 120,
      sorter: true,
      sortOrder: sortField === "totalQuantity" ? order : null,
      align: "center" as const,
    },

    {
      title: "Tổng tiền (VAT)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 150,
      sorter: true,
      sortOrder: sortField === "totalPrice" ? order : null,
      align: "center" as const,
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
            dataIndex: "dealerId",
            key: "dealerId",
            width: 180,
            render: (dealerId: string) =>
              dealerId ? (
                <DealerName dealerId={dealerId} />
              ) : (
                <span className="text-gray-400">Không xác định</span>
              ),
          },
        ]
      : []),

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (status: OrderStatus) => {
        const map: Record<OrderStatus, { color: string; text: string }> = {
          CREATED: { color: "blue", text: "Đã tạo" },
          COMPLETED: { color: "green", text: "Hoàn tất" },
          CANCELED: { color: "red", text: "Đã huỷ" },
        };
        return <Tag color={map[status].color}>{map[status].text}</Tag>;
      },
    },
  ];

  const actions = (record: SaleOrderResponse) => {
    const items = [
      {
        key: "view",
        label: (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail?.(record.id)}
            className="!text-[#627254]"
          >
            Xem chi tiết
          </Button>
        ),
      },
    ];

    if (canComplete && record.status === "CREATED")
      items.push({
        key: "complete",
        label: (
          <Button
            type="link"
            icon={<CheckOutlined />}
            onClick={() => onComplete?.(record.id)}
            className="!text-green-600"
          >
            Hoàn tất
          </Button>
        ),
      });

    if (canDelete && record.status === "CREATED")
      items.push({
        key: "delete",
        label: (
          <Button
            type="link"
            icon={<CloseOutlined />}
            onClick={() => onDelete?.(record.id)}
            className="!text-red-600"
          >
            Huỷ
          </Button>
        ),
      });

    return items;
  };

  const handleChange = (
    _pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<SaleOrderResponse> | SorterResult<SaleOrderResponse>[]
  ): void => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;

    if (onSortChange && s?.field && s.order) {
      const order = s.order === "ascend" ? "asc" : "desc";
      onSortChange(s.field as keyof SaleOrderResponse, order);
    }
  };

  return (
    <EMOBTable<SaleOrderResponse>
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

export default SaleOrderTable;
