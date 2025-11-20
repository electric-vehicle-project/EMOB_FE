import { TestDriveByCurrentStaff } from "../../components/organisms/test-drive/TestDriveByCurrentStaff";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { ROUTES } from "../../model/routePaths";

export const TestDriveByCurrentStaffPage = () => {

  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  return (
    <CardWrapper
      title="Quản lý lịch hẹn lái thử"
      subtitle="Hiển thị lịch lái thử do tôi phụ trách"
      variant="dashboard"
      rightLink={
        <span>
          <b
            onClick={() =>
              navigate(`/${role.toLowerCase()}/${ROUTES.TEST_DRIVE}`)
            }
            className="underline text-[#627254] cursor-pointer hover:text-[#4f5a42]"
          >
            Xem lịch lái thử của toàn bộ Đại lý
          </b>
        </span>
      }
    >
      <TestDriveByCurrentStaff />
    </CardWrapper>
  );
};