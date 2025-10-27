import { DealerList } from "../components/organisms/dealer/DealerList";

export const DealerPage = () => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      {/* Chỉ giữ tiêu đề */}
      <h1 className="text-xl font-bold mb-4">Quản lý đại lý</h1>
      <DealerList />
    </div>
  );
};
