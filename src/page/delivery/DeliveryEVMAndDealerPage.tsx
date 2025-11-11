import { DeliveryEVMAndDealerList } from "../../components/organisms/delivery/DeliveryEVMAndDealerList";
import { CardWrapper } from "../../components/template/CardWrapper";

export const DeliveryEVMAndDealerPage = () => {
  return (
    <CardWrapper
      title="Quản lý đơn vận chuyển"
      variant="dashboard"
    >
      <DeliveryEVMAndDealerList />
    </CardWrapper>
  );
};
