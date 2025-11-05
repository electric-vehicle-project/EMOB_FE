
import { useNavigate } from "react-router-dom";
import { ContractListCurrentDealer } from "../../components/organisms/contract/ContractListCurrentDealer";
import CardWrapper from "../../components/template/CardWrapper";


export const ContractCurrentDealerPage = () => {

  const navigate = useNavigate();


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

      <ContractListCurrentDealer />

      <div
        onClick={() => navigate("customers")}
        className="flex items-center gap-2 text-[#627254] cursor-pointer hover:text-[#4f5a42] transition-colors"
      >
        <span className="font-medium">Danh sách hợp đồng mua bán xe với toàn bộ Khách hàng</span>
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
