import { DeliveryDealerDetail } from "../../components/organisms/delivery/DeliveryDealerDetail";
import { CardWrapper } from "../../components/template/CardWrapper";

export const DeliveryDealerDetailPage = () => {

  return (
    <CardWrapper
      title="Quản lý đơn vận chuyển"
      subtitle=""
      variant="dashboard"
    >
      <DeliveryDealerDetail />
    </CardWrapper>
  );
};
