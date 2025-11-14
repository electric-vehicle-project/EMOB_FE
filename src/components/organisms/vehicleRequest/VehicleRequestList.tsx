import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Input, Modal, Menu, Dropdown, Select } from "antd";
import type { ColumnsType } from "antd/es/table";

import {
  EllipsisOutlined,
  SearchOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useDealerByIdQuery } from "../../../service/dealerService";
import {
  useDeleteVehicleRequest,
  useGetVehicleRequests,
} from "../../../service/vehicleRequestService";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import type { IVehicleRequest } from "../../../model/VehicleRequest";
import CreateVehicleRequestModal from "../../../page/vehicle-request/CreateVehicleRequestModal ";
import ViewVehicleRequestModal from "../../../page/vehicle-request/ViewVehicleRequestModal";
import UpdateVehicleRequestModal from "../../../page/vehicle-request/UpdateVehicleRequestModal";
import { Card } from "../../atoms/Card";

const DealerName: React.FC<{ dealerId: string }> = ({ dealerId }) => {
  const { data, isLoading } = useDealerByIdQuery(dealerId);
  if (isLoading) return <span>...</span>;
  return <span>{data?.result?.name || "-"}</span>;
};

const VehicleRequestList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const currentUser = useCurrentUser();
  const role = currentUser?.role;

  const [searchTerm, setSearchTerm] = useState("");

  // API call
  const { data, isLoading, refetch } = useGetVehicleRequests({
    page: page - 1,
    size: pageSize,
    search: searchTerm,
    statuses: statusFilter,
    sortField,
    sortDir,
  });

  // Debounce search
  function useDebounce<T>(value: T, delay = 400): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value]);
    return debouncedValue;
  }
  useDebounce(searchTerm, 300);

  const vehicleRequests: IVehicleRequest[] = data?.result?.data ?? [];
  const total = data?.result?.metadata?.totalElements ?? 0;

  // Delete mutation
  const { mutateAsync: deleteVehicleRequest } = useDeleteVehicleRequest();

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicleRequest(id);
      toast.success("Xóa yêu cầu thành công");
      refetch();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  // ============================
  // DROPDOWN FILTER CONTENT
  // ============================
  const FilterContent = () => (
    <Card
      {...({ onClick: (e: any) => e.stopPropagation() } as any)}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      {/* STATUS */}
      <div>
        <b className="text-gray-700">Trạng thái</b>
        <Select
          mode="multiple"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          allowClear
          placeholder="Chọn trạng thái"
          className="w-full mt-2"
        >
          <Select.Option value="PENDING">Chờ duyệt</Select.Option>
          <Select.Option value="APPROVED">Đã duyệt</Select.Option>
          <Select.Option value="REJECTED">Từ chối</Select.Option>
        </Select>
      </div>

      {/* SORT FIELD */}
      <div>
        <b className="text-gray-700">Sắp xếp theo</b>
        <Select
          value={sortField}
          onChange={(v) => {
            setSortField(v);
            setPage(1);
          }}
          className="w-full mt-2"
        >
          <Select.Option value="createdAt">Ngày tạo</Select.Option>
        </Select>
      </div>

      {/* SORT DIRECTION */}
      <div>
        <b className="text-gray-700">Thứ tự</b>
        <Select
          value={sortDir}
          onChange={(v) => {
            setSortDir(v);
            setPage(1);
          }}
          className="w-full mt-2"
        >
          <Select.Option value="asc">Tăng dần</Select.Option>
          <Select.Option value="desc">Giảm dần</Select.Option>
        </Select>
      </div>
    </Card>
  );

  // ============================
  // TABLE COLUMNS
  // ============================
  const columns: ColumnsType<IVehicleRequest> = [
    {
      title: "Đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      render: (dealerId?: string) =>
        dealerId ? <DealerName dealerId={dealerId} /> : "-",
    },
    {
      title: "Số lượng",
      dataIndex: "totalQuantity",
      align: "center",
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: "Tổng giá trị",
      dataIndex: "totalPrice",
      align: "right",
      render: (price) => (price ? `${price.toLocaleString("vi-VN")} ₫` : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status) => {
        const config: any = {
          PENDING: { color: "gold", text: "Chờ duyệt" },
          APPROVED: { color: "green", text: "Đã duyệt" },
          REJECTED: { color: "red", text: "Từ chối" },
        };
        const st = config[status] || { color: "blue", text: status };
        return <Tag color={st.color}>{st.text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Hành động",
      key: "actions",
      width: "6%",
      render: (_, record) => {
        const isApproved = record.status === "APPROVED";
        const menuItems: any[] = [
          {
            key: "view",
            label: <span className="text-[14px] px-10">Xem</span>,
            onClick: () => {
              setSelectedId(record.id);
              setIsViewModalOpen(true);
            },
          },
        ];

        if (role === "MANAGER" && !isApproved) {
          menuItems.push(
            {
              key: "edit",
              label: <span className="text-[14px] px-10">Sửa</span>,
              onClick: () => {
                setSelectedId(record.id);
                setIsUpdateModalOpen(true);
              },
            },
            {
              key: "delete",
              label: (
                <span className="text-[14px] px-10 text-red-500">Xóa</span>
              ),
              onClick: () =>
                Modal.confirm({
                  title: "Bạn có chắc muốn xóa yêu cầu này?",
                  okText: "Xóa",
                  okButtonProps: { danger: true },
                  cancelText: "Hủy",
                  onOk: () => handleDelete(record.id),
                }),
            }
          );
        }

        return (
          <Dropdown
            overlay={<Menu items={menuItems} />}
            trigger={["click"]}
            placement="bottomRight"
          >
            <EllipsisOutlined className="text-2xl cursor-pointer text-gray-600 hover:text-black" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm kiếm theo số lượng..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{ width: 300 }}
          />

          {/* FILTER BUTTON */}
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

        {role === "MANAGER" && (
          <Button
            type="primary"
            className="bg-green-700"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Tạo yêu cầu mới
          </Button>
        )}
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={vehicleRequests}
        loading={isLoading}
        rowKey="id"
        pagination={{
          position: ["bottomCenter"],
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

      {/* CREATE */}
      {isCreateModalOpen && (
        <CreateVehicleRequestModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      {/* VIEW */}
      {isViewModalOpen && selectedId && (
        <ViewVehicleRequestModal
          open={isViewModalOpen}
          requestId={selectedId}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {/* UPDATE */}
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

export default VehicleRequestList;
