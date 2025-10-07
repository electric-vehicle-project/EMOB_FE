import { DealerList } from "../components/organisms/DealerList";
import CardWrapper from "../components/template/CardWrapper";

export const DealerPage = () => {
  return (
    <CardWrapper
      title="Quản lý đại lý"
      subtitle="Theo dõi và quản lý thông tin các đại lý trong hệ thống"
      variant="dashboard"
    >
      <DealerList />
    </CardWrapper>
  );
};
