import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { SaleOrderStatusTag } from "../molecules/SaleOrderStatusTag";
import { SaleOrderActionButtons } from "../molecules/SaleOrderActionButtons";
import type { ISaleOrder } from "../../model/SaleOrder";

interface Props {
  data: ISaleOrder[];
  loading: boolean;
  onView: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}

export const SaleOrderTable = ({
  data,
  loading,
  onView,
  onComplete,
  onCancel,
}: Props) => {
  const columns: ColumnsType<ISaleOrder> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (text) => text.slice(0, 8).toUpperCase(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v) => `${v.toLocaleString()} ₫`,
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (v) => <SaleOrderStatusTag status={v} />,
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <SaleOrderActionButtons
          orderId={record.id}
          onView={onView}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 800 }}
    />
  );
};
