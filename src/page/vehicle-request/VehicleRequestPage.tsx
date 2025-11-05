import React, { useState } from "react";
import { Table, Button, message, Popconfirm, Tag, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import SectionTitle from "../../components/atoms/SectionTitle";
import {
  useGetVehicleRequests,
  useDeleteVehicleRequest,
} from "../../service/vehicleRequestService";
import ViewVehicleRequestModal from "./ViewVehicleRequestModal";
import UpdateVehicleRequestModal from "./UpdateVehicleRequestModal";
import type { IVehicleRequest } from "../../model/VehicleRequest";
import CreateVehicleRequestModal from "./CreateVehicleRequestModal ";
import { SearchOutlined } from "@ant-design/icons";
import ApproveVehicleRequestModal from "./ApproveVehicleRequestModal";
import { useDealerById, useDealers } from "../../service/dealerService";

const DealerNameCell: React.FC<{ dealerId: string }> = ({ dealerId }) => {
  const { data, isLoading } = useDealers(dealerId, { enabled: !!dealerId });

  if (!dealerId) return <span>-</span>;
  if (isLoading)
    return <span className="text-gray-400 italic">Đang tải...</span>;

  return <span>{data?.result?.name ?? "Không xác định"}</span>;
};

const VehicleRequestPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch data
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, refetch } = useGetVehicleRequests(
    page - 1,
    pageSize,
    searchTerm
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
      render: (dealerId: string) => <DealerNameCell dealerId={dealerId} />,
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
            style={{
              backgroundColor: "#627254",
              color: "white",
              border: "none",
            }}
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
          <Button
            size="small"
            style={{
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
            }}
            onClick={() => {
              setSelectedId(record.id);
              setIsApproveModalOpen(true);
            }}
          >
            Duyệt
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa yêu cầu này?"
            style={{
              backgroundColor: "red", // tương đương bg-green-600
              color: "white",
              border: "none",
            }}
            disabled={record.status === "APPROVED"}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small">Xóa</Button>
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
        <Input.Search
          placeholder="Tìm kiếm theo mã hoặc đại lý..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={(value) => {
            setSearchTerm(value);
            setPage(1);
          }}
          style={{ width: 300, marginLeft: 40 }}
        />
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

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateVehicleRequestModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      {isViewModalOpen && selectedId && (
        <ViewVehicleRequestModal
          open={isViewModalOpen}
          requestId={selectedId}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isUpdateModalOpen && selectedId && (
        <UpdateVehicleRequestModal
          open={isUpdateModalOpen}
          requestId={selectedId}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      {isApproveModalOpen && selectedId && (
        <ApproveVehicleRequestModal
          open={isApproveModalOpen}
          record={vehicleRequests.find((item) => item.id === selectedId)}
          onClose={() => setIsApproveModalOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default VehicleRequestPage;
