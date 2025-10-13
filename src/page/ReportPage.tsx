import { Card } from "antd";
import { ReportList } from "../components/organisms/ReportList";

const ReportPage = () => (
  <Card className="rounded-2xl shadow-sm">
    <h2 className="text-xl font-semibold mb-4">Quản lý phản hồi</h2>
    <ReportList />
  </Card>
);

export default ReportPage;
