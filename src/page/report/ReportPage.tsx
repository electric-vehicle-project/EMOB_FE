import { useState } from "react";
import { Table, Tag, Button, Input, Popconfirm, message, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  useReportChangeStatus,
  useReportDelete,
  useReportList,
} from "../../service/reportService";
import { ROUTES } from "../../model/routePaths";
import { ReportStatus, ReportType, type IReport } from "../../model/report";

// ==============================
// REPORT PAGE
// ==============================
export const ReportPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  const { data, isLoading, refetch } = useReportList({}, { page: 0, size: 20 });
  const { mutateAsync: deleteReport } = useReportDelete();
  const { mutateAsync: changeStatus } = useReportChangeStatus();

  const reports: IReport[] = data?.result?.data ?? [];

  // ====== Filter & search ======
  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.reportBy?.fullName?.toLowerCase().includes(q);
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    const matchesType = typeFilter ? r.type === typeFilter : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  // ====== Xoá báo cáo ======
  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id);
      message.success("Đã xoá báo cáo thành công");
      refetch();
    } catch {
      message.error("Xoá báo cáo thất bại");
    }
  };

  // ====== Đổi trạng thái ======
  const handleChangeStatus = async (id: string, status: string) => {
    try {
      await changeStatus({ id, status: status as keyof typeof ReportStatus });
      message.success("Đã cập nhật trạng thái báo cáo");
      refetch();
    } catch {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  // ====== Tag trạng thái ======
  const renderStatusTag = (status: string) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <Tag color="orange">PENDING</Tag>;
      case ReportStatus.IN_PROGRESS:
        return <Tag color="blue">IN PROGRESS</Tag>;
      case ReportStatus.RESOLVED:
        return <Tag color="green">RESOLVED</Tag>;
      case ReportStatus.DELETED:
        return <Tag color="red">DELETED</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // ====== Tag loại report ======
  const renderTypeTag = (type: string) => {
    switch (type) {
      case ReportType.FEEDBACK:
        return <Tag color="#627254">FEEDBACK</Tag>;
      case ReportType.COMPLAINT:
        return <Tag color="volcano">COMPLAINT</Tag>;
      default:
        return <Tag color="default">{type}</Tag>;
    }
  };

  // ====== Table columns ======
  const columns: ColumnsType<IReport> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span
          onClick={() => navigate(`${ROUTES.ADMIN}/report/${record.reportId}`)}
          className="text-[#627254] hover:underline cursor-pointer"
        >
          {text}
        </span>
      ),
    },
    {
      title: "Người báo cáo",
      dataIndex: ["reportBy", "fullName"],
      key: "reportBy",
      render: (v) => v || "—",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: renderTypeTag,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: renderStatusTag,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (v: string) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          {/* Đổi trạng thái nhanh */}
          {record.status !== ReportStatus.RESOLVED && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                handleChangeStatus(record.reportId, ReportStatus.RESOLVED)
              }
              style={{
                backgroundColor: "#627254",
                color: "white",
                border: "none",
              }}
            >
              Đánh dấu xử lý
            </Button>
          )}

          <Popconfirm
            title="Xác nhận xoá báo cáo này?"
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{
              style: {
                backgroundColor: "#d93025",
                borderColor: "#d93025",
                color: "white",
              },
            }}
            onConfirm={() => handleDelete(record.reportId)}
          >
            <Button
              danger
              className="!bg-[#d93025] !text-white hover:!bg-[#b1271e]"
              icon={<DeleteOutlined />}
            >
              Xoá
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // ====== UI ======
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold mb-4">Quản lý Báo cáo</h1>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <Input
          placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc người báo cáo"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-[400px]"
          style={{ borderColor: "#627254" }}
        />

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Select
            allowClear
            placeholder="Lọc trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={Object.values(ReportStatus).map((s) => ({
              label: s,
              value: s,
            }))}
          />

          <Select
            allowClear
            placeholder="Lọc loại"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 160 }}
            options={Object.values(ReportType).map((t) => ({
              label: t,
              value: t,
            }))}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        loading={isLoading}
        rowKey="reportId"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default ReportPage;
