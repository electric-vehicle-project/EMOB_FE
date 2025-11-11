import { ContractListCurrentDealer } from "../../components/organisms/contract/ContractListCurrentDealer";
import { CardWrapper } from "../../components/template/CardWrapper";

export const ContractCurrentDealerPage = () => {
  
  return (
    <CardWrapper
      title="Quản lý hợp đồng"
      variant="dashboard"
    >
      <ContractListCurrentDealer />
    </CardWrapper>
  );
};
