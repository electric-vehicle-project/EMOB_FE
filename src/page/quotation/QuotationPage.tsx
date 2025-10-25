import React, { useState } from "react";
import { Table, Button, message, Popconfirm, Tag } from "antd";
import SectionTitle from "../../components/atoms/SectionTitle";
import type { ColumnsType } from "antd/es/table";
import type { IQuotation, IQuotationItem } from "../../model/Quotation";

import CreateQuotationModal from "./CreateQuotationModal";
import UpdateQuotationModal from "./UpdateQuotationModal";
import ViewQuotationDetailModal from "./ViewQuotationDetailModal";
import ApproveQuotationModal from "./ApproveQuotationModal";
import {
  useDeleteQuotation,
  useQuotationsList,
} from "../../service/quotationService";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerById } from "../../service/customerService";
import { useGetDealerById } from "../../service/dealerService";

const CustomerName: React.FC<{ customerId: string }> = ({ customerId }) => {
  const { data, isLoading } = useCustomerById(customerId);

  if (isLoading) return <span>...</span>;
  return <span>{data?.result?.fullName || "-"}</span>;
};

const DealerName: React.FC<{ dealerId: string }> = ({ dealerId }) => {
  const { data, isLoading } = useGetDealerById(dealerId);

  if (isLoading) return <span>...</span>;
  return <span>{data?.result?.name || "-"}</span>;
};

const QuotationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(
    null
  );
  const [selectedRecord, setSelectedRecord] = useState<IQuotation | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  /** Query: danh sách báo giá */
  const { data, isLoading, refetch } = useQuotationsList(page - 1, pageSize); // backend start = 0

  /** Mutation: xóa báo giá */
  const deleteQuotation = useDeleteQuotation();

  const handleDelete = (id: string) => {
    deleteQuotation.mutate(id, {
      onSuccess: async () => {
        message.success("Xóa báo giá thành công");
        // 🔄 Làm mới cache + gọi lại API để hiển thị tức thì
        await queryClient.invalidateQueries({ queryKey: ["quotations"] });
        refetch();
      },
      onError: () => {
        message.error("Xóa báo giá thất bại");
      },
    });
  };

  /** Cấu hình bảng */
  const columns: ColumnsType<IQuotation> = [
    {
      title: "Mã báo giá",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <span className="font-mono text-gray-700">{id.slice(0, 8)}...</span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerId",
      key: "customerId",
      render: (customerId: string) =>
        customerId ? <CustomerName customerId={customerId} /> : "-",
    },
    {
      title: "Đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      render: (dealerId: string) =>
        // dealerId ? <DealerName dealerId={dealerId} /> : "-",
        dealerId,
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
        price != null ? `${price.toLocaleString("vi-VN")} ₫` : "-",
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
          default:
            color = "blue";
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
          <Button
            size="small"
            onClick={() => {
              setSelectedQuotationId(record.id);
              setIsViewModalOpen(true);
            }}
          >
            Chi tiết
          </Button>

          <Button
            size="small"
            type="primary"
            className="bg-green-600 hover:bg-green-700 border-green-600"
            onClick={() => {
              setSelectedQuotationId(record.id);
              setIsUpdateModalOpen(true);
            }}
          >
            Sửa
          </Button>

          <Button
            size="small"
            style={{
              backgroundColor: "#16a34a", // tương đương bg-green-600
              color: "white",
              border: "none",
            }}
            onClick={() => {
              setSelectedRecord(record);
              setIsApproveModalOpen(true);
            }}
            disabled={record.status === "APPROVED"}
          >
            Duyệt
          </Button>

          <Popconfirm
            title="Bạn có chắc muốn xóa báo giá này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              style={{
                backgroundColor: "red", // tương đương bg-green-600
                color: "white",
                border: "none",
              }}
            >
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const quotationData = data?.result?.data ?? [];
  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <SectionTitle text="Quản lý báo giá" />
        <Button
          type="primary"
          className="bg-green-700"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Tạo báo giá mới
        </Button>
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
        className="bg-white rounded-lg shadow-sm"
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

      {isApproveModalOpen && selectedRecord && (
        <ApproveQuotationModal
          open={isApproveModalOpen}
          record={selectedRecord}
          onClose={() => setIsApproveModalOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default QuotationPage;
