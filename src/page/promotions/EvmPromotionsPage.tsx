import { useMemo, useState } from "react";
import { Button, Modal, Table, Tabs, message, Spin } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import type { RootState } from "../../redux/store";
import {
  usePromotionDelete,
  usePromotionList,
} from "../../service/promotionService";
import { ROUTES } from "../../model/routePaths";

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

  // ===== Lấy role từ Redux =====
  const role = useSelector((state: RootState) => {
    const u = state.user as { role?: string } | null;
    return u?.role ?? null;
  });

  const [tabKey, setTabKey] = useState("all");
  const [page, setPage] = useState(0);

  // ===== Gọi API danh sách khuyến mãi GLOBAL =====
  const {
    data: promotionData,
    isLoading,
    refetch,
  } = usePromotionList("GLOBAL", page, 10);

  const deletePromotion = usePromotionDelete();
  const promotions = useMemo<Promotion[]>(() => {
    return promotionData?.result?.data ?? [];
  }, [promotionData]);

  // ===== Tính toán số lượng khuyến mãi =====
  const tabCounts = useMemo(() => {
    const all = promotions.length;
    const active = promotions.filter((p) => p.status === "ACTIVE").length;
    const expired = promotions.filter((p) => p.status === "EXPIRED").length;
    const pending = promotions.filter(
      (p) => !p.status || !p.type || p.value === 0 || p.value == null
    ).length;
    return { all, active, expired, pending };
  }, [promotions]);

  // ===== Bộ lọc tab =====
  const filtered = useMemo(() => {
    switch (tabKey) {
      case "active":
        return promotions.filter((p) => p.status === "ACTIVE");
      case "expired":
        return promotions.filter((p) => p.status === "EXPIRED");
      case "pending":
        return promotions.filter(
          (p) => !p.status || !p.type || p.value === 0 || p.value == null
        );
      default:
        return promotions;
    }
  }, [tabKey, promotions]);

  // ===== Xử lý xoá =====
  const handleDelete = async (id: string) => {
    try {
      await deletePromotion.mutateAsync(id);
      message.success("Xoá khuyến mãi thành công!");
      refetch();
    } catch {
      message.error("Xoá khuyến mãi thất bại!");
    }
  };

  // ===== Hiện popup cảnh báo =====
  const showNoPermission = (action: string) => {
    Modal.warning({
      title: "Không có quyền",
      content: `Bạn không có quyền thực hiện hành động "${action}".`,
      okText: "Đã hiểu",
    });
  };

  // ===== Điều hướng sang trang sửa =====
  const handleEdit = (id: string) => {
    if (role === "EVM_STAFF")
      navigate(`${ROUTES.EVM_STAFF}/promotions/edit/${id}`);
    else if (role === "ADMIN")
      navigate(`${ROUTES.ADMIN}/promotions/edit/${id}`);
  };

  // ===== Tabs có đếm số lượng =====
  const items = [
    { key: "all", label: `Tất cả (${tabCounts.all})` },
    { key: "active", label: `Đang hoạt động (${tabCounts.active})` },
    { key: "pending", label: `Chờ duyệt (${tabCounts.pending})` },
    { key: "expired", label: `Hết hạn (${tabCounts.expired})` },
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
      render: (_: unknown, record: Promotion) => {
        const canDelete = role === "ADMIN";
        return (
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {/* Nút sửa luôn hoạt động */}
            <Button
              icon={<EditOutlined />}
              size="middle"
              type="primary"
              onClick={() => handleEdit(record.id)}
              style={{
                backgroundColor: "#627254",
                border: "none",
              }}
            >
              Sửa
            </Button>

            {/* Nút xoá: làm xám với EVM_STAFF */}
            <Button
              icon={<DeleteOutlined />}
              size="middle"
              onClick={
                canDelete
                  ? () =>
                      Modal.confirm({
                        title: "Xác nhận xoá",
                        content:
                          "Bạn có chắc chắn muốn xoá khuyến mãi này không?",
                        okText: "Xoá",
                        cancelText: "Huỷ",
                        okButtonProps: { danger: true },
                        onOk: () => handleDelete(record.id),
                      })
                  : () => showNoPermission("Xoá khuyến mãi")
              }
              style={{
                background: canDelete ? "#dc2626" : "#d9d9d9",
                color: canDelete ? "#fff" : "#666",
                border: "none",
                cursor: canDelete ? "pointer" : "not-allowed",
              }}
            >
              Xoá
            </Button>
          </div>
        );
      },
    },
  ];

  // ===== Render =====
  const canCreate = role === "EVM_STAFF"; // Chỉ EVM_STAFF được tạo

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Khuyến mãi toàn hệ thống</h2>

        {/* Nút tạo khuyến mãi — làm xám nếu ADMIN */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={
            canCreate
              ? () => navigate(`${ROUTES.EVM_STAFF}/promotions/create`)
              : () => showNoPermission("Tạo khuyến mãi")
          }
          style={{
            background: canCreate ? "#627254" : "#d9d9d9",
            border: "none",
            color: canCreate ? "#fff" : "#666",
            cursor: canCreate ? "pointer" : "not-allowed",
          }}
        >
          Tạo khuyến mãi
        </Button>
      </div>

      <Tabs items={items} activeKey={tabKey} onChange={setTabKey} />

      <Spin spinning={isLoading}>
        <Table<Promotion>
          dataSource={filtered}
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
