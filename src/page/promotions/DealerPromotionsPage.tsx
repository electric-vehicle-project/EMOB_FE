import { useState, useMemo } from "react";
import { message, Button } from "antd";
import { useNavigate } from "react-router";
import { PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { Promotion } from "../../model/Promotion";
import {
  usePromotionDelete,
  usePromotionList,
} from "../../service/promotionService";
import { PromotionTable } from "../../components/organisms/promotion/PromotionTable";
import { PromotionDeleteConfirm } from "../../components/organisms/promotion/PromotionDeleteConfirm";
import { PromotionFilterBar } from "../../components/organisms/promotion/PromotionFilterBar";

/**
 * DealerPromotionsPage
 * ---------------------------------------
 * Hiển thị danh sách khuyến mãi (LOCAL scope)
 * - Dealer Manager và Dealer Staff CRUD trong phạm vi LOCAL
 * - Dùng chung UI với EvmPromotionsPage (PromotionTable + Filter + Confirm)
 * ---------------------------------------
 */
export const DealerPromotionsPage = () => {
  // ========================
  // 🔹 Hook khởi tạo
  // ========================
  const navigate = useNavigate();
  // SỬA LỖI 1: Redux state có field `user`, không phải `auth`
  const user = useSelector((state: RootState) => state.user);

  // ========================
  // 🔹 State quản lý filter + modal
  // ========================
  const [scope, setScope] = useState<"LOCAL" | "GLOBAL">("LOCAL");
  const [status, setStatus] = useState<string>("ALL");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  // ========================
  // 🔹 Fetch API
  // ========================
  const { data, isLoading, refetch } = usePromotionList(scope);
  const { mutateAsync: deletePromotion, isPending } = usePromotionDelete();

  // Dữ liệu bảng
  const promotions: Promotion[] = (data?.result?.data as Promotion[]) ?? [];

  // Nếu có dùng filter theo status, tránh cảnh báo unused:
  const filteredPromotions = useMemo(() => {
    if (status === "ALL") return promotions;
    return promotions.filter((p: Promotion) => p.status === status);
  }, [promotions, status]);

  // ========================
  // 🔹 Role-based Permission
  // ========================
  const role = (user as any)?.role as string | undefined;
  const canCreate = role === "MANAGER" || role === "DEALER_STAFF";
  const canEdit = role === "MANAGER";
  const canDelete = role === "MANAGER";

  // ========================
  // 🔹 Tính tổng trạng thái cho FilterBar
  // ========================
  const statusCounts = useMemo(() => {
    const counts = { all: 0, active: 0, upcoming: 0, expired: 0 };
    // SỬA LỖI 3: khai báo kiểu cho p
    promotions.forEach((p: Promotion) => {
      counts.all++;
      if (p.status === "ACTIVE") counts.active++;
      else if (p.status === "UPCOMING") counts.upcoming++;
      else if (p.status === "EXPIRED") counts.expired++;
    });
    return counts;
  }, [promotions]);

  // ========================
  // 🔹 Handle Event
  // ========================
  const handleDelete = async () => {
    if (!selectedPromotion) return;
    try {
      await deletePromotion(selectedPromotion.id);
      message.success("Đã xoá khuyến mãi thành công!");
      refetch();
    } catch {
      message.error("Không thể xoá khuyến mãi này!");
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/promotion/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    // SỬA LỖI 4: khai báo kiểu cho p
    const target = promotions.find((p: Promotion) => p.id === id);
    if (!target) return;
    setSelectedPromotion(target);
    setConfirmOpen(true);
  };

  // ========================
  // 🔹 Render
  // ========================
  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Danh sách khuyến mãi của đại lý
        </h2>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/promotion/create")}
          >
            Tạo khuyến mãi
          </Button>
        )}
      </div>

      <PromotionFilterBar
        counts={statusCounts}
        defaultScope={scope}
        onScopeChange={(s) => {
          setScope(s);
          refetch();
        }}
        onStatusChange={(s) => setStatus(s)}
      />

      <PromotionTable
        data={filteredPromotions}
        loading={isLoading}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <PromotionDeleteConfirm
        open={confirmOpen}
        promotionName={selectedPromotion?.name}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={isPending}
      />
    </div>
  );
};
