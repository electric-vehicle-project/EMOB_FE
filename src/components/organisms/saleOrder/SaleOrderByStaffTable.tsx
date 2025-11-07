import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

interface StaffSalesSummary {
  accountId: string;
  staffName?: string;
  orderCount: number;
  amount: number;
}

interface Props {
  data: StaffSalesSummary[];
  loading?: boolean;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
}

export const SaleOrderByStaffTable: React.FC<Props> = ({
  data,
  loading = false,
  onSortChange,
}) => {
  const columns: ColumnsType<StaffSalesSummary> = [
    {
      title: "Nhân viên",
      dataIndex: "staffName",
      key: "staffName",
      width: 300,
      ellipsis: true,
      render: (name) => (
        <span className="font-medium text-gray-700">{name}</span>
      ),
    },
    {
      title: "Số lượng đơn hàng",
      dataIndex: "orderCount",
      key: "orderCount",
      align: "center",
      sorter: true,
    },
    {
      title: "Tổng doanh thu (₫)",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      sorter: true,
      render: (value) => (
        <span className="text-[#2563eb] font-medium">
          {value?.toLocaleString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <Table
      rowKey="accountId"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      bordered={false}
      className="shadow-sm rounded-lg"
      onChange={(pagination, filters, sorter: any) => {
        if (onSortChange && sorter.field && sorter.order) {
          const order = sorter.order === "ascend" ? "asc" : "desc";
          onSortChange(sorter.field, order);
        }
      }}
    />
  );
};
