// src/page/profile/ProfilePage.tsx
import React, { useMemo, useState } from "react";
import { Card, Tag, Skeleton, Descriptions, Space, Result } from "antd";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { useGetAccountProfile } from "../../service/accountService";
import { CardWrapper } from "../../components/template/CardWrapper";
import type {
  IAccount,
  Role,
  AccountStatus,
  Gender,
} from "../../model/Account";
import { formatDateVietnam } from "../../utils/timeFeature";
import EditProfileModal from "../../components/organisms/profile/EditProfileModal";
import ChangePasswordModal from "../../components/organisms/profile/ChangePasswordModal";

// ===== Mapping tiếng Việt =====
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
const mapGenderLabel: Record<Gender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  UNKNOWN: "Không xác định",
};
const mapRoleLabel: Record<Role, string> = {
  ADMIN: "Quản trị (Hãng xe)",
  MANAGER: "Quản lý đại lý",
  DEALER_STAFF: "Nhân viên đại lý",
  EVM_STAFF: "Nhân viên EVM",
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <Card className="rounded-2xl shadow-sm border border-gray-100" title={title}>
    {children}
  </Card>
);

export default function ProfilePage() {
  const user = useCurrentUser(); // lấy role/token từ Redux
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  // ✅ Chỉ fetch khi đã có token để tránh 400 "Bad Request" do thiếu Authorization
  const { data, isLoading, isError, error, refetch } = useGetAccountProfile({
    enabled: !!user?.token,
  });

  // ✅ Endpoint /auth/profile có thể trả về:
  // - trực tiếp object IAccount
  // - hoặc { result: IAccount }
  const profile: IAccount | null = useMemo(() => {
    if (!data) return null;
    const maybe = data as any;
    return (maybe.result ?? maybe) as IAccount;
  }, [data]);

  const header = useMemo(
    () => ({
      // fallback sang Redux nếu API chưa trả về kịp
      fullName: profile?.fullName ?? user?.fullName ?? "",
      email: profile?.email ?? user?.email ?? "",
      status: (profile?.status ?? user?.status) as AccountStatus | undefined,
      role: (profile?.role ?? user?.role) as Role | undefined,
    }),
    [profile, user]
  );

  const content = (() => {
    if (!user?.token) {
      return (
        <Result
          status="403"
          title="Chưa sẵn sàng"
          subTitle="Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại."
        />
      );
    }

    if (isError) {
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

    if (isLoading || !profile) {
      return <Skeleton active paragraph={{ rows: 8 }} />;
    }

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

          <Descriptions className="mt-4" column={2} size="middle" bordered>
            <Descriptions.Item label="Số điện thoại">
              {profile.phone || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {profile.gender ? mapGenderLabel[profile.gender] : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {profile.dateOfBirth
                ? formatDateVietnam(profile.dateOfBirth)
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {profile.address || "-"}
            </Descriptions.Item>

            {/* Một số role (MANAGER/DEALER_STAFF) có dealerId */}
            {profile.dealerId && (
              <Descriptions.Item label="Mã đại lý">
                {profile.dealerId}
              </Descriptions.Item>
            )}
          </Descriptions>

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

  return (
    <CardWrapper
      title="Hồ sơ cá nhân"
      subtitle="Thông tin tài khoản & bảo mật"
      maxWidth="max-w-5xl"
      variant="profile"
    >
      {content}

      {/* Modals */}
      {profile && (
        <>
          <EditProfileModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            profile={profile}
            onSuccess={async () => {
              await refetch(); // refetch lại /auth/profile sau khi cập nhật
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
