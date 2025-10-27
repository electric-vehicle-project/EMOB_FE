/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "antd";
import dayjs from "dayjs";
import { TestDriveStatusTag } from "../../atoms/TestDriveStatusTag";
import { TestDriveBadge } from "../../atoms/TestDriveBadge";

export const TestDriveCard = ({ schedule }: { schedule: any }) => (
  <Card
    size="small"
    className="rounded-md border-l-4 cursor-pointer hover:shadow-md transition-all"
    style={{
      borderLeftColor:
        schedule.status === "CONFIRMED"
          ? "#52c41a"
          : schedule.status === "PENDING"
          ? "#faad14"
          : schedule.status === "CANCELLED"
          ? "#ff4d4f"
          : "#1677ff",
    }}
  >
    <div className="flex justify-between items-center">
      <span className="font-medium text-gray-800 text-sm truncate">
        {schedule.customer?.fullName ?? "Khách hàng"}
      </span>
      <TestDriveStatusTag status={schedule.status} />
    </div>
    <p className="text-xs text-gray-500 mt-1">
      {dayjs(schedule.scheduledAt).format("HH:mm")} -{" "}
      {dayjs(schedule.scheduledAt)
        .add(schedule.duration || 120, "minute")
        .format("HH:mm")}
    </p>
    <div className="flex mt-1">
      <TestDriveBadge name="S" />
    </div>
  </Card>
);
