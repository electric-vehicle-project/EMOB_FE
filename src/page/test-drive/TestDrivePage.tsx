import { TestDrive } from "../../components/organisms/test-drive/TestDrive";
import { CardWrapper } from "../../components/template/CardWrapper";

export const TestDrivePage = () => {

  return (
    <CardWrapper
      title="Quản lý lịch hẹn lái thử"
      // subtitle={
      //   canAccess
      //     ? "Theo dõi và quản lý thông tin các đại lý trong hệ thống"
      //     : "Bạn không có quyền truy cập trang này"
      // }
      variant="dashboard"
    >
      {/* {canAccess ? ( */}
        <TestDrive />
      {/* ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )} */}
    </CardWrapper>
  );
};
