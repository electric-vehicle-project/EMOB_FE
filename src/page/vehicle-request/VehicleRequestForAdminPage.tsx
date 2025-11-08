import React, { useState } from "react";
import { Table, Button, Tag, Input, Space, Spin, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import SectionTitle from "../../components/atoms/SectionTitle";
import {
  useGetVehicleRequestsForAdmin,
  useApproveVehicleRequest,
} from "../../service/vehicleRequestService";
import ViewVehicleRequestModal from "./ViewVehicleRequestModal";
import type { IVehicleRequest } from "../../model/VehicleRequest";

const AdminVehicleRequestPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Gọi API for-admin
  const { data, isLoading, refetch } = useGetVehicleRequestsForAdmin({
    keyword: searchTerm,
    page: page - 1,
    size: pageSize,
  });

  const { mutateAsync: approveVehicleRequest, isPending } =
    useApproveVehicleRequest();

  const handleApprove = async (id: string) => {
    try {
      await approveVehicleRequest({ id, paymentStatus: "APPROVED" });
      message.success("Duyệt yêu cầu thành công!");
      refetch();
    } catch {
      message.error("Không thể duyệt yêu cầu này!");
    }
  };

  // ✅ Đọc đúng cấu trúc dữ liệu từ backend
  const vehicleRequests: IVehicleRequest[] = data?.result?.data ?? [];
  const total = data?.result?.metadata?.totalElements ?? 0;

  const columns: ColumnsType<IVehicleRequest> = [
    {
      title: "Mã yêu cầu",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <span className="font-mono text-gray-700">{id.slice(0, 8)}...</span>
      ),
    },
    {
      title: "Đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      render: (text) => text || "-",
    },
    {
      title: "Số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center",
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: "Tổng giá trị",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      render: (price) => (price ? `${price.toLocaleString("vi-VN")} ₫` : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string) => {
        let color = "blue";
        switch (status) {
          case "PENDING":
            color = "gold";
            break;
          case "APPROVED":
            color = "green";
            break;
          case "REJECTED":
            color = "red";
            break;
          default:
            color = "blue";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setSelectedId(record.id);
              setIsViewModalOpen(true);
            }}
          >
            Xem
          </Button>
          <Button
            size="small"
            type="primary"
            disabled={record.status === "APPROVED"}
            loading={isPending}
            onClick={() => handleApprove(record.id)}
          >
            Duyệt
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <SectionTitle text="Quản lý yêu cầu xe" />
        <Input.Search
          placeholder="Tìm kiếm theo mã hoặc đại lý..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={(value) => {
            setSearchTerm(value);
            setPage(1);
          }}
          style={{ width: 300 }}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={vehicleRequests}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (t) => `Tổng ${t} yêu cầu`,
          }}
          bordered
          className="bg-white rounded-lg shadow-sm"
        />
      )}

      {/* Modal xem chi tiết */}
      {isViewModalOpen && selectedId && (
        <ViewVehicleRequestModal
          open={isViewModalOpen}
          requestId={selectedId}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminVehicleRequestPage;
