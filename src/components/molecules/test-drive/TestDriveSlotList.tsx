/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestDriveCard } from "./TestDriveCard";

export const TestDriveSlotList = ({ schedules }: { schedules: any[] }) => {
  if (!schedules.length)
    return <p className="text-xs text-gray-400 italic">Trống</p>;

  return (
    <div className="flex flex-col gap-2">
      {schedules.map((s) => (
        <TestDriveCard key={s.testDriveId} schedule={s} />
      ))}
    </div>
  );
};
