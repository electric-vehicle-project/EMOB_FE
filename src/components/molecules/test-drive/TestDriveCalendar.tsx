/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/molecules/test-drive/TestDriveCalendar.tsx
import { Spin } from "antd";
import dayjs from "dayjs";

interface Props {
  testDrives: any[];
  loading: boolean;
  selectedStatuses: string[];
  selectedDate: Date;
}

export const TestDriveCalendar = ({
  testDrives,
  loading,
  selectedStatuses,
  selectedDate,
}: Props) => {
  if (loading) return <Spin size="large" />;

  const hours = ["08:00", "10:00", "12:00", "14:00", "16:00"];
  const days = Array.from({ length: 7 }).map((_, i) =>
    dayjs(selectedDate).startOf("week").add(i, "day")
  );

  const filtered = testDrives.filter((t) =>
    selectedStatuses.length > 0 ? selectedStatuses.includes(t.status) : true
  );

  const getCell = (day: dayjs.Dayjs, hour: string) => {
    const match = filtered.find((t) =>
      dayjs(t.scheduledAt).isSame(day, "day") &&
      dayjs(t.scheduledAt).format("HH:mm") === hour
    );
    if (match)
      return (
        <div className="p-1 text-center font-medium text-[#627254]">
          {match.location}
        </div>
      );
    return <div className="text-gray-400 italic text-center">Trống</div>;
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <table className="w-full">
        <thead>
          <tr>
            <th></th>
            {days.map((d) => (
              <th key={d.toString()} className="p-2 font-semibold">
                {d.format("ddd, DD/MM")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td className="p-2 font-semibold">{hour}</td>
              {days.map((d) => (
                <td key={d.toString() + hour} className="border-1 h-[80px]">
                  {getCell(d, hour)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
