// src/pages/EvmPromotionsPage.tsx
import { useState } from "react";
import { Button, Popconfirm, Table, Tabs, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  usePromotionDelete,
  usePromotionList,
} from "../../service/promotionService";

// ===== Kiểu dữ liệu chuẩn cho promotion =====
interface Promotion {
  id: string;
  name: string;
  description: string;
  type: "PERCENTAGE" | "AMOUNT" | "ACCESSORY" | "INSTALLMENT_SUPPORT" | string;
  value: number;
  status: "UPCOMING" | "ACTIVE" | "EXPIRED" | string;
}

export default function EvmPromotionsPage() {
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => {
    const u = state.user as { role?: string } | null;
    return u?.role ?? null;
  });

  const [tabKey, setTabKey] = useState("Tất cả");
  const [page, setPage] = useState(0);

  // Gọi API
  const {
    data: promotionData,
    isLoading,
    refetch,
  } = usePromotionList("GLOBAL", page, 10);

  const deletePromotion = usePromotionDelete();

  // Dữ liệu trả về từ backend
  const promotions: Promotion[] = promotionData?.result?.data ?? [];

  // ===== Xử lý xóa =====
  const handleDelete = async (id: string) => {
    try {
      await deletePromotion.mutateAsync(id);
      message.success("Xoá khuyến mãi thành công!");
      refetch();
    } catch {
      message.error("Xoá khuyến mãi thất bại!");
    }
  };

  // ===== Chuyển sang trang chỉnh sửa =====
  const handleEdit = (id: string) => navigate(`/admin/promotions/${id}/edit`);

  // ===== Tabs =====
  const items = [
    { key: "Tất cả", label: "Tất cả" },
    { key: "Đang hoạt động", label: "Đang hoạt động" },
    { key: "Chờ duyệt", label: "Chờ duyệt" },
    { key: "Hết hạn", label: "Hết hạn" },
  ];

  // ===== Cột của bảng =====
  const columns = [
    {
      title: "Tên khuyến mãi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (t: Promotion["type"]) =>
        t === "PERCENTAGE" ? "Giảm theo %" : t,
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (v: number) => `${v ?? 0}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: Promotion["status"]) => {
        switch (s) {
          case "UPCOMING":
            return "Sắp diễn ra";
          case "ACTIVE":
            return "Đang hoạt động";
          case "EXPIRED":
            return "Đã hết hạn";
          default:
            return "Không xác định";
        }
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      render: (_: unknown, record: Promotion) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Button
            icon={<EditOutlined />}
            size="middle"
            onClick={() => handleEdit(record.id)}
          >
            Sửa
          </Button>
          {role === "ADMIN" && (
            <Popconfirm
              title="Xác nhận xoá"
              description="Bạn có chắc chắn muốn xoá khuyến mãi này không?"
              okText="Xoá"
              cancelText="Huỷ"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                icon={<DeleteOutlined />}
                size="middle"
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                }}
                className="hover:!bg-[#b91c1c]"
              >
                Xoá
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  // ===== Render chính =====
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Khuyến mãi toàn hệ thống</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: "#627254" }}
          onClick={() => navigate("/admin/promotions/create")}
        >
          Tạo khuyến mãi
        </Button>
      </div>

      <Tabs items={items} activeKey={tabKey} onChange={setTabKey} />

      <Spin spinning={isLoading}>
        <Table<Promotion>
          dataSource={promotions}
          columns={columns}
          rowKey={(record) => record.id}
          pagination={{
            current: page + 1,
            pageSize: 10,
            onChange: (p) => setPage(p - 1),
          }}
          locale={{ emptyText: "Không có khuyến mãi nào." }}
        />
      </Spin>
    </div>
  );
}
