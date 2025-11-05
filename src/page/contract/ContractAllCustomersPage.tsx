
import { useNavigate } from "react-router-dom";
import { ContractListAllCustomers } from "../../components/organisms/contract/ContractListAllCustomers";
import CardWrapper from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const ContractAllCustomersPage = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

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

      <ContractListAllCustomers />
      <div
        onClick={() => navigate("/" + role.toLowerCase() + "/contract")}
        className="flex items-center gap-2 text-[#627254] cursor-pointer hover:text-[#4f5a42] transition-colors"
      >
        <span className="font-medium">Danh sách hợp đồng bàn giao với Hãng xe</span>
      </div>
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
