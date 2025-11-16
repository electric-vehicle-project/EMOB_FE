import DealerDiscountPolicyList from "../../components/organisms/dealerDiscountPolicy/DealerDiscountPolicyList";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const DealerDiscountPolicyPage = () => {
  const user = useCurrentUser();
  const role = user?.role;
  const canAccess = ["ADMIN", "MANAGER", "DEALER_STAFF"].includes(role || "");

  return (
    <CardWrapper
      title="Chính sách chiết khấu đại lý"
      subtitle={
        canAccess
          ? "Quản lý và theo dõi toàn bộ chính sách chiết khấu của hệ thống"
          : "Bạn không có quyền truy cập trang này"
      }
      variant="dashboard"
    >
      {canAccess ? (
        <DealerDiscountPolicyList />
      ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )}
    </CardWrapper>
  );
};
