import { Calendar, Card, Checkbox } from "antd";

export const TestDriveFilterBar = () => (
  <div className="flex-col justify-center">
    <Card type={"inner"}><Calendar fullscreen={false} /></Card>

    <br />
    <Card className="shadow-gray-400 shadow-xl flex justify-center m-10 ">
      <Checkbox.Group
        options={[
          { label: "Tất cả", value: "All" },
          { label: "Chờ xác nhận", value: "PENDING" },
          { label: "Đã xác nhận", value: "CONFIRMED" },
          { label: "Hoàn thành", value: "COMPLETED" },
          { label: "Đã hủy", value: "CANCELLED" },
        ]}
        className="flex-col gap-5"
      />
    </Card>
  </div >
);
