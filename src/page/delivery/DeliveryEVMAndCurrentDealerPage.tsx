import { DeliveryEVMAndDealerListCurrent } from "../../components/organisms/delivery/DeliveryEVMAndDealerListCurrent";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { ROUTES } from "../../model/routePaths";
import { useNavigate } from "react-router-dom";

export const DeliveryEVMAndCurrentDealerPage = () => {


  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";


  return (
    <CardWrapper
      title="Quản lý đơn vận chuyển"
      subtitle="Danh sách đơn vận chuyển từ Hãng xe đến Đại lý"
      variant="dashboard"
      rightLink={
        <span>
          <b
            onClick={() => navigate(`/${role.toLowerCase()}/${ROUTES.DELIVERY_CUSTOMERS}`)}
            className="text-green-600 underline hover:text-green-800 text-sm"
          >
            Danh sách đơn vận chuyển từ Đại lý đến Khách hàng
          </b>
        </span>
      }
    >
      <DeliveryEVMAndDealerListCurrent />
    </CardWrapper>
  );
};
