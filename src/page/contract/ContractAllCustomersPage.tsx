import { ContractListAllCustomers } from "../../components/organisms/contract/ContractListAllCustomers";
import { CardWrapper } from "../../components/template/CardWrapper";

export const ContractAllCustomersPage = () => {
 
  return (
    <CardWrapper
      title="Quản lý hợp đồng"
      variant="dashboard"
    >
      <ContractListAllCustomers />
    </CardWrapper>
  );
};
