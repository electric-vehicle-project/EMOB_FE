import { useNavigate } from "react-router-dom";
import { DeliveryDealerAndCustomerList } from "../../components/organisms/delivery/DeliveryDealerAndCustomerList";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { ROUTES } from "../../model/routePaths";
import { Button } from "antd";

export const DeliveryDealerAndCustomerPage = () => {

  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  return (
    <CardWrapper
      title="Quản lý đơn vận chuyển"
      subtitle="Danh sách đơn vận chuyển từ Đại lý đến Khách hàng"
      variant="dashboard"
      rightLink={
        <Button type="primary" onClick={() => navigate(`/${role.toLowerCase()}/${ROUTES.DELIVERY_CURRENT_DEALER}`)}>
          Danh sách đơn vận chuyển từ Hãng xe đến Đại lý
        </Button>
      }
    >
      <DeliveryDealerAndCustomerList />
    </CardWrapper>
  );
};
