// src/page/promotions/EvmPromotionsPage.tsx
import { useState } from "react";
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
import { PromotionDeleteConfirm } from "../../components/organisms/promotion/PromotionDeleteConfirm";
import { CardWrapper } from "../../components/template/CardWrapper";

const EvmPromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  // EVM chỉ xem GLOBAL
  const { data, isLoading, isFetching, refetch } = usePromotionList(
    "GLOBAL",
    0,
    10
  );
  const promotions: Promotion[] =
    ((data as any)?.result?.data as Promotion[]) ?? [];

  const role = (user as any)?.role as
    | "ADMIN"
    | "EVM_STAFF"
    | "MANAGER"
    | "DEALER_STAFF"
    | undefined;

  // ✅ Quyền đúng yêu cầu
  const canCreate = role === "EVM_STAFF";
  const canEdit = role === "EVM_STAFF" || role === "ADMIN";
  const canDelete = role === "ADMIN";

  const handleCreate = () => {
    if (!canCreate) return;
    const base = `/${String(role || "").toLowerCase()}`;
    navigate(`${base}/promotions/create`, { replace: false });
  };

  const handleEdit = (id: string) => {
    if (!canEdit) return;
    const base = `/${String(role || "").toLowerCase()}`;
    navigate(`${base}/promotions/edit/${id}`, { replace: false });
  };

  const { mutateAsync: deletePromotion, isPending } = usePromotionDelete();

  const handleDeleteClick = (id: string) => {
    if (!canDelete) return;
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
      refetch();
    } catch {
      message.error("Không thể xoá khuyến mãi này!");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Danh sách khuyến mãi toàn hệ thống
        </h2>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="!bg-[#627254] !border-[#627254] text-white hover:!bg-[#4f6f52]"
          >
            Tạo khuyến mãi
          </Button>
        )}
      </div>

      {/* Bảng + phân trang đã căn giữa trong PromotionTable */}
      <PromotionTable
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

export default EvmPromotionsPage;
export { EvmPromotionsPage };
