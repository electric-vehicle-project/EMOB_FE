import React from "react";
import { Table, Button, Tag } from "antd";
import type { SortOrder } from "antd/es/table/interface";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { IDealer } from "../../model/Dealer";

interface Props {
  data: IDealer[];
  onEdit: (dealer: IDealer) => void;
  onDelete: (id: number) => void;
}

export const DealerTable: React.FC<Props> = ({ data, onEdit, onDelete }) => {
  const columns: ColumnsType<IDealer> = [
    {
      title: "Tên đại lý",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
    },
    {
      title: "E-mail",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["ascend", "descend"] as SortOrder[],
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      sorter: (a, b) => a.phone.localeCompare(b.phone),
      sortDirections: ["ascend", "descend"] as SortOrder[],
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      sorter: (a, b) => a.address.localeCompare(b.address),
      sortDirections: ["ascend", "descend"] as SortOrder[],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
      ],
      onFilter: (value, record) =>
        record.status.toLowerCase() === value.toString().toLowerCase(),
      render: (status: string) => {
        const normalized = status?.toLowerCase?.() ?? "";
        switch (normalized) {
          case "active":
            return (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Active
              </Tag>
            );
          case "inactive":
            return (
              <Tag color="volcano" icon={<CloseCircleOutlined />}>
                Inactive
              </Tag>
            );
          default:
            return <Tag>{status}</Tag>;
        }
      },
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_: undefined, record: IDealer) => (
        <div className="flex justify-between items-center w-[180px] mx-auto">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="rounded-md bg-[#627254] border-none hover:opacity-90"
          >
            Sửa
          </Button>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            className="rounded-md"
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<IDealer>
      rowKey="id"
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 5 }}
    />
  );
};
