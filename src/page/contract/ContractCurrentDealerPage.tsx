import { ContractListCurrentDealer } from "../../components/organisms/contract/ContractListCurrentDealer";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { Button } from "antd";

export const ContractCurrentDealerPage = () => {

  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  return (
    <CardWrapper
      title="Quản lý hợp đồng"
      subtitle="Danh sách hợp đồng bàn giao với Hãng xe"
      variant="dashboard"
      rightLink={
        <Button type="primary"  onClick={() => navigate("/" + role.toLowerCase() + "/contract")}>
          Danh sách hợp đồng mua bán xe với toàn bộ Khách hàng
        </Button>
      }
    >
      <ContractListCurrentDealer />
    </CardWrapper>
  );
};
