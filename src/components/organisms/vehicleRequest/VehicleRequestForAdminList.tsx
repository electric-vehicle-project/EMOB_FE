/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Table, Tag, Input, Spin, Menu, Dropdown, Select, Button } from "antd";
import {
  EllipsisOutlined,
  SearchOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { toast } from "react-toastify";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import {
  useApproveVehicleRequest,
  useGetVehicleRequestsForAdmin,
} from "../../../service/vehicleRequestService";
import { useDealersQuery } from "../../../service/dealerService";
import type { IVehicleRequest } from "../../../model/VehicleRequest";
import ViewVehicleRequestModal from "../../../page/vehicle-request/ViewVehicleRequestModal";
import { useDebounce } from "../../../hook/useDebounce";

const VehicleRequestForAdminList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // FILTER STATES
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // bắt role
  const currentUser = useCurrentUser();
  const role = currentUser?.role;
  // Fetch yêu cầu xe dành cho admin
  const { data, isLoading, refetch } = useGetVehicleRequestsForAdmin({
    keyword: searchTerm,
    page: page - 1,
    size: pageSize,
    statuses: statusFilter,
    sortField,
    sortDir,
  });

  // fetch danh sách đại lý (để hiển thị tên)
  const { data: dealerData, isLoading: dealerLoading } = useDealersQuery(
    0, // page
    200, // size
    "", // keyword
    "name", // sortField
    "asc", // sortDir
    undefined, // country
    undefined, // regions
    true // enabled
  );

  // tạo map từ dealerId -> dealerName
  const dealerMap = useMemo(() => {
    const map = new Map<string, string>();
    dealerData?.result?.data?.forEach((dealer: any) => {
      map.set(dealer.id, dealer.name || "Không rõ đại lý");
    });
    return map;
  }, [dealerData]);

  // Mutation: duyệt yêu cầu
  const { mutateAsync: approveVehicleRequest } = useApproveVehicleRequest();

  const handleApprove = async (id: string) => {
    try {
      await approveVehicleRequest({ id, paymentStatus: "APPROVED" });
      toast.success("Duyệt yêu cầu thành công!");
      refetch();
    } catch {
      toast.error("Không thể duyệt yêu cầu này!");
    }
  };

  useDebounce(searchTerm, 300);
  const vehicleRequests: IVehicleRequest[] = data?.result?.data ?? [];
  const total = data?.result?.metadata?.totalElements ?? 0;

  // ===============================
  //    FILTER DROPDOWN CONTENT
  // ===============================
  const FilterContent = () => (
    <div
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
          <Select.Option value="totalQuantity">Số lượng</Select.Option>
          <Select.Option value="totalPrice">Tổng giá trị</Select.Option>
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
    </div>
  );

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
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (price) => (price ? `${price.toLocaleString("vi-VN")} ₫` : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
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
      key: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      minWidth: 100,
      width: "6%",
      render: (_, record) => {
        const menuItems = [
          {
            key: "view",
            label: <span className="text-[14px] px-10">Xem</span>,
            onClick: () => {
              setSelectedId(record.id);
              setIsViewModalOpen(true);
            },
          },
        ];

        // ADMIN mới được duyệt & không phải APPROVED
        if (role === "ADMIN" && record.status !== "APPROVED") {
          menuItems.push({
            key: "approve",
            label: <span className="text-[14px] px-10">Duyệt</span>,
            onClick: () => handleApprove(record.id),
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
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

          {/* FILTER DROPDOWN */}
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

export default VehicleRequestForAdminList;
