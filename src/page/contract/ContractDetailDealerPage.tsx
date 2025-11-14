import { ContractDetailDealer } from "../../components/organisms/contract/ContractDetailDealer";
import { CardWrapper } from "../../components/template/CardWrapper";

export const ContractDetailDealerPage = () => {

  return (
    <CardWrapper
      title="Quản lý hợp đồng"
      variant="dashboard"
    >
      <ContractDetailDealer />
    </CardWrapper>
  );
};
