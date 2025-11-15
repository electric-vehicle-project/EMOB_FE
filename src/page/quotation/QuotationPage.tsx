import QuotationList from "../../components/organisms/quotation/QuotationList";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const QuotationPage = () => {
  const user = useCurrentUser();
  const canAccess = ["ADMIN", "DEALER_STAFF", "MANAGER"].includes(
    (user as { role?: string } | null)?.role || ""
  );

  return (
    <CardWrapper
      title="Quản lý báo giá"
      subtitle={
        canAccess
          ? "Theo dõi và quản lý các báo giá của hệ thống"
          : "Bạn không có quyền truy cập trang này"
      }
      variant="dashboard"
    >
      {canAccess ? (
        <QuotationList />
      ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )}
    </CardWrapper>
  );
};

export default QuotationPage;
