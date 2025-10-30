// src/page/account/AccountPage.tsx
import { App } from "antd";
import CardWrapper from "../../components/template/CardWrapper";
import { AccountList } from "../../components/organisms/account/AccountList";

export const AccountPage = () => {
  return (
    <App>
      <CardWrapper
        title="Quản lý tài khoản"
        subtitle="Theo dõi và quản lý người dùng trong hệ thống"
        variant="dashboard"
      >
        <AccountList />
      </CardWrapper>
    </App>
  );
};
