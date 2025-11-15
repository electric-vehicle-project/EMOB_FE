import { TestDriveByCurrentStaff } from "../../components/organisms/test-drive/TestDriveByCurrentStaff";
import { CardWrapper } from "../../components/template/CardWrapper";

export const TestDriveByCurrentStaffPage = () => {

  return (
    <CardWrapper
      title="Quản lý lịch hẹn lái thử"

      variant="dashboard"
    >
      <TestDriveByCurrentStaff />
    </CardWrapper>
  );
};