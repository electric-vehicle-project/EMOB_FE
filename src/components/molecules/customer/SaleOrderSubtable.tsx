import { Card, Tag } from "antd";
import dayjs from "dayjs";
import { EMOBTable } from "../../molecules/EMOBTable";

interface SaleOrder {
  id: string;
  totalPrice: number;
  vatAmount: number;
  totalQuantity: number;
  status: string;
  createdAt: string;
}

interface Props {
  orders: SaleOrder[];
  loading?: boolean;
}

export const SaleOrderSubtable: React.FC<Props> = ({ orders, loading }) => {
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 260,
      render: (text: string) => (
        <span className="text-[#4f6f52] font-medium">{text}</span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      width: 180,
      render: (val: string) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số lượng xe",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center" as const,
      width: 140,
    },
    {
      title: "Tổng tiền (VND)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "center" as const,
      width: 180,
      render: (val: number) =>
        val?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "VAT (VND)",
      dataIndex: "vatAmount",
      key: "vatAmount",
      align: "center" as const,
      width: 160,
      render: (val: number) =>
        val?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      width: 150,
      render: (status: string) => {
        const color =
          status === "COMPLETED"
            ? "green"
            : status === "CANCELED"
            ? "red"
            : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <Card bordered>
      <EMOBTable
        dataSource={orders}
        columns={columns}
        loading={loading}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 5,
          position: ["bottomCenter"],
          showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
        }}
      />
    </Card>
  );
};
