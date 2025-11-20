import { DeliveryEVMAndDealerList } from "../../components/organisms/delivery/DeliveryEVMAndDealerList";
import { CardWrapper } from "../../components/template/CardWrapper";

export const DeliveryEVMAndDealerPage = () => {
  return (
    <CardWrapper
      title="Quản lý đơn vận chuyển"
      subtitle="Danh sách đơn vận chuyển từ Hãng xe đến Đại lý"
      variant="dashboard"
    >
      <DeliveryEVMAndDealerList />
    </CardWrapper>
  );
};
