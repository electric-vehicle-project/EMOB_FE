// src/pages/InstallmentPlanPage.tsx
import { InstallmentPlanList } from "../../components/organisms/installmentPlan/InstallmentPlanList";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const InstallmentPlanPage = () => {
  const user = useCurrentUser();
  const canAccess = ["ADMIN", "EVM_STAFF", "DEALER_STAFF", "MANAGER"].includes(
    (user as { role?: string } | null)?.role || ""
  );

  return (
    <CardWrapper
      title="Quản lý kế hoạch trả góp"
      subtitle={
        canAccess
          ? "Theo dõi và quản lý thông tin các kế hoạch trả góp trong hệ thống"
          : "Bạn không có quyền truy cập trang này"
      }
      variant="dashboard"
    >
      {canAccess ? (
        <InstallmentPlanList />
      ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )}
    </CardWrapper>
  );
};
