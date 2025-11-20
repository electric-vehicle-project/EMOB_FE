import { ContractListAllCustomers } from "../../components/organisms/contract/ContractListAllCustomers";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const ContractAllCustomersPage = () => {

  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  return (
    <CardWrapper
      title="Quản lý hợp đồng"
      subtitle="Danh sách hợp đồng mua bán xe với toàn bộ Khách hàng"
      variant="dashboard"

      rightLink={
        <span>
          <b
            onClick={() => navigate("/" + role.toLowerCase() + "/contract/with-evm")}
            className="text-green-600 underline hover:text-green-800 text-sm"
          >
            Danh sách hợp đồng bàn giao với Hãng xe
          </b>
        </span>
      }
    >
      <ContractListAllCustomers />
    </CardWrapper >
  );
};
