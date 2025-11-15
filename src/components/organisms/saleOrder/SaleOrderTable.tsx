import { Tag } from "antd";
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
      width: 130,
      ellipsis: true,
      render: (id: string) => (
        <span className="font-medium text-gray-800">
          {id.length > 8 ? id.slice(0, 50) : id}
        </span>
      ),
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      align: "center" as const,
      sorter: true,
      sortOrder: sortField === "createdAt" ? order : null,
      render: (createdAt: string) =>
        dayjs(createdAt).format("HH:mm DD/MM/YYYY"),
    },

    {
      title: "Tổng SL",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 110,
      align: "center" as const,
      sorter: true,
      sortOrder: sortField === "totalQuantity" ? order : null,
      render: (val: number) => <span className="font-medium">{val}</span>,
    },

    {
      title: "Tổng tiền (VAT)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 160,
      sorter: true,
      align: "center" as const,
      sortOrder: sortField === "totalPrice" ? order : null,
      render: (price: number) => (
        <span className="text-gray-900 font-semibold">
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
      width: 130,
      align: "center" as const,
      render: (status: OrderStatus) => {
        const config: Record<OrderStatus, { color: string; text: string }> = {
          CREATED: { color: "blue", text: "Đã tạo" },
          COMPLETED: { color: "green", text: "Hoàn tất" },
          CANCELED: { color: "red", text: "Đã huỷ" },
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      },
    },
  ];

  // ACTION MENU — Style đồng bộ Dealer Discount Policy
  const actions = (record: SaleOrderResponse) => {
    const menuItems = [
      {
        key: "detail",
        label: (
          <span
            className="block px-3 text-[14px]"
            onClick={() => onViewDetail?.(record.id)}
          >
            Chi tiết
          </span>
        ),
      },
    ];

    if (canComplete && record.status === "CREATED")
      menuItems.push({
        key: "complete",
        label: (
          <span
            className="block px-3 text-[14px] text-green-600"
            onClick={() => onComplete?.(record.id)}
          >
            Hoàn tất
          </span>
        ),
      });

    if (canDelete && record.status === "CREATED")
      menuItems.push({
        key: "delete",
        label: (
          <span
            className="block px-3 text-[14px] text-red-600"
            onClick={() => onDelete?.(record.id)}
          >
            Huỷ
          </span>
        ),
      });

    return menuItems;
  };

  // HANDLE TABLE SORT → BE
  const handleChange = (
    _pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<SaleOrderResponse> | SorterResult<SaleOrderResponse>[]
  ): void => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;

    if (onSortChange) {
      if (s?.order) {
        const order = s.order === "ascend" ? "asc" : "desc";
        onSortChange(s.field as keyof SaleOrderResponse, order);
      } else {
        onSortChange("createdAt", "desc");
      }
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
