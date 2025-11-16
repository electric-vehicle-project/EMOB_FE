import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { CardWrapper } from "../../components/template/CardWrapper";
import {
  useDealerPointRuleList,
  useDealerPointRuleByDealerId,
  useDealerPointRuleUpdate,
} from "../../service/dealerPointRuleService";
import type { IDealerPointRule } from "../../model/DealerPointRule";
import { useMemo } from "react";
import { DealerPointRuleTable } from "../../components/organisms/dealerPointRule/DealerPointRuleTable";
import type { IAccount } from "../../model/Account";

export const DealerPointRulePage: React.FC = () => {
  // Lấy thông tin user từ Redux
  const user = useSelector((s: RootState) => s.user);
  const typedUser: IAccount | null = user;

  // Xác định vai trò hiện tại
  const role =
    (typedUser?.role as "ADMIN" | "EVM_STAFF" | "MANAGER" | "DEALER_STAFF") ??
    "DEALER_STAFF";

  // Lấy dealerId từ tài khoản (chỉ có cho MANAGER / DEALER_STAFF)
  const dealerId = typedUser?.dealerId;

  // ADMIN / EVM_STAFF xem toàn bộ quy tắc
  const { data: allRules, isLoading: loadingAll } = useDealerPointRuleList();

  // MANAGER / DEALER_STAFF xem quy tắc của đại lý mình
  const {
    data: dealerRules,
    isLoading: loadingDealer,
    refetch: refetchDealer,
  } = useDealerPointRuleByDealerId(dealerId, { enabled: !!dealerId });

  // Kết hợp dữ liệu tùy role
  const rules: IDealerPointRule[] = useMemo(() => {
    if (role === "ADMIN" || role === "EVM_STAFF") return allRules?.result ?? [];
    return dealerRules?.result ?? [];
  }, [role, allRules, dealerRules]);

  // Trạng thái loading tổng
  const isLoading =
    role === "ADMIN" || role === "EVM_STAFF" ? loadingAll : loadingDealer;

  // Phân quyền thao tác
  const canUpdate = role === "MANAGER"; // chỉ MANAGER được cập nhật
  const editable = role === "ADMIN" || role === "MANAGER"; // chỉ ADMIN và MANAGER được sửa ô

  // Hook cập nhật rule
  const { mutateAsync: updateRule, isPending: updating } =
    useDealerPointRuleUpdate();

  // Hàm xử lý cập nhật
  const handleUpdate = async (updatedRules: IDealerPointRule[]) => {
    if (!canUpdate) return;
    if (!dealerId) {
      toast.error("Không tìm thấy dealerId của tài khoản!");
      return;
    }

    try {
      const payload = updatedRules.map((r) => ({
        level: r.membershipLevel,
        dealerId,
        minPoints: r.minPoints,
        price: r.price,
      }));

      await updateRule({ id: dealerId, data: payload });
      toast.success("Cập nhật quy tắc điểm thưởng thành công!");
      refetchDealer();
    } catch {
      toast.error("Không thể cập nhật quy tắc điểm thưởng!");
    }
  };

  return (
    <CardWrapper>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Quy tắc tích điểm của đại lý
        </h2>
      </div>

      {/* Bảng dữ liệu */}
      <DealerPointRuleTable
        data={rules}
        loading={isLoading || updating}
        editable={editable}
        onUpdate={canUpdate ? handleUpdate : undefined} // chỉ MANAGER có thể cập nhật
      />
    </CardWrapper>
  );
};

export default DealerPointRulePage;
