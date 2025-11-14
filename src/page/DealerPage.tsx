// src/pages/DealerPage.tsx
import { DealerList } from "../components/organisms/dealer/DealerList";
import { CardWrapper } from "../components/template/CardWrapper";
import { useCurrentUser } from "../utils/getCurrentUser";

export const DealerPage = () => {
  const user = useCurrentUser();
  const canAccess = ["ADMIN", "EVM_STAFF"].includes(
    (user as { role?: string } | null)?.role || ""
  );

  return (
    <CardWrapper
      title="Quản lý đại lý"
      subtitle={
        canAccess
          ? "Theo dõi và quản lý thông tin các đại lý trong hệ thống"
          : "Bạn không có quyền truy cập trang này"
      }
      variant="dashboard"
    >
      {canAccess ? (
        <DealerList />
      ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )}
    </CardWrapper>
  );
};
