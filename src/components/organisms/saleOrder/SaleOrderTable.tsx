import { Tag } from "antd";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../../model/SaleOrder";
import { EMOBTable } from "../../molecules/EMOBTable";
import type { TablePaginationConfig } from "antd/es/table";
import { useDealerByIdQuery } from "../../../service/dealerService";

interface SaleOrderTableProps {
  data: SaleOrderResponse[];
  loading?: boolean;
  showDealerColumn?: boolean;
  disableActions?: boolean;
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

const DealerName = ({ dealerId }: { dealerId: string }) => {
  const { data, isLoading } = useDealerByIdQuery(dealerId);
  if (isLoading) return <span className="text-gray-400">...</span>;
  return (
    <span className="text-gray-700 font-medium">
      {data?.result?.name || "Không xác định"}
    </span>
  );
};

export const SaleOrderTable: React.FC<SaleOrderTableProps> = ({
  data,
  loading = false,
  showDealerColumn = false,
  disableActions = false,
  onDelete,
  onComplete,
  onViewDetail,
  onSortChange,
  pagination,
  sortField,
  sortDir = "desc",
}) => {
  const role = useSelector((s: RootState) => s.user?.role ?? null);

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
      sorter: !!onSortChange,
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
      sorter: !!onSortChange,
      sortOrder: sortField === "totalQuantity" ? order : null,
      render: (v: number) => <span className="font-medium">{v}</span>,
    },
    {
      title: "Tổng tiền (VAT)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 160,
      align: "center" as const,
      sorter: !!onSortChange,
      sortOrder: sortField === "totalPrice" ? order : null,
      render: (v: number) => (
        <span className="text-gray-900 font-semibold">
          {v.toLocaleString("vi-VN")} ₫
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
            render: (x: string) =>
              x ? (
                <DealerName dealerId={x} />
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
      render: (s: OrderStatus) => {
        const config = {
          CREATED: { color: "blue", text: "Đã tạo" },
          COMPLETED: { color: "green", text: "Hoàn tất" },
          CANCELED: { color: "red", text: "Đã huỷ" },
        };
        return <Tag color={config[s].color}>{config[s].text}</Tag>;
      },
    },
  ];

  const actions = (record: SaleOrderResponse) => {
    const items = [
      {
        key: "detail",
        label: (
          <span
            className="block px-3 text-[14px]"
            onMouseDown={() => onViewDetail?.(record.id)}
          >
            Chi tiết
          </span>
        ),
      },
    ];

    if (disableActions) return items;

    const isCreated = record.status === "CREATED";

    const allowDealerStaff = role === "DEALER_STAFF" && !!record.customerId;

    const allowEvmStaff = role === "EVM_STAFF";

    const allowAction = isCreated && (allowDealerStaff || allowEvmStaff);

    if (allowAction) {
      items.push({
        key: "complete",
        label: (
          <span
            className="block px-3 text-[14px] text-green-600"
            onMouseDown={() => onComplete?.(record.id)}
          >
            Hoàn tất
          </span>
        ),
      });

      items.push({
        key: "delete",
        label: (
          <span
            className="block px-3 text-[14px] text-red-600"
            onMouseDown={() => onDelete?.(record.id)}
          >
            Huỷ
          </span>
        ),
      });
    }

    return items;
  };

  return (
    <EMOBTable<SaleOrderResponse>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      actions={actions}
      pagination={pagination}
      onChange={(s) => {
        if (!onSortChange) return;
        const one = Array.isArray(s) ? s[0] : s;
        if (one?.order && one.field) {
          onSortChange(
            one.field as keyof SaleOrderResponse,
            one.order === "ascend" ? "asc" : "desc"
          );
        }
      }}
    />
  );
};

export default SaleOrderTable;
