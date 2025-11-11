import { TestDrive } from "../../components/organisms/test-drive/TestDrive";
import { CardWrapper } from "../../components/template/CardWrapper";

export const TestDrivePage = () => {

  return (
    <CardWrapper
      title="Quản lý lịch hẹn lái thử"

      variant="dashboard"
    >
      <TestDrive />
    </CardWrapper>
  );
};