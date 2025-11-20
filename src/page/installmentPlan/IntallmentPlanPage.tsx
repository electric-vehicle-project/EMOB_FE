import { InstallmentPlanList } from "../../components/organisms/installmentPlan/InstallmentPlanList";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../model/routePaths";
import { Button } from "antd";

export const InstallmentPlanPage = () => {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const role = (user as { role?: string } | null)?.role || "";

  const canAccess = ["ADMIN", "EVM_STAFF", "DEALER_STAFF", "MANAGER"].includes(
    role
  );

  // ------ ONLY dealer staff & manager can view link ------
  const canViewCustomerLink = role === "DEALER_STAFF" || role === "MANAGER";

  return (
    <CardWrapper
      title="Quản lý kế hoạch trả góp"
      subtitle={
        canAccess
          ? "Theo dõi và quản lý thông tin các kế hoạch trả góp trong hệ thống"
          : "Bạn không có quyền truy cập trang này"
      }
      variant="dashboard"
      rightLink={
        canViewCustomerLink ? (
          <Button
            type="primary"
            onClick={() =>
              navigate(
                `/${role.toLowerCase()}/${ROUTES.INSTALLMENT_PLAN_CUSTOMERS}`
              )
            }
          >
            Danh sách hợp đồng bàn giao với Hãng xe
          </Button>
        ) : undefined
      }
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
