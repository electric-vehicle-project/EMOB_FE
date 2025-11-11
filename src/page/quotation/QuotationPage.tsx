import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Tag,
  Input,
  Tooltip,
  Modal,
} from "antd";
import SectionTitle from "../../components/atoms/SectionTitle";
import type { ColumnsType } from "antd/es/table";
import type { IQuotation } from "../../model/Quotation";

import CreateQuotationModal from "./CreateQuotationModal";
import UpdateQuotationModal from "./UpdateQuotationModal";
import ViewQuotationDetailModal from "./ViewQuotationDetailModal";
import {
  useApproveQuotation,
  useDeleteQuotation,
  useQuotationsList,
  useRejectQuotation,
} from "../../service/quotationService";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerById } from "../../service/customerService";
import { useDealerByIdQuery } from "../../service/dealerService";
import { SearchOutlined } from "@ant-design/icons";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { useDebounce } from "../../hook/useDebounce";

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

const QuotationPage: React.FC = () => {
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
  const [searchTerm, setSearchTerm] = useState("");

  // duyệt
  const approveQuotation = useApproveQuotation();
  const handleApproveQuotation = async (record: IQuotation) => {
    Modal.confirm({
      title: "Xác nhận duyệt báo giá",
      content: "Bạn có chắc muốn duyệt báo giá này không?",
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const payload = record.items?.map((i: any) => ({
            itemsId: i.id,
            vehicleId: i.vehicleId,
            promotionId: i.promotionId || null,
            quantity: i.quantity || 1,
          }));

          await approveQuotation.mutateAsync({ id: record.id, data: payload });

          message.success("Duyệt báo giá thành công!");
          refetch();
        } catch (err: any) {
          message.error(
            err?.response?.data?.message || "Không thể duyệt báo giá!"
          );
        }
      },
    });
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
          message.success("Đã từ chối báo giá!");
          refetch();
        } catch (err: any) {
          message.error(
            err?.response?.data?.message || "Không thể từ chối báo giá!"
          );
        }
      },
    });
  };

  const { data, isLoading, refetch } = useQuotationsList(
    page - 1,
    pageSize,
    searchTerm
  );
  const deleteQuotation = useDeleteQuotation();

  const handleDelete = (id: string) => {
    deleteQuotation.mutate(id, {
      onSuccess: async () => {
        message.success("Xóa báo giá thành công");
        await queryClient.invalidateQueries({ queryKey: ["quotations"] });
        refetch();
      },
      onError: () => {
        message.error("Xóa báo giá thất bại");
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
      title: "Tổng thuế",
      dataIndex: "vatAmount",
      key: "vatAmount",
      align: "right",
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
        let color = "default";
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
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          {/* Xem chi tiết */}
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              onClick={() => {
                setSelectedQuotationId(record.id);
                setIsViewModalOpen(true);
              }}
            >
              Chi tiết
            </Button>
          </Tooltip>

          {/* Sửa */}
          {role === "DEALER_STAFF" && (
            <Tooltip title="Sửa báo giá">
              <Button
                size="small"
                style={{
                  backgroundColor: "#627254",
                  color: "white",
                  border: "none",
                }}
                className="bg-green-600 hover:bg-green-700 border-green-600"
                onClick={() => {
                  setSelectedQuotationId(record.id);
                  setIsUpdateModalOpen(true);
                }}
                disabled={record.status === "APPROVED"}
              >
                Sửa
              </Button>
            </Tooltip>
          )}

          {role === "DEALER_STAFF" && (
            <>
              {/* Nút Duyệt */}
              <Tooltip title="Duyệt báo giá">
                <Button
                  size="small"
                  style={{
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "none",
                  }}
                  onClick={() => handleApproveQuotation(record)}
                  disabled={record.status !== "PENDING"}
                  loading={approveQuotation.isPending}
                >
                  Duyệt
                </Button>
              </Tooltip>

              {/* Nút Từ chối */}
              <Tooltip title="Từ chối báo giá">
                <Button
                  size="small"
                  style={{
                    backgroundColor: "#9ca3af",
                    color: "white",
                    border: "none",
                  }}
                  onClick={() => handleRejectQuotation(record)}
                  disabled={record.status !== "PENDING"}
                  loading={rejectQuotation.isPending}
                >
                  Từ chối
                </Button>
              </Tooltip>
            </>
          )}

          {/* Xóa */}
          {role === "DEALER_STAFF" && (
            <Popconfirm
              title="Bạn có chắc muốn xóa báo giá này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa báo giá">
                <Button
                  size="small"
                  style={{
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                  }}
                  disabled={record.status === "APPROVED"}
                >
                  Xóa{" "}
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  const debouncedSearch = useDebounce(searchTerm, 300);
  const quotationData = data?.result?.data ?? [];
  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  /** ======================= Render ======================= */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <SectionTitle text="Quản lý báo giá" />
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
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={quotationData}
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
    </div>
  );
};

export default QuotationPage;
