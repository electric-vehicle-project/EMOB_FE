import React from "react";
import { Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { IReport } from "../../model/report";
import { formatDateVietnam } from "../../utils/timeFeature";

interface Props {
  data: IReport[];
  onEdit: (record: IReport) => void;
  onDelete: (reportID: string) => void;
}

export const ReportTable: React.FC<Props> = ({ data, onEdit, onDelete }) => {
  const columns: ColumnsType<IReport> = [
    {
      title: "Khách hàng",
      dataIndex: ["reportBy", "name"],
      sorter: (a, b) => a.reportBy.name.localeCompare(b.reportBy.name),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Loại phản hồi",
      dataIndex: "reportType",
      filters: [
        { text: "Khiếu nại", value: "Complaint" },
        { text: "Đề xuất", value: "Suggestion" },
        { text: "Lỗi hệ thống", value: "SystemBug" },
        { text: "Phản hồi dịch vụ", value: "ServiceFeedback" },
      ],
      onFilter: (v, r) => r.reportType === v,
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Ngày gửi",
      dataIndex: "createAt",
      sorter: (a, b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
      render: (v: string) => formatDateVietnam(v),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      filters: [
        { text: "Chờ xử lý", value: "Pending" },
        { text: "Đang xem xét", value: "InReview" },
        { text: "Đã xử lý", value: "Resolved" },
        { text: "Từ chối", value: "Rejected" },
      ],
      onFilter: (v, r) => r.status === v,
      render: (status: IReport["status"]) => {
        switch (status) {
          case "Pending":
            return <Tag color="gold" icon={<ClockCircleOutlined />}>Chờ xử lý</Tag>;
          case "InReview":
            return <Tag color="blue">Đang xem xét</Tag>;
          case "Resolved":
            return <Tag color="green" icon={<CheckCircleOutlined />}>Đã xử lý</Tag>;
          case "Rejected":
            return <Tag color="red" icon={<CloseCircleOutlined />}>Từ chối</Tag>;
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
            onClick={() => onDelete(record.reportID)}
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
    <Table<IReport>
      rowKey="reportID"
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 5 }}
      scroll={{ x: true }}
      size="middle"
    />
  );
};
