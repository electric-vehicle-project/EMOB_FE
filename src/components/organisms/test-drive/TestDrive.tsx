// src/pages/test-drive/TestDrivePage.tsx
import { useState } from "react";
import { Card, Button, Checkbox, Calendar, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTestDriveQuery } from "../../../service/testDriveService";
import { TestDriveCalendar } from "../../molecules/test-drive/TestDriveCalendar";
import { TestDriveCreateModal } from "../../molecules/test-drive/TestDriveCreateModal";
import { useCurrentUser } from "../../../utils/getCurrentUser";

export const TestDrive = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  const { data, refetch } = useTestDriveQuery({}, {});

  const testDrives = data?.result?.data ?? [];

  const handleStatusChange = (checked: boolean, value: string) => {
    setSelectedStatuses((prev) =>
      checked ? [...prev, value] : prev.filter((s) => s !== value)
    );
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="flex flex-col gap-4 w-[320px]">
        <Card>
          <Calendar fullscreen={false} onChange={(d) => setSelectedDate(d.toDate())} />
        </Card>

        <Card >
          <Space direction="vertical">
            <Checkbox
              checked={selectedStatuses.length === 0}
              onChange={() => setSelectedStatuses([])}
            >
              Tất cả
            </Checkbox>
            <Checkbox
              onChange={(e) => handleStatusChange(e.target.checked, "PENDING")}
            >
              Chờ xác nhận
            </Checkbox>
            <Checkbox
              onChange={(e) => handleStatusChange(e.target.checked, "CONFIRMED")}
            >
              Đã xác nhận
            </Checkbox>
            <Checkbox
              onChange={(e) => handleStatusChange(e.target.checked, "COMPLETED")}
            >
              Hoàn thành
            </Checkbox>
            <Checkbox
              onChange={(e) => handleStatusChange(e.target.checked, "CANCELLED")}
            >
              Đã hủy
            </Checkbox>
          </Space>
        </Card>
      </div>

      {/* Main Calendar */}
      <div className="flex-1">
        <Card
          title={"Lịch theo tuần"}
          extra={
            <Space>
              {role === "DEALER_STAFF" && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="!bg-[#627254] hover:!bg-[#556948]"
                  onClick={() => setOpenModal(true)}
                >
                  Tạo lịch mới
                </Button>
              )}
            </Space>}
        >
          <TestDriveCalendar
            testDrives={testDrives}
            loading={false}
            selectedStatuses={selectedStatuses}
            selectedDate={selectedDate}
          />
        </Card>
      </div>

      {/* Modal tạo lịch */}
      <TestDriveCreateModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          setOpenModal(false);
          refetch();
        }}
      />
    </div >
  );
};