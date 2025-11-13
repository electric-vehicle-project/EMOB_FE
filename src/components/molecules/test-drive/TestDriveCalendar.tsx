/* eslint-disable @typescript-eslint/no-explicit-any */
import { Spin, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";
import { TestDriveDetailModal } from "./TestDriveDetailModal";

interface Props {
  testDrives: any[];
  loading: boolean;
  selectedStatuses: string[];
  selectedDate: Date;
  onRefetch?: () => void; 
}

export const TestDriveCalendar = ({
  testDrives,
  loading,
  selectedStatuses,
  selectedDate,
  onRefetch,
}: Props) => {
  const [viewingId, setViewingId] = useState<string | null>(null);

  if (loading) return <Spin size="large" />;

  const hours = ["08:00", "10:00", "12:00", "14:00", "16:00"];
  const days = Array.from({ length: 7 }).map((_, i) =>
    dayjs(selectedDate).startOf("week").add(i, "day")
  );

  const filtered = testDrives.filter((t) =>
    selectedStatuses.length > 0 ? selectedStatuses.includes(t.status) : true
  );

  // Màu trạng thái
  const statusColorMap: Record<string, string> = {
    PENDING: "#fca117", // vàng cam
    CONFIRMED: "#237804", // xanh lá
    COMPLETED: "#096dd9", // xanh dương
    CANCELLED: "#cf1322", // đỏ
  };

  // Render từng ô
  const getCell = (day: dayjs.Dayjs, hour: string) => {
    const match = filtered.find(
      (t) =>
        dayjs(t.scheduledAt).isSame(day, "day") &&
        dayjs(t.scheduledAt).format("HH:mm") === hour
    );

    if (match) {
      const color = statusColorMap[match.status] || "#627254";
      const duration = match.duration || 60;

      return (
        <Tooltip
          title={`Trạng thái: ${match.status} • Thời lượng: ${duration} phút`}
          placement="top"
        >
          <div
            onClick={() => setViewingId(match.testDriveId)}
            className="flex flex-col items-center justify-center h-[80px] w-full rounded-md cursor-pointer transition-transform transform hover:scale-110"
            style={{
              backgroundColor: "#f9f9f9",
              border: `5px solid ${color}33`,
            }}
          >
            <UserOutlined style={{ color, fontSize: 20, marginBottom: 4 }} />
            <span
              className="font-semibold"
              style={{ fontSize: 12, color: color }}
            >
              {duration} phút
            </span>
          </div>
        </Tooltip>
      );
    }

    return (
      <div className="flex items-center justify-center text-gray-400 italic h-[80px]">
        Trống
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2"></th>
            {days.map((d) => (
              <th key={d.toString()} className="p-2 font-semibold text-center">
                {d.format("ddd, DD/MM")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td className="p-2 font-semibold text-center">{hour}</td>
              {days.map((d) => (
                <td
                  key={d.toString() + hour}
                  className="border border-gray-200 h-[80px] text-center align-middle"
                >
                  {getCell(d, hour)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Modal xem & cập nhật chi tiết lịch lái thử ===== */}
      <TestDriveDetailModal
        open={!!viewingId}
        testDriveId={viewingId}
        onClose={() => setViewingId(null)}
        onUpdated={() => {
          setViewingId(null);
          onRefetch?.();
        }}
      />
    </div>
  );
};