import { DeliveryDetail } from "../../components/organisms/delivery/DeliveryDetail";
import CardWrapper from "../../components/template/CardWrapper";

export const DeliveryDetailPage = () => {
  // const user = useCurrentUser();
  // const canAccess = ["ADMIN", "EVM_STAFF"].includes(
  //   (user as { role?: string } | null)?.role || ""
  // );

  return (
    <CardWrapper
      title="Quản lý đơn vận chuyển"
      // subtitle={
      //   canAccess
      //     ? "Theo dõi và quản lý thông tin các đại lý trong hệ thống"
      //     : "Bạn không có quyền truy cập trang này"
      // }
      variant="dashboard"
    >
      {/* {canAccess ? ( */}
        <DeliveryDetail />
      {/* ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )} */}
    </CardWrapper>
  );
};
