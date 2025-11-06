import { Card } from "antd";
import type { SalesByStaffResponse } from "../../model/SaleOrder";

interface StaffCardProps {
  staff: SalesByStaffResponse;
  onViewOrders?: (staffId: string) => void;
}

export const SalesByStaffCard = ({ staff, onViewOrders }: StaffCardProps) => (
  <Card
    className="rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    onClick={() => onViewOrders?.(staff.accountId)}
  >
    <h3 className="text-lg font-semibold text-[#627254] mb-1">Nhân viên</h3>
    <p className="text-sm text-gray-600 mb-2">
      Mã tài khoản: {staff.accountId}
    </p>
    <p className="text-sm text-gray-600">Số đơn: {staff.orderCount}</p>
    <p className="text-sm text-gray-600">
      Doanh thu: {staff.amount.toLocaleString("vi-VN")} VNĐ
    </p>
  </Card>
);
