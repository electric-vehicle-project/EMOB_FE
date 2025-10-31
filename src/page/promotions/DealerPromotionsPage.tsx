// src/page/promotions/DealerPromotionsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

import type { RootState } from "../../redux/store";
import type { Promotion } from "../../model/Promotion";
import {
  usePromotionDelete,
  usePromotionList,
} from "../../service/promotionService";

import { PromotionTable } from "../../components/organisms/promotion/PromotionTable";
import { PromotionFilterBar } from "../../components/organisms/promotion/PromotionFilterBar";
import { PromotionDeleteConfirm } from "../../components/organisms/promotion/PromotionDeleteConfirm";
import { CardWrapper } from "../../components/template/CardWrapper";

const DealerPromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  // ========================
  // State
  // ========================
  const [scope, setScope] = useState<"LOCAL" | "GLOBAL">("LOCAL");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  // ========================
  // Data
  // ========================
  // service của bạn: usePromotionList(scope, page, size)
  const {
    data,
    isLoading,
    isFetching,
    refetch, // có sẵn từ createQueryHook
  } = usePromotionList(scope, 0, 10);

  // ép kiểu mềm để tránh gãy nếu BE đổi shape
  const promotions: Promotion[] =
    ((data as any)?.result?.data as Promotion[]) ?? [];

  // Force refetch ngay khi đổi scope (chữa dứt điểm “bấm tab không đổi”)
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // ========================
  // Permission
  // ========================
  const role = (user as any)?.role as
    | "ADMIN"
    | "MANAGER"
    | "DEALER_STAFF"
    | "EVM_STAFF"
    | undefined;

  // Theo yêu cầu trước: DEALER_STAFF có thể TẠO & SỬA, không được XOÁ
  const canCreate = role === "MANAGER" || role === "DEALER_STAFF";
  const canEdit = role === "MANAGER" || role === "DEALER_STAFF";
  const canDelete = role === "MANAGER";

  // ========================
  // Summary for filter badges
  // ========================
  const statusCounts = useMemo(() => {
    const counts = { all: 0, active: 0, upcoming: 0, expired: 0 };
    promotions.forEach((p) => {
      counts.all++;
      if (p.status === "ACTIVE") counts.active++;
      else if (p.status === "UPCOMING") counts.upcoming++;
      else if (p.status === "EXPIRED") counts.expired++;
    });
    return counts;
  }, [promotions]);

  // ========================
  // Handlers
  // ========================
  const handleCreate = () => {
    const base = `/${String(role || "").toLowerCase()}`;
    navigate(`${base}/promotions/create`, { replace: false });
  };

  const handleEdit = (id: string) => {
    const base = `/${String(role || "").toLowerCase()}`;
    navigate(`${base}/promotions/edit/${id}`, { replace: false });
  };

  const { mutateAsync: deletePromotion, isPending } = usePromotionDelete();

  const handleDeleteClick = (id: string) => {
    const target = promotions.find((p) => p.id === id);
    if (!target) return;
    setSelectedPromotion(target);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPromotion) return;
    try {
      await deletePromotion(selectedPromotion.id);
      message.success("Đã xoá khuyến mãi thành công!");
      refetch(); // reload lại danh sách sau khi xoá
    } catch {
      message.error("Không thể xoá khuyến mãi này!");
    } finally {
      setConfirmOpen(false);
    }
  };

  // Dùng key để buộc table re-render khi đổi scope (tránh giữ state cũ)
  const listKey = `promotion-${scope}`;

  // ========================
  // Render
  // ========================
  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Danh sách khuyến mãi của đại lý
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="!bg-[#627254] !border-[#627254] text-white hover:!bg-[#4f6f52]"
          disabled={!canCreate}
        >
          Tạo khuyến mãi
        </Button>
      </div>

      <PromotionFilterBar
        counts={statusCounts}
        defaultScope={scope}
        onScopeChange={(s) => setScope(s)} // đổi scope -> useEffect sẽ refetch
      />

      <PromotionTable
        key={listKey}
        data={promotions}
        loading={isLoading || isFetching}
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
    </CardWrapper>
  );
};

export default DealerPromotionsPage;
export { DealerPromotionsPage };
