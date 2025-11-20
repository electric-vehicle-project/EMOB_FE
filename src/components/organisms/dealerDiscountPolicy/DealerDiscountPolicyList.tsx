/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Input,
  Modal,
  Menu,
  Dropdown,
  Select,
  Space,
} from "antd";
import { useQueryClient } from "@tanstack/react-query";

import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EllipsisOutlined,
  PlusOutlined,
  SearchOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import {
  useDeleteDiscountPolicy,
  useGetAllDealerDiscountPolicies,
  useGetAllDealerDiscountPoliciesByDealer,
  useGetAllDealers,
} from "../../../service/dealerDiscountPolicyService";
import { useGetVehicles } from "../../../service/vehicleService";
import type { IDiscountPolicy } from "../../../model/DealerDiscountPolicy";
import CreateDiscountPolicyModal from "../../../page/dealer-discount-policy/CreateDiscountPolicyModal";
import UpdateDiscountPolicyModal from "../../../page/dealer-discount-policy/UpdateDiscountPolicyModal";
import ViewDiscountPolicyModal from "../../../page/dealer-discount-policy/ViewDiscountPolicyModal";
import BulkUpdateDiscountPolicyModal from "../../../page/dealer-discount-policy/BulkUpdateDiscountPolicyModal";
import BulkDeleteDiscountPolicyModal from "../../../page/dealer-discount-policy/BulkDeleteDiscountPolicyModal";
import { Card } from "../../atoms/Card";

const DealerDiscountPolicyList: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  // bắt role
  const currentUser = useCurrentUser();
  const role = currentUser?.role;
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // filter
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState("effectiveDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterOpen, setFilterOpen] = useState(false);

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

  const hookToUse =
    role === "ADMIN" || role === "EVM_STAFF"
      ? useGetAllDealerDiscountPolicies
      : useGetAllDealerDiscountPoliciesByDealer;

  const { data, isLoading, refetch } = hookToUse(
    page - 1,
    pageSize,
    debouncedSearch,
    statusFilter,
    sortField,
    sortDir
  );

  // Fetch danh sách đại lý và xe
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

  // ===============================
  //    FILTER DROPDOWN CONTENT
  // ===============================
  const FilterContent = () => (
    <Card
      {...({ onClick: (e: any) => e.stopPropagation() } as any)}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <b className="text-gray-700">Trạng thái</b>
          <Select
            mode="multiple"
            allowClear
            className="w-full mt-2"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <Select.Option value="UPCOMING">Sắp diễn ra</Select.Option>
            <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
            <Select.Option value="EXPIRED">Hết hạn</Select.Option>
            <Select.Option value="INACTIVE">Ngừng hiệu lực</Select.Option>
          </Select>
        </div>
        {/* sort field */}
        <div>
          <b className="text-gray-700">Sắp xếp theo</b>
          <Select
            className="w-full mt-2"
            value={sortField}
            onChange={(v) => {
              setSortField(v);
              setPage(1);
            }}
          >
            <Select.Option value="effectiveDate">Ngày hiệu lực</Select.Option>
          </Select>
        </div>
        {/* sort direction */}
        <div>
          <b className="text-gray-700">Thứ tự</b>
          <Select
            className="w-full mt-2"
            value={sortDir}
            onChange={(v) => {
              setSortDir(v);
              setPage(1);
            }}
          >
            <Select.Option value="asc">Tăng dần</Select.Option>
            <Select.Option value="desc">Giảm dần</Select.Option>
          </Select>
        </div>
      </Space>
    </Card>
  );

  // Xóa chính sách (chỉ Admin mới được)
  const handleDelete = (id: string) => {
    if (role !== "ADMIN") {
      toast.warning("Bạn không có quyền xóa chính sách!");
      return;
    }
    deletePolicy.mutate(id, {
      onSuccess: async () => {
        toast.success("Xóa chính sách thành công!");
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
        await refetch();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Xóa thất bại!");
      },
    });
  };

  // Cấu hình cột bảng
  const columns: ColumnsType<IDiscountPolicy> = [
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
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 130,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
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
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      minWidth: 100,
      width: "6%",
      render: (_, record) => {
        const isInactive = record.status === "INACTIVE";

        const menuItems = [
          {
            key: "detail",
            label: <span className="text-[14px] pl-10 pr-10">Chi tiết</span>,
            onClick: () => {
              setSelectedPolicyId(record.id);
              setIsViewModalOpen(true);
            },
          },
        ];

        // Chỉ Admin + chưa INACTIVE mới được sửa
        if (role === "ADMIN" && !isInactive) {
          menuItems.push({
            key: "edit",
            label: <span className="text-[14px] pl-10 pr-10">Sửa</span>,
            onClick: () => {
              setSelectedPolicyId(record.id);
              setIsUpdateModalOpen(true);
            },
          });
        }

        // Chỉ Admin + chưa INACTIVE mới được xóa
        if (role === "ADMIN" && !isInactive) {
          menuItems.push({
            key: "delete",
            label: (
              <span className="text-[14px] pl-10 pr-10 text-red-500">Xóa</span>
            ),
            onClick: () => {
              // Show Popconfirm tại đây
              Modal.confirm({
                title: "Bạn có chắc muốn xóa chính sách này?",
                content: "Hành động này không thể hoàn tác.",
                okText: "Xóa",
                okButtonProps: { danger: true },
                cancelText: "Hủy",
                onOk: () => handleDelete(record.id),
              });
            },
          });
        }

        const menu = <Menu items={menuItems} />;

        return (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <EllipsisOutlined className="text-2xl cursor-pointer text-gray-600 hover:text-black" />
          </Dropdown>
        );
      },
    },
  ];

  const policyData = data?.result?.data || [];
  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm kiếm theo mã, dealer, vehicle..."
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 320 }}
            className="rounded-md shadow-sm border-gray-300 focus:border-green-600 focus:ring-green-600"
          />

          <Dropdown
            trigger={["click"]}
            open={filterOpen}
            onOpenChange={setFilterOpen}
            dropdownRender={() => <FilterContent />}
          >
            <Button
              type="text"
              icon={<SlidersOutlined style={{ fontSize: 20 }} />}
              className="text-gray-600 hover:text-black"
            />
          </Dropdown>
        </div>
        {/* Các nút hành động: chỉ hiển thị cho Admin */}
        {role === "ADMIN" && (
          <div className="flex items-center gap-3">
            <Button
              type="default"
              className="bg-blue-600 text-white"
              onClick={() => setIsBulkModalOpen(true)}
            >
              Cập nhật hàng loạt
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
                backgroundColor: "red",
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
        )}
      </div>

      <Table
        columns={columns}
        dataSource={policyData}
        loading={isLoading}
        rowKey="id"
        pagination={{
          position: ["bottomCenter"],
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
          className: "flex justify-center",
        }}
        bordered
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

export default DealerDiscountPolicyList;
