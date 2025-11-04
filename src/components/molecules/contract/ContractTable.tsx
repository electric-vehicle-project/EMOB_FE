import { Table, Tag, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Contract {
  contractId: string;
  contractNumber: string;
  totalQuantity: number;
  totalPrice: number;
  status: string;
}

interface Props {
  data?: Contract[];
  loading?: boolean;
  onView?: (record: Contract) => void;
  onSign?: (record: Contract) => void;
  onCancel?: (record: Contract) => void;
}

export const ContractTable = ({ data, loading, onView, onSign, onCancel }: Props) => {
  const columns: ColumnsType<Contract> = [
    {
      title: "Contract No.",
      dataIndex: "contractNumber",
      key: "contractNumber",
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      title: "Total Quantity",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center",
    },
    {
      title: "Total Price (₫)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v) => v?.toLocaleString("vi-VN"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => {
        const color =
          v === "SIGNED" ? "green" : v === "PENDING" ? "gold" : "red";
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => onView?.(record)}>
            View
          </Button>
          {record.status === "PENDING" && (
            <>
              <Button type="primary" size="small" onClick={() => onSign?.(record)}>
                Sign
              </Button>
              <Button danger size="small" onClick={() => onCancel?.(record)}>
                Cancel
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="contractId"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
    />
  );
};
