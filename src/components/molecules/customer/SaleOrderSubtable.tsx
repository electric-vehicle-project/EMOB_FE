import { Card, Table, Tag } from "antd";
import dayjs from "dayjs";

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
  return (
    <Card bordered>
      <Table
        rowKey="id"
        bordered
        loading={loading}
        dataSource={orders}
        pagination={{
          pageSize: 5,
          position: ["bottomCenter"],
          showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
        }}
        columns={[
          {
            title: "Mã đơn hàng",
            dataIndex: "id",
            key: "id",
            render: (text) => (
              <span className="text-[#4f6f52] font-medium">{text}</span>
            ),
          },
          {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
            sorter: (a, b) =>
              dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
          },
          {
            title: "Số lượng xe",
            dataIndex: "totalQuantity",
            key: "totalQuantity",
            align: "center",
          },
          {
            title: "Tổng tiền (VND)",
            dataIndex: "totalPrice",
            key: "totalPrice",
            align: "right",
            render: (val) =>
              val?.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              }),
          },
          {
            title: "VAT (VND)",
            dataIndex: "vatAmount",
            key: "vatAmount",
            align: "right",
            render: (val) =>
              val?.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              }),
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status) => {
              const color =
                status === "COMPLETED"
                  ? "green"
                  : status === "CANCELED"
                  ? "red"
                  : "blue";
              return <Tag color={color}>{status}</Tag>;
            },
          },
        ]}
        scroll={{ x: "max-content" }}
        className="
          [&_.ant-table-thead>tr>th]:!bg-[#627254]
          [&_.ant-table-thead>tr>th]:!text-white
        "
      />
    </Card>
  );
};
