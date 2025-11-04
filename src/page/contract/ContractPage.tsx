import { ContractList } from "../../components/organisms/contract/ContractList";
import CardWrapper from "../../components/template/CardWrapper";
// import { useCurrentUser } from "../utils/getCurrentUser";

export const ContractPage = () => {
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
        <ContractList />
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
