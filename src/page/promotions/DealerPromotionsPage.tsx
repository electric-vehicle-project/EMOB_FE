import { useEffect, useMemo, useState } from "react";
import { message, Button } from "antd";
import { useNavigate } from "react-router";
import { PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import type { RootState } from "../../redux/store";
import type { Promotion } from "../../model/Promotion";
import {
  usePromotionDelete,
  usePromotionList,
} from "../../service/promotionService";
import { PromotionTable } from "../../components/organisms/promotion/PromotionTable";
import { PromotionDeleteConfirm } from "../../components/organisms/promotion/PromotionDeleteConfirm";
import { PromotionFilterBar } from "../../components/organisms/promotion/PromotionFilterBar";

export const DealerPromotionsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.user);

  // --- UI state
  const [scope, setScope] = useState<"LOCAL" | "GLOBAL">("LOCAL");
  const [status, setStatus] = useState<string>("ALL");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  // --- Data
  // IMPORTANT: hook usePromotionList(scope) cần có queryKey dạng ["promotions", scope]
  // Nếu SDK của bạn đã làm vậy thì tự động tách cache theo scope.
  const { data, isLoading, isFetching, refetch, fetchStatus } =
    usePromotionList(scope);
  const { mutateAsync: deletePromotion, isPending } = usePromotionDelete();
  const promotions: Promotion[] = (data?.result?.data as Promotion[]) ?? [];

  // --- Role permission
  const role = (user as any)?.role as string | undefined;
  const canCreate = role === "MANAGER" || role === "DEALER_STAFF";
  const canEdit = role === "MANAGER" || role === "DEALER_STAFF"; // ✅ DEALER_STAFF được sửa
  const canDelete = role === "MANAGER"; // ❌ STAFF không được xoá

  // --- Chuyển scope: luôn hiển thị trạng thái loading “thật”
  // Không dùng dữ liệu cũ khi đang fetch; tránh cảm giác “lệch scope”
  const [isSwitching, setIsSwitching] = useState(false);
  const handleScopeChange = (s: "LOCAL" | "GLOBAL") => {
    setScope(s);
    setIsSwitching(true);
    // Xoá cache scope còn lại để không bị tái dùng nhầm
    queryClient.removeQueries({
      queryKey: ["promotions", s === "LOCAL" ? "GLOBAL" : "LOCAL"],
    });
    refetch();
  };
  useEffect(() => {
    // Khi query đã xong (fetchStatus idle) thì tắt cờ switching
    if (!isFetching && fetchStatus === "idle") setIsSwitching(false);
  }, [isFetching, fetchStatus]);

  // --- Đếm trạng thái: nếu API chưa trả status, tự suy luận từ ngày
  const statusCounts = useMemo(() => {
    const counts = { all: 0, active: 0, upcoming: 0, expired: 0 };
    const now = new Date().getTime();

    promotions.forEach((p: Promotion) => {
      counts.all++;
      const s = p.status as string | undefined;
      if (s === "ACTIVE") counts.active++;
      else if (s === "UPCOMING") counts.upcoming++;
      else if (s === "EXPIRED") counts.expired++;
      else {
        // fallback theo ngày nếu thiếu status
        const a = p.startDate ? new Date(p.startDate).getTime() : NaN;
        const b = p.endDate ? new Date(p.endDate).getTime() : NaN;
        if (!isNaN(a) && !isNaN(b)) {
          if (now >= a && now <= b) counts.active++;
          else if (now < a) counts.upcoming++;
          else if (now > b) counts.expired++;
        }
      }
    });
    return counts;
  }, [promotions]);

  // --- Actions
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

  const rolePath = role ? `/${role.toLowerCase()}` : "";
  const handleEdit = (id: string) => {
    // ✅ chuẩn path: /dealer_staff/promotion/edit/:id
    navigate(`${rolePath}/promotions/edit/${id}`);
  };
  const handleCreate = () => {
    // ✅ chuẩn path: /dealer_staff/promotion/create
    navigate(`${rolePath}/promotions/create`);
  };
  const handleDeleteClick = (id: string) => {
    const target = promotions.find((p: Promotion) => p.id === id);
    if (!target) return;
    setSelectedPromotion(target);
    setConfirmOpen(true);
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Danh sách khuyến mãi của đại lý
        </h2>

        {/* Luôn hiển thị nút Tạo, nhưng disable nếu không có quyền */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="bg-[#627254]"
          disabled={!canCreate}
        >
          Tạo khuyến mãi
        </Button>
      </div>

      <PromotionFilterBar
        counts={statusCounts}
        defaultScope={scope}
        onScopeChange={handleScopeChange}
        onStatusChange={(s) => setStatus(s)}
      />

      <PromotionTable
        data={
          // Khi đang chuyển scope, xoá dữ liệu cũ để tránh “nhảy nhầm”
          isSwitching ? [] : promotions
        }
        loading={isLoading || isSwitching}
        // Luôn render nút nhưng disable theo quyền (đã đổi bên trong table)
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

export default DealerPromotionsPage;
