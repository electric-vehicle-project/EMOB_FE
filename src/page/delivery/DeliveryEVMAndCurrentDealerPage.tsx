import { DeliveryEVMAndDealerListCurrent } from "../../components/organisms/delivery/DeliveryEVMandDealerListCurrent";
import CardWrapper from "../../components/template/CardWrapper";

export const DeliveryEVMAndCurrentDealerPage = () => {
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
        <DeliveryEVMAndDealerListCurrent />
      {/* ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )} */}
    </CardWrapper>
  );
};
