import { AccountList } from "../../components/organisms/AccountList";

export const AccountPage = () => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold mb-4">Quản lý tài khoản</h1>
      <AccountList />
    </div>
  );
};
