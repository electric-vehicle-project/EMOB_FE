import { Table, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { IDealer } from "../../model/Dealer";

interface Props {
  data: IDealer[];
  onEdit: (dealer: IDealer) => void;
  onDelete: (id: string) => void;
  canModify?: boolean;
}

export const DealerTable = ({
  data,
  onEdit,
  onDelete,
  canModify = false,
}: Props) => {
  const columns: ColumnsType<IDealer> = [
    {
      title: "Tên đại lý",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Thông tin liên hệ",
      dataIndex: "contactInfo",
      key: "contactInfo",
      ellipsis: true,
    },
    {
      title: "Quốc gia",
      dataIndex: "country",
      key: "country",
      ellipsis: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) =>
        val ? new Date(val).toLocaleString("vi-VN") : "-",
      width: 180,
    },
  ];

  if (canModify) {
    columns.push({
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="!bg-[#627254] hover:!bg-[#525e46] text-white rounded-md"
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id!)}
            className="rounded-md"
          >
            Xóa
          </Button>
        </div>
      ),
    });
  }

  return (
    <Table<IDealer>
      rowKey="id"
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 5 }}
      size="middle"
      bordered
      className="
        bg-white rounded-2xl shadow-sm
        [&_.ant-table-tbody>tr:hover>td]:!bg-white
        [&_.ant-table-row]:!transition-none
      "
      rowClassName={() => "bg-white"}
    />
  );
};
