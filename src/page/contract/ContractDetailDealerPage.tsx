
import { ContractDetailDealer } from "../../components/organisms/contract/ContractDetailDealer";
import { CardWrapper } from "../../components/template/CardWrapper";
// import { useCurrentUser } from "../utils/getCurrentUser";

export const ContractDetailDealerPage = () => {
  // const user = useCurrentUser();
  // const canAccess = ["ADMIN", "EVM_STAFF"].includes(
  //   (user as { role?: string } | null)?.role || ""
  // );

  return (
    <CardWrapper
      title="Quản lý hợp đồng"
    //   subtitle={
    //     canAccess
    //       ? "Theo dõi và quản lý thông tin các đại lý trong hệ thống"
    //       : "Bạn không có quyền truy cập trang này"
    //   }
      variant="dashboard"
    >
        <ContractDetailDealer />
      {/* {canAccess ? (
        <DealerList />
      ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )} */}
    </CardWrapper>
  );
};
