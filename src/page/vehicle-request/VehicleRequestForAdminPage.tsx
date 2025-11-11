import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Tag, Input, Space, Spin, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import SectionTitle from "../../components/atoms/SectionTitle";
import {
  useGetVehicleRequestsForAdmin,
  useApproveVehicleRequest,
} from "../../service/vehicleRequestService";
import { useDealersQuery } from "../../service/dealerService"; // ✅ thêm import
import ViewVehicleRequestModal from "./ViewVehicleRequestModal";
import type { IVehicleRequest } from "../../model/VehicleRequest";

const AdminVehicleRequestPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch yêu cầu xe dành cho admin
  const { data, isLoading, refetch } = useGetVehicleRequestsForAdmin({
    keyword: searchTerm,
    page: page - 1,
    size: pageSize,
  });

  // fetch danh sách đại lý (để hiển thị tên)
  const { data: dealerData, isLoading: dealerLoading } = useDealersQuery({
    page: 0,
    size: 200,
    keyword: "",
    country: "",
    sortField: "name",
    sortDir: "ASC",
  });

  // tạo map từ dealerId -> dealerName
  const dealerMap = useMemo(() => {
    const map = new Map<string, string>();
    dealerData?.result?.data?.forEach((dealer: any) => {
      map.set(dealer.id, dealer.name || "Không rõ đại lý");
    });
    return map;
  }, [dealerData]);

  // Mutation: duyệt yêu cầu
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
  // search
  function useDebounce<T>(value: T, delay = 400): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  }

  const debouncedSearch = useDebounce(searchTerm, 500);
  const vehicleRequests: IVehicleRequest[] = data?.result?.data ?? [];
  const total = data?.result?.metadata?.totalElements ?? 0;

  const columns: ColumnsType<IVehicleRequest> = [
    {
      title: "Đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      render: (dealerId: string) =>
        dealerLoading ? (
          <Spin size="small" />
        ) : (
          <span>{dealerMap.get(dealerId) || dealerId || "-"}</span>
        ),
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
        <Input
          placeholder="Tìm kiếm theo số lượng..."
          prefix={<SearchOutlined />}
          allowClear
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          style={{ width: 300, marginLeft: 40 }}
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
          loading={isLoading || dealerLoading}
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
