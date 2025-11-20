import { TestDrive } from "../../components/organisms/test-drive/TestDrive";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { ROUTES } from "../../model/routePaths";
import { Button } from "antd";

export const TestDrivePage = () => {

  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  return (
    <CardWrapper
      title="Quản lý lịch hẹn lái thử"
      subtitle="Hiển thị lịch lái thử theo tuần của Đại lý"
      variant="dashboard"
      rightLink={
        role === "DEALER_STAFF" ? (
          <Button
            type="primary"
            onClick={() => navigate(`/${role.toLowerCase()}/${ROUTES.TEST_DRIVE_BY_CURRENT_STAFF}`)}
          >
            Xem lịch lái thử do tôi phụ trách
          </Button>
        ) : null
      }
    >
      <TestDrive />
    </CardWrapper>
  );
};