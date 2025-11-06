import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, message, Button, Popconfirm, Input, Space } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteDiscountPolicy,
  useGetAllDealerDiscountPolicies,
  useGetAllDealers,
} from "../../service/dealerDiscountPolicyService";
import { useGetVehicles } from "../../service/vehicleService";
import type { ColumnsType } from "antd/es/table";
import type { IDiscountPolicy } from "../../model/DealerDiscountPolicy";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import SectionTitle from "../../components/atoms/SectionTitle";
import CreateDiscountPolicyModal from "./CreateDiscountPolicyModal";
import UpdateDiscountPolicyModal from "./UpdateDiscountPolicyModal";
import ViewDiscountPolicyModal from "./ViewDiscountPolicyModal";
import BulkUpdateDiscountPolicyModal from "./BulkUpdateDiscountPolicyModal";
import BulkDeleteDiscountPolicyModal from "./BulkDeleteDiscountPolicyModal";

const DealerDiscountPolicyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  function useDebounce<T>(value: T, delay = 400): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  }
  const debouncedSearch = useDebounce(searchTerm, 500);
  // Query: danh sách chính sách chiết khấu
  const { data, isLoading, refetch } = useGetAllDealerDiscountPolicies(
    page - 1,
    pageSize,
    debouncedSearch
  );
  // Fetch danh sách đại lý và xe (prefetch để hiển thị tên)
  const { data: allDealersData } = useGetAllDealers(0, 200);
  const { data: allVehiclesData } = useGetVehicles(0, 200);

  // Mutation: Xóa chính sách
  const deletePolicy = useDeleteDiscountPolicy();

  const dealerMap = useMemo(() => {
    const map = new Map();
    allDealersData?.result?.data?.forEach((d: any) =>
      map.set(d.id, d.name || d.dealerName || "Không rõ đại lý")
    );
    return map;
  }, [allDealersData]);

  const vehicleMap = useMemo(() => {
    const map = new Map();
    allVehiclesData?.result?.data?.forEach((v: any) =>
      map.set(v.id, `${v.model || "Không rõ"} (${v.type || "N/A"})`)
    );
    return map;
  }, [allVehiclesData]);

  // delete policy
  const handleDelete = (id: string) => {
    deletePolicy.mutate(id, {
      onSuccess: async () => {
        message.success("✅ Xóa chính sách thành công!");
        // Xóa record khỏi cache
        queryClient.setQueryData(
          ["dealerDiscountPolicies", page - 1, pageSize, searchTerm],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              result: {
                ...oldData.result,
                data: oldData.result.data.filter((p: any) => p.id !== id),
              },
            };
          }
        );
        await queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] === "dealerDiscountPolicies",
        });
        await refetch(); // Refresh UI ngay lập tức
      },
      onError: (error: any) => {
        message.error(error?.response?.data?.message || "❌ Xóa thất bại!");
      },
    });
  };

  // hiển thị trên UI
  const columns: ColumnsType<IDiscountPolicy> = [
    {
      title: "Mã chính sách",
      dataIndex: "id",
      key: "id",
      width: 140,
      render: (id: string) => (
        <span className="font-mono text-gray-700">{id.slice(0, 8)}...</span>
      ),
    },
    {
      title: "Đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      width: 200,
      render: (dealerId: string) => (
        <span>{dealerMap.get(dealerId) || "Không rõ đại lý"}</span>
      ),
    },
    {
      title: "Xe",
      dataIndex: "vehicleId",
      key: "vehicleId",
      width: 200,
      render: (vehicleId: string) => (
        <span>{vehicleMap.get(vehicleId) || "Không rõ xe"}</span>
      ),
    },
    {
      title: "Giá cuối cùng",
      dataIndex: "finalPrice",
      key: "finalPrice",
      width: 150,
      align: "right",
      render: (price: number) => (
        <span className="font-semibold text-green-600">
          {price ? `${price.toLocaleString("vi-VN")} ₫` : "—"}
        </span>
      ),
      sorter: (a, b) => (a.finalPrice || 0) - (b.finalPrice || 0),
    },
    {
      title: "Hệ số",
      dataIndex: "customMultiplier",
      key: "customMultiplier",
      width: 100,
      align: "center",
      render: (multiplier: number) => (
        <Tag color="blue">{multiplier?.toFixed(2) || "—"}</Tag>
      ),
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      width: 130,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
      sorter: (a, b) =>
        new Date(a.effectiveDate).getTime() -
        new Date(b.effectiveDate).getTime(),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 130,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
      sorter: (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          UPCOMING: { color: "orange", text: "Sắp diễn ra" },
          ACTIVE: { color: "green", text: "Đang hoạt động" },
          EXPIRED: { color: "red", text: "Hết hạn" },
          INACTIVE: { color: "brown", text: "Ngừng hiệu lực" },
        };
        const st = config[status] || { color: "default", text: status };
        return <Tag color={st.color}>{st.text}</Tag>;
      },
      filters: [
        { text: "Sắp diễn ra", value: "UPCOMING" },
        { text: "Đang hoạt động", value: "ACTIVE" },
        { text: "Hết hạn", value: "EXPIRED" },
        { text: "Ngừng hiệu lực", value: "INACTIVE" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPolicyId(record.id);
              setIsViewModalOpen(true);
            }}
          >
            Chi tiết
          </Button>

          <Button
            size="small"
            icon={<EditOutlined />}
            style={{
              backgroundColor: "#627254",
              color: "white",
              border: "none",
            }}
            onClick={() => {
              setSelectedPolicyId(record.id);
              setIsUpdateModalOpen(true);
            }}
            disabled={record.status === "EXPIRED"}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Bạn có chắc muốn xóa chính sách này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
              }}
              disabled={record.status === "EXPIRED"}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const policyData = (data?.result?.data || []).filter(
    (p: IDiscountPolicy) => p.status !== "INACTIVE"
  );
  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <SectionTitle text="Quản lý chính sách chiết khấu" />

      <div className="flex justify-between items-center mb-4">
        {/* Ô tìm kiếm nằm bên trái */}
        <Input
          placeholder="Tìm kiếm theo mã, dealer, vehicle..."
          allowClear
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 320 }}
          className="rounded-md shadow-sm border-gray-300 focus:border-green-600 focus:ring-green-600"
        />

        {/* Nhóm nút hành động bên phải */}
        <div className="flex items-center gap-3">
          <Button
            type="default"
            className="bg-blue-600 text-white"
            onClick={() => setIsBulkModalOpen(true)}
          >
            ⚙️ Cập nhật hàng loạt
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-green-700"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo chính sách mới
          </Button>

          <Button
            style={{
              backgroundColor: "red", // tương đương bg-green-600
              color: "white",
              border: "none",
            }}
            icon={<DeleteOutlined />}
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="bg-red-600 text-white border-none"
          >
            Xóa hàng loạt
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={policyData}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize,
          total: totalElements,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
          showTotal: (t) => `Tổng ${t} chính sách`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        bordered
        // scroll={{ x: 1500 }}
        className="bg-white rounded-lg shadow-sm"
        tableLayout="auto"
      />

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateDiscountPolicyModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setPage(1);
            refetch();
          }}
        />
      )}
      {/* update modal */}
      {isUpdateModalOpen && selectedPolicyId && (
        <UpdateDiscountPolicyModal
          open={isUpdateModalOpen}
          policyId={selectedPolicyId}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      {isViewModalOpen && selectedPolicyId && (
        <ViewDiscountPolicyModal
          open={isViewModalOpen}
          policyId={selectedPolicyId}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isBulkModalOpen && (
        <BulkUpdateDiscountPolicyModal
          open={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      {isBulkDeleteModalOpen && (
        <BulkDeleteDiscountPolicyModal
          open={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default DealerDiscountPolicyPage;
