import { TestDriveList } from "../components/organisms/TestDriveList";

export const TestDrivePage = () => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold mb-4">Quản lý lịch lái thử</h1>
      <TestDriveList />
    </div>
  );
};
