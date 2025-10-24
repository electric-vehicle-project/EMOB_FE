import React, { useState } from "react";
import { Table, Button, message, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import SectionTitle from "../../components/atoms/SectionTitle";
import {
  useGetVehicleRequests,
  useDeleteVehicleRequest,
} from "../../service/vehicleRequestService";
import ViewVehicleRequestModal from "./ViewVehicleRequestModal";
import UpdateVehicleRequestModal from "./UpdateVehicleRequestModal"; // ✅ Thêm modal update
import type { IVehicleRequest } from "../../model/VehicleRequest";
import CreateVehicleRequestModal from "./CreateVehicleRequestModal ";

const VehicleRequestPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch data
  const { data, isLoading, refetch } = useGetVehicleRequests(
    {},
    { page: page - 1, size: pageSize }
  );

  const vehicleRequests: IVehicleRequest[] = data?.result?.data ?? [];
  const total = data?.result?.metadata?.totalElements ?? 0;

  // Delete mutation
  const { mutateAsync: deleteVehicleRequest } = useDeleteVehicleRequest();

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicleRequest(id);
      message.success("Xóa yêu cầu thành công");
      refetch();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  // Columns
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
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
      align: "center",
    },
    {
      title: "Tổng giá trị",
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
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
        <div className="flex justify-center gap-2">
          <Button
            size="small"
            type="primary"
            onClick={() => {
              setSelectedId(record.id);
              setIsUpdateModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            size="small"
            onClick={() => {
              setSelectedId(record.id);
              setIsViewModalOpen(true);
            }}
          >
            Xem
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa yêu cầu này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <SectionTitle text="Vehicle Requests Management" />
        <Button
          type="primary"
          className="bg-green-700"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Tạo yêu cầu mới
        </Button>
      </div>

      {/* Table */}
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

      {/* Modal tạo mới */}
      {isCreateModalOpen && (
        <CreateVehicleRequestModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={refetch}
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

      {/* Modal cập nhật */}
      {isUpdateModalOpen && selectedId && (
        <UpdateVehicleRequestModal
          open={isUpdateModalOpen}
          requestId={selectedId}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default VehicleRequestPage;
