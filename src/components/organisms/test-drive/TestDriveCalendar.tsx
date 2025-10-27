/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { TestDriveSlotList } from "../../molecules/test-drive/TestDriveSlotList";
import { Card } from "antd";

interface Props {
  data: any[];
}

export const TestDriveCalendar = ({ data }: Props) => {
  const days = [...Array(7)].map((_, i) =>
    dayjs().startOf("week").add(i + 1, "day")
  );

  const timeSlots = [
    "08:00",
    "10:00",
    "12:00",
    "14:00",
    "16:00",
  ];

  return (
    <Card className="overflow-x-auto !rounded-xl shadow-lg">
     
        <div className="grid grid-cols-8 !border-[#082a04] py-2 px-3 text-center font-medium text-gray-700">
          <div></div>
          {days.map((d) => (
            <div key={d.toString()}>{d.format("ddd, DD/MM")}</div>
          ))}
        </div>

        {timeSlots.map((t) => (
          <div key={t} className="grid grid-cols-8 min-h-[6rem] border-t">
            <div className="flex items-center justify-end pr-2 text-sm text-gray-500 border-r bg-gray-50">
              {t}
            </div>
            {days.map((d) => {
              const slotSchedules = data.filter(
                (s) =>
                  dayjs(s.scheduledAt).isSame(d, "day") &&
                  dayjs(s.scheduledAt).format("HH:mm") === t
              );
              return (
                <div
                  key={d.toString() + t}
                  className="border-l p-2 bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  <TestDriveSlotList schedules={slotSchedules} />
                </div>
              );
            })}
          </div>
        ))}
    </Card>
  );
};
