import { Button, Card, Tabs, Popconfirm, message } from "antd";
import { useNavigate } from "react-router-dom";
import { canCreate, type Role } from "../../utils/promotionPermissions";
import { ROUTES } from "../../model/routePaths";
import { useSelector } from "react-redux";
import { usePromotionDelete } from "../../service/promotionService";
import { DeleteOutlined } from "@ant-design/icons";

export default function EvmPromotionsPage() {
  const nav = useNavigate();
  const { mutateAsync: deletePromotion } = usePromotionDelete();

  type RootLike = {
    user?: { role?: Role; current?: { role?: Role } };
    auth?: { user?: { role?: Role } };
  };
  const role = useSelector(
    (s: RootLike) => s.user?.role ?? s.user?.current?.role ?? s.auth?.user?.role
  ) as Role | undefined;

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion(id);
      message.success("Đã xoá khuyến mãi thành công");
    } catch {
      message.error("Không thể xoá khuyến mãi");
    }
  };

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Đang hoạt động" },
    { key: "pending", label: "Chờ duyệt" },
    { key: "expired", label: "Hết hạn" },
  ];

  return (
    <div className="p-4 sm:p-6">
      <Card className="rounded-2xl shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Khuyến mãi toàn hệ thống</h3>

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

        <div className="flex gap-2 justify-end mt-4">
          <Popconfirm
            title="Xoá khuyến mãi?"
            description="Bạn có chắc chắn muốn xoá khuyến mãi này không?"
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete("some-id")}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xoá mẫu
            </Button>
          </Popconfirm>
        </div>
      </Card>
    </div>
  );
}
