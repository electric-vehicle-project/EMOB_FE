// src/page/profile/ProfilePage.tsx
import React, { useMemo, useState } from "react";
import { Card, Tag, Skeleton, Space, Result } from "antd";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { useGetAccountById } from "../../service/accountService";
import { CardWrapper } from "../../components/template/CardWrapper";
import type { IAccount, Role, AccountStatus } from "../../model/Account";
import EditProfileModal from "../../components/organisms/profile/EditProfileModal";
import ChangePasswordModal from "../../components/organisms/profile/ChangePasswordModal";
import ProfileDetailsByRole from "../../components/organisms/profile/ProfileDetailsByRole";

/* ================================
   🎨 Tag hiển thị trạng thái & role
================================== */
const mapStatusLabel: Record<AccountStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ngưng",
  BANNED: "Đã khóa",
};

const mapStatusColor: Record<AccountStatus, string> = {
  ACTIVE: "green",
  INACTIVE: "gold",
  BANNED: "red",
};

const mapRoleLabel: Record<Role, string> = {
  ADMIN: "Quản trị (Hãng xe)",
  MANAGER: "Quản lý đại lý",
  DEALER_STAFF: "Nhân viên đại lý",
  EVM_STAFF: "Nhân viên EVM",
};

/* ================================
   🧱 Component Section nhỏ
================================== */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <Card className="rounded-2xl shadow-sm border border-gray-100" title={title}>
    {children}
  </Card>
);

/* ================================
   👤 Trang Hồ sơ cá nhân
================================== */
export default function ProfilePage() {
  const user = useCurrentUser();
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  // ✅ Chỉ ADMIN mới được phép gọi API /api/auth/{id}
  const canFetchFromApi = user?.role === "ADMIN";

  // ✅ Cập nhật đúng thứ tự tham số: (id, options)
  const { data, isLoading, isError, error, refetch } = useGetAccountById(
    user?.id as string,
    { enabled: canFetchFromApi && !!user?.id }
  );

  // ✅ Ưu tiên Redux user, fallback từ API nếu có
  const profile: IAccount | null = useMemo(() => {
    if (user) return user;
    if (data) {
      const maybe = data as any;
      return maybe.result ?? maybe;
    }
    return null;
  }, [data, user]);

  const header = useMemo(
    () => ({
      fullName: profile?.fullName ?? "",
      email: profile?.email ?? "",
      status: profile?.status,
      role: profile?.role,
    }),
    [profile]
  );

  /* ================================
     📦 Render nội dung trang
  ================================= */
  const content = (() => {
    // ❌ Nếu chưa login
    if (!profile) {
      return (
        <Result
          status="403"
          title="Không có dữ liệu hồ sơ"
          subTitle="Vui lòng đăng nhập lại để xem thông tin cá nhân."
        />
      );
    }

    // ⚠️ Chỉ hiển thị lỗi nếu Admin gọi API thất bại
    if (isError && canFetchFromApi) {
      return (
        <Result
          status="error"
          title="Không tải được hồ sơ"
          subTitle={(error as any)?.message || "Vui lòng thử lại."}
          extra={
            <button
              className="px-4 py-2 rounded-xl bg-[#627254] hover:bg-[#525e46] text-white"
              onClick={() => refetch()}
            >
              Thử lại
            </button>
          }
        />
      );
    }

    // ⏳ Loading (khi Admin gọi API)
    if (isLoading) {
      return <Skeleton active paragraph={{ rows: 8 }} />;
    }

    // ✅ Nội dung chính
    return (
      <div className="grid grid-cols-1 gap-12">
        <Section title="Thông tin tổng quan">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xl font-bold text-[#2e3825]">
                {header.fullName}
              </div>
              <div className="text-gray-600 break-words">{header.email}</div>
            </div>
            <Space>
              {header.status && (
                <Tag color={mapStatusColor[header.status]}>
                  {mapStatusLabel[header.status]}
                </Tag>
              )}
              {header.role && <Tag>{mapRoleLabel[header.role]}</Tag>}
            </Space>
          </div>

          {/* ✅ Component hiển thị theo Role */}
          <ProfileDetailsByRole profile={profile} />

          {/* ⚙️ Nút hành động */}
          <div className="mt-4 flex gap-2 justify-end">
            <button
              className="px-4 py-2 rounded-xl bg-[#627254] hover:bg-[#525e46] text-white"
              onClick={() => setEditOpen(true)}
            >
              Chỉnh sửa thông tin
            </button>
            <button
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
              onClick={() => setPwdOpen(true)}
            >
              Đổi mật khẩu
            </button>
          </div>
        </Section>
      </div>
    );
  })();

  /* ================================
     📄 Return tổng thể
  ================================= */
  return (
    <CardWrapper
      title="Hồ sơ cá nhân"
      subtitle="Thông tin tài khoản & bảo mật"
      maxWidth="max-w-5xl"
      variant="profile"
    >
      {content}

      {profile && (
        <>
          <EditProfileModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            profile={profile}
            onSuccess={() => {
              refetch?.();
              setEditOpen(false);
            }}
          />
          <ChangePasswordModal
            open={pwdOpen}
            onClose={() => setPwdOpen(false)}
            onSuccess={() => setPwdOpen(false)}
          />
        </>
      )}
    </CardWrapper>
  );
}
