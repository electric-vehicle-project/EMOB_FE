import { Button, Card, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import { canCreate, type Role } from "../../utils/promotionPermissions";
import { ROUTES } from "../../model/routePaths";

// lấy role  từ Redux
import { useSelector } from "react-redux";

export default function EvmPromotionsPage() {
  const nav = useNavigate();

  type RootLike = {
    user?: { role?: Role; current?: { role?: Role } };
    auth?: { user?: { role?: Role } };
  };
  const role = useSelector(
    (s: RootLike) => s.user?.role ?? s.user?.current?.role ?? s.auth?.user?.role
  ) as Role | undefined;

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Đang hoạt động" },
    { key: "pending", label: "Chờ duyệt" },
    { key: "expired", label: "Hết hạn" },
  ];

  {
    console.log("role from store:", role);
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="rounded-2xl shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Khuyến mãi toàn hệ thống</h3>

          {/* ✅ chỉ hiện nút khi có role & được phép */}
          {role && canCreate(role, "GLOBAL") && (
            <Button
              type="primary"
              className="!bg-[var(--primary-color)] hover:!bg-[var(--secondary-color)]"
              onClick={() => nav(`../${ROUTES.PROMOTION_CREATE}`)}
            >
              Tạo khuyến mãi
            </Button>
          )}
        </div>

        <Tabs items={tabs} />
        {/* Giữ nguyên UI/placeholder của bạn */}
      </Card>
    </div>
  );
}
