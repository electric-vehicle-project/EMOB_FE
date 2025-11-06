import { TestDriveList } from "../components/organisms/TestDriveList";
import { CardWrapper } from "../components/template/CardWrapper";

export const TestDrivePage = () => {
  return (
    <CardWrapper
      title="Quản lý lịch lái thử"
      subtitle="Theo dõi và xử lý các yêu cầu lái thử xe"
      variant="dashboard"
    >
      <TestDriveList />
    </CardWrapper>
  );
};
