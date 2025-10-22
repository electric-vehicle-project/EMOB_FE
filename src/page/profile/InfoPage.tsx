import React from "react";
import { Skeleton } from "antd";
import { useGetAccountById } from "../../service/accountService";
import { useCurrentUser as getCurrentUser } from "../../utils/getCurrentUser";
import { motion } from "framer-motion";
import ProfileCardWrapper from "../../components/molecules/ProfileCardWrapper";

const InfoPage: React.FC = () => {
  const user = getCurrentUser();
  const { data, isLoading } = useGetAccountById(user?.id);
  const profile = data?.result ?? null;

  return (
    <ProfileCardWrapper title="" maxWidth="max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="border-l-4 border-[#627254] pl-3 mb-4">
          <h1 className="text-2xl font-bold text-[#414d38]">Hồ sơ cá nhân</h1>
          <p className="text-gray-500 text-base">
            Theo dõi thông tin tài khoản của bạn
          </p>
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="py-2 border-b border-gray-200">
              <div className="text-gray-600 font-medium">Họ và tên</div>
              <div className="text-[#2e3825] font-semibold text-sm sm:text-base">
                {profile?.fullName || ""}
              </div>
            </div>

            <div className="py-2 border-b border-gray-200">
              <div className="text-gray-600 font-medium">Email</div>
              <div className="text-[#2e3825] font-semibold text-sm sm:text-base break-words">
                {profile?.email || ""}
              </div>
            </div>

            <div className="py-2 border-b border-gray-200">
              <div className="text-gray-600 font-medium">Số điện thoại</div>
              <div className="text-[#2e3825] font-semibold text-sm sm:text-base">
                {profile?.phone || ""}
              </div>
            </div>

            <div className="py-2 border-b border-gray-200">
              <div className="text-gray-600 font-medium">Giới tính</div>
              <div className="text-[#2e3825] font-semibold text-sm sm:text-base">
                {profile?.gender || ""}
              </div>
            </div>

            <div className="py-2 border-b border-gray-200">
              <div className="text-gray-600 font-medium">Địa chỉ</div>
              <div className="text-[#2e3825] font-semibold text-sm sm:text-base break-words">
                {profile?.address || ""}
              </div>
            </div>

            <div className="py-2 border-b border-gray-200">
              <div className="text-gray-600 font-medium">Trạng thái</div>
              <div className="text-[#2e3825] font-semibold text-sm sm:text-base">
                {profile?.status || ""}
              </div>
            </div>

            <div className="py-2 border-b border-gray-200">
              <div className="text-gray-600 font-medium">Ngày sinh</div>
              <div className="text-[#2e3825] font-semibold text-sm sm:text-base">
                {profile?.dateOfBirth || ""}
              </div>
            </div>

            <div className="py-2">
              <div className="text-gray-600 font-medium">Vai trò</div>
              <div className="text-[#2e3825] font-semibold text-sm sm:text-base">
                {profile?.role || ""}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </ProfileCardWrapper>
  );
};

export default InfoPage;
