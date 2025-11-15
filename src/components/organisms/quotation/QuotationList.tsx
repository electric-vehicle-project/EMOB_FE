import React, { useState } from "react";
import { Table, Button, Tag, Input, Modal, Menu, Dropdown, Select } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useQueryClient } from "@tanstack/react-query";
import {
  EllipsisOutlined,
  SearchOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useCustomerById } from "../../../service/customerService";
import { useDealerByIdQuery } from "../../../service/dealerService";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import type { IQuotation } from "../../../model/Quotation";
import {
  useDeleteQuotation,
  useQuotationsList,
  useRejectQuotation,
} from "../../../service/quotationService";
import CreateQuotationModal from "../../../page/quotation/CreateQuotationModal";
import UpdateQuotationModal from "../../../page/quotation/UpdateQuotationModal";
import ViewQuotationDetailModal from "../../../page/quotation/ViewQuotationDetailModal";
import ApproveQuotationModal from "../../../page/quotation/ApproveQuotationModal";
import { useDebounce } from "../../../hook/useDebounce";

const CustomerName: React.FC<{ customerId: string }> = ({ customerId }) => {
  const { data, isLoading } = useCustomerById(customerId);
  if (isLoading) return <span className="text-gray-400">...</span>;
  return <span>{data?.result?.fullName || "-"}</span>;
};

const DealerName: React.FC<{ dealerId: string }> = ({ dealerId }) => {
  const { data, isLoading } = useDealerByIdQuery(dealerId);
  if (isLoading) return <span className="text-gray-400">...</span>;
  return <span>{data?.result?.name || "-"}</span>;
};

