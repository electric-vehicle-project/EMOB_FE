import { ContractDetailCustomer } from "../../components/organisms/contract/ContractDetailCustomer";
import { CardWrapper } from "../../components/template/CardWrapper";

export const ContractDetailCustomerPage = () => {
  
  return (  
    <CardWrapper
      title="Quản lý hợp đồng"
      variant="dashboard"
    >
      <ContractDetailCustomer />
    </CardWrapper>
  );
};
