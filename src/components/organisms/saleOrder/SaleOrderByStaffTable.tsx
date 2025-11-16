import { EMOBTable } from "../../molecules/EMOBTable";
import type { ColumnsType } from "antd/es/table";
import type { SalesByStaffResponse } from "../../../model/SaleOrder";

interface Props {
  data: SalesByStaffResponse[];
  loading?: boolean;
}

export const SaleOrderByStaffTable = ({ data, loading = false }: Props) => {
  const columns: ColumnsType<SalesByStaffResponse> = [
    {
      title: "Nhân viên",
      dataIndex: "staffName",
      key: "staffName",
      render: (text: string) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Số lượng đơn",
      dataIndex: "orderCount",
      key: "orderCount",
      align: "center",
      render: (value: number) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      title: "Tổng doanh thu (₫)",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      render: (value: number) => (
        <span className="font-semibold text-[#2563eb] whitespace-nowrap">
          {value?.toLocaleString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <EMOBTable<SalesByStaffResponse>
      rowKey="accountId"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
    />
  );
};
