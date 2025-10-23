import React, { useState, useEffect } from "react";
import { Table, Button, message, Popconfirm, Tag, Modal, Select } from "antd";
import axios from "axios";
import SectionTitle from "../../components/atoms/SectionTitle";
import type { ColumnsType } from "antd/es/table";
import type { IQuotationItem } from "../../model/Quotation";
import CreateQuotationPage from "./CreateQuotationModal";
import UpdateQuotationPage from "./UpdateQuotationModal";
import ViewQuotationDetailModal from "./ViewQuotationDetailModal";
import { Form } from "react-router-dom";
import SelectInput from "../../components/atoms/SelectInput";
import ApproveQuotationModal from "./ApproveQuotationModal";

const QuotationPage: React.FC = () => {
  const [data, setData] = useState<IQuotationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(
    null
  );
  const [selectedRecord, setSelectedRecord] = useState<IQuotationItem | null>(
    null
  );

  /** 🔹 Fetch quotations */
  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/quotations", {
        params: { page, size: pageSize },
      });
      setData(res.data.result.data);
      setTotal(res.data.result.metadata.totalElements);
    } catch (err) {
      console.error(err);
      message.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [page, pageSize]);

  /** Delete quotation */
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/quotations/${id}`);
      message.success("Quotation deleted successfully");
      fetchQuotations();
    } catch {
      message.error("Failed to delete quotation");
    }
  };

  /** Table columns */
  const columns: ColumnsType<IQuotationItem> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <span className="font-mono">{id.slice(0, 8)}...</span>
      ),
    },
    {
      title: "Customer ID",
      dataIndex: "customerId",
      key: "customerId",
    },
    {
      title: "Dealer ID",
      dataIndex: "dealerId",
      key: "dealerId",
    },
    {
      title: "Total Quantity",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center",
      sorter: (a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0),
      render: (q) => <strong>{q ?? "-"}</strong>,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      sorter: (a, b) => (a.totalPrice || 0) - (b.totalPrice || 0),
      render: (price: number) =>
        price != null ? `$${price.toLocaleString()}` : "-",
    },
    {
      title: "Status",
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
      title: "Actions",
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
            onClick={() => {
              setSelectedQuotationId(record.id);
              setIsUpdateModalOpen(true);
            }}
          >
            Edit
          </Button>

          <Button
            size="small"
            type="dashed"
            onClick={() => {
              setSelectedRecord(record);
              setIsApproveModalOpen(true);
            }}
          >
            Approve
          </Button>

          <Popconfirm
            title="Bạn có chắc chắn muốn xóa báo giá này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-4">
        <SectionTitle text="Quotation Management" />
        <Button
          type="primary"
          className="bg-green-700"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Tạo báo giá mới
        </Button>
      </div>

      {/* 🔹 Table */}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
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
          showTotal: (t) => `Tổng ${t} báo giá`,
        }}
        bordered
        className="bg-white rounded-lg shadow-sm"
      />

      {/* 🔹 Modals */}
      {isCreateModalOpen && (
        <CreateQuotationPage
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchQuotations}
        />
      )}

      {isUpdateModalOpen && selectedQuotationId && (
        <UpdateQuotationPage
          open={isUpdateModalOpen}
          quotationId={selectedQuotationId}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={fetchQuotations}
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
          onSuccess={fetchQuotations}
        />
      )}
    </div>
  );
};

export default QuotationPage;
