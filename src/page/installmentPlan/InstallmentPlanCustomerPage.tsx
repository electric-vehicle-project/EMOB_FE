// src/pages/InstallmentPlanPage.tsx
import { InstallmentPlanCustomerList } from "../../components/organisms/installmentPlan/InstallmentPlanCustomerList";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const InstallmentPlanCustomersPage = () => {
  const user = useCurrentUser();
  const canAccess = ["DEALER_STAFF", "MANAGER"].includes(
    (user as { role?: string } | null)?.role || ""
  );

  return (
    <CardWrapper
      title="Quản lý kế hoạch trả góp khách hàng"
      subtitle={
        canAccess
          ? "Theo dõi và quản lý thông tin các kế hoạch trả góp trong hệ thống"
          : "Bạn không có quyền truy cập trang này"
      }
      variant="dashboard"
    >
      {canAccess ? (
        <InstallmentPlanCustomerList />
      ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )}
    </CardWrapper>
  );
};
