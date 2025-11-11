import { ContractListAllDealers } from "../../components/organisms/contract/ContractListAllDealers";
import { CardWrapper } from "../../components/template/CardWrapper";

export const ContractAllDealersPage = () => {
  
  return (
    <CardWrapper
      title="Quản lý hợp đồng"
      variant="dashboard"
    >
      <ContractListAllDealers />
    </CardWrapper>
  );
};
