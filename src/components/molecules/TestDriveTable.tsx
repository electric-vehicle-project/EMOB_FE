import React from "react";
import { Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ITestDrive } from "../../model/TestDrive";
import { formatDateVietnam } from "../../utils/timeFeature";

interface Props {
  data: ITestDrive[];
  onEdit: (record: ITestDrive) => void;
  onDelete: (id: number) => void;
}

export const TestDriveTable: React.FC<Props> = ({ data, onEdit, onDelete }) => {
  const columns: ColumnsType<ITestDrive> = [
    {
      title: "Khách hàng",
      dataIndex: "customer",
      sorter: (a, b) => a.customer.localeCompare(b.customer),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Xe",
      dataIndex: "car",
      sorter: (a, b) => a.car.localeCompare(b.car),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Ngày",
      dataIndex: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (value: string) => formatDateVietnam(value),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Thời lượng (phút)",
      dataIndex: "duration",
      sorter: (a, b) => a.duration - b.duration,
      align: "center",
      render: (value: number) => `${value} phút`,
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Completed", value: "Completed" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        switch (status) {
          case "Pending":
            return (
              <Tag color="gold" icon={<ClockCircleOutlined />}>
                Pending
              </Tag>
            );
          case "Completed":
            return (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Completed
              </Tag>
            );
          case "Cancelled":
            return (
              <Tag color="red" icon={<CloseCircleOutlined />}>
                Cancelled
              </Tag>
            );
          default:
            return <Tag>{status}</Tag>;
        }
      },
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2 flex-wrap mx-auto">
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
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
  ];

  return (
    <Table<ITestDrive>
      rowKey="id"
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 5 }}
      scroll={{ x: true }}
      size="middle"
    />
  );
};
