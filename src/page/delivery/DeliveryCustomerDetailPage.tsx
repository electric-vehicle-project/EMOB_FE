import { DeliveryCustomerDetail } from "../../components/organisms/delivery/DeliveryCustomerDetail";
import { CardWrapper } from "../../components/template/CardWrapper";

export const DeliveryCustomerDetailPage = () => {

  return (
    <CardWrapper
      title="Quản lý đơn vận chuyển"
      subtitle="Chi tiết đơn vận chuyển"

      variant="dashboard"
    >
      <DeliveryCustomerDetail />
    </CardWrapper>
  );
};
