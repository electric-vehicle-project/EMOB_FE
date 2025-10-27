import { Avatar } from "antd";

export const TestDriveBadge = ({ name }: { name: string }) => (
  <Avatar className="bg-primary text-white text-xs">{name[0]}</Avatar>
);