const QuotationList: React.FC = () => {
  const queryClient = useQueryClient();
  const account = useCurrentUser();
  const role = account?.role;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(
    null
  );
  const [selectedRecord, setSelectedRecord] = useState<IQuotation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ADDED: Filter States
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState("totalQuantity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  // duyệt
  const handleOpenApproveModal = (record: IQuotation) => {
    setSelectedRecord(record);
    setSelectedQuotationId(record.id);
    setIsApproveModalOpen(true);
  };

  // từ chối
  const rejectQuotation = useRejectQuotation();
  const handleRejectQuotation = async (record: IQuotation) => {
    Modal.confirm({
      title: "Từ chối báo giá",
      content: "Bạn có chắc chắn muốn từ chối báo giá này không?",
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await rejectQuotation.mutateAsync(record.id);
          toast.success("Đã từ chối báo giá!");
          refetch();
        } catch (err: any) {
          toast.error(
            err?.response?.data?.message || "Không thể từ chối báo giá!"
          );
        }
      },
    });
  };
  const { data, isLoading, refetch } = useQuotationsList({
    page: page - 1,
    size: pageSize,
    search: searchTerm,
    statuses: statusFilter,
    sortField,
    sortDir,
  });
  const deleteQuotation = useDeleteQuotation();

  // ===============================
  //    FILTER DROPDOWN CONTENT
  // ===============================

  const FilterContent = () => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      {/* STATUS */}
      <div>
        <b className="text-gray-700">Trạng thái báo giá</b>
        <Select
          mode="multiple"
          allowClear
          className="w-full mt-2"
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          placeholder="Chọn trạng thái"
        >
          <Select.Option value="PENDING">Chờ duyệt</Select.Option>
          <Select.Option value="APPROVED">Đã duyệt</Select.Option>
          <Select.Option value="REJECTED">Từ chối</Select.Option>
          <Select.Option value="EXPIRED">Hết hạn</Select.Option>
        </Select>
      </div>

      {/* SORT FIELD */}
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
          <Select.Option value="totalPrice">Giá trị báo giá</Select.Option>
          <Select.Option value="createdAt">Ngày tạo</Select.Option>
          <Select.Option value="totalQuantity">Số lượng</Select.Option>
        </Select>
      </div>

      {/* SORT DIRECTION */}
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
    </div>
  );

  // xử lý delete
  const handleDelete = (id: string) => {
    deleteQuotation.mutate(id, {
      onSuccess: async () => {
        toast.success("Xóa báo giá thành công");
        await queryClient.invalidateQueries({ queryKey: ["quotations"] });
        refetch();
      },
      onError: () => {
        toast.error("Xóa báo giá thất bại");
      },
    });
  };

  /** ======================= Cấu hình bảng ======================= */
  const columns: ColumnsType<IQuotation> = [
    {
      title: "Đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      render: (dealerId: string) =>
        dealerId ? <DealerName dealerId={dealerId} /> : "-",
    },
    {
      title: "Khách hàng",
      dataIndex: "customerId",
      key: "customerId",
      render: (customerId: string) =>
        customerId ? <CustomerName customerId={customerId} /> : "-",
    },
    {
      title: "Số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center",
      sorter: (a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0),
    },
    {
      title: "Tổng thuế",
      dataIndex: "vatAmount",
      key: "vatAmount",
      align: "right",
      sorter: (a, b) => (a.vatAmount || 0) - (b.vatAmount || 0),
      render: (price: number) =>
        price != null ? (
          <span className="font-semibold text-[#627254]">
            {price.toLocaleString("vi-VN")} ₫
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "Tổng giá trị",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      sorter: (a, b) => (a.totalPrice || 0) - (b.totalPrice || 0),
      render: (price: number) =>
        price != null ? (
          <span className="font-semibold text-[#627254]">
            {price.toLocaleString("vi-VN")} ₫
          </span>
        ) : (
          "-"
        ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          PENDING: { color: "gold", text: "Chờ duyệt" },
          APPROVED: { color: "green", text: "Đã duyệt" },
          REJECTED: { color: "red", text: "Từ chối" },
          EXPIRED: { color: "volcano", text: "Hết hạn" },
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
        const isDealerStaff = role === "DEALER_STAFF";
        const isFinalStatus =
          record.status === "APPROVED" || record.status === "REJECTED";

        // MENU ITEMS (dynamic)
        const menuItems = [
          {
            key: "detail",
            label: <span className="text-[14px] px-10">Chi tiết</span>,
            onClick: () => {
              setSelectedQuotationId(record.id);
              setIsViewModalOpen(true);
            },
          },
        ];

        // dealer staff làm hết
        if (isDealerStaff && !isFinalStatus) {
          menuItems.push(
            {
              key: "edit",
              label: <span className="text-[14px] px-10">Sửa báo giá</span>,
              onClick: () => {
                setSelectedQuotationId(record.id);
                setIsUpdateModalOpen(true);
              },
            },
            {
              key: "approve",
              label: <span className="text-[14px] px-10">Duyệt báo giá</span>,
              onClick: () => handleOpenApproveModal(record),
            },
            {
              key: "reject",
              label: <span className="text-[14px] px-10">Từ chối báo giá</span>,
              onClick: () => handleRejectQuotation(record),
            },
            {
              key: "delete",
              label: (
                <span className="text-[14px] px-10 text-red-500">
                  Xóa báo giá
                </span>
              ),
              onClick: () =>
                Modal.confirm({
                  title: "Bạn có chắc muốn xóa báo giá này?",
                  content: "Hành động này không thể hoàn tác.",
                  okText: "Xóa",
                  okButtonProps: { danger: true },
                  cancelText: "Hủy",
                  onOk: () => handleDelete(record.id),
                }),
            }
          );
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

  useDebounce(searchTerm, 300);
  const quotationData = data?.result?.data ?? [];
  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  /** ======================= Render ======================= */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm kiếm số lượng..."
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 320 }}
            className="rounded-md shadow-sm border-gray-300 focus:border-green-600 focus:ring-green-600"
          />
          {/* dropdown list */}
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

        {role === "DEALER_STAFF" && (
          <Button
            type="primary"
            className="bg-[#627254] hover:bg-[#4e5b45]"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Tạo báo giá mới
          </Button>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={quotationData}
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
          showTotal: (t) => `Tổng ${t} báo giá`,
        }}
        bordered
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
      />

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateQuotationModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setPage(1);
            refetch();
          }}
        />
      )}
      {isUpdateModalOpen && selectedQuotationId && (
        <UpdateQuotationModal
          open={isUpdateModalOpen}
          quotationId={selectedQuotationId}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={refetch}
        />
      )}
      {isViewModalOpen && selectedQuotationId && (
        <ViewQuotationDetailModal
          open={isViewModalOpen}
          quotationId={selectedQuotationId}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {/*  duyệt */}
      {isApproveModalOpen && selectedQuotationId && selectedRecord && (
        <ApproveQuotationModal
          open={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          quotationId={selectedQuotationId}
          items={selectedRecord.items || []}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default QuotationList;
