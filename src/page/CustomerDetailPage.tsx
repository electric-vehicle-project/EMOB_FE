import { useParams, Link } from "react-router-dom";
import type { ICustomer } from "../model/Customer";
import { Card, Tag } from "antd";
import { CustomerStatus } from "../model/Customer";

// mock đơn giản theo id; thực tế sẽ gọi API /customers/:id
const mockById = (id: string): ICustomer => ({
  customerID: id,
  fullName: "Nguyễn Văn A",
  email: "a@example.com",
  phone: "0909123456",
  membershipLevel: "GOLD",
  loyaltyPoints: 1000,
  gender: "MALE",
  address: "Hà Nội",
  dateOfBirth: "1995-02-20",
  status: CustomerStatus.ACTIVE,
  note: "Khách VIP lâu năm",
});

export const CustomerDetailPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const customer = mockById(id);

  return (
    <div className="p-6">
      {/* back về list */}
      <Link to="/admin/customers" className="text-[#627254] hover:underline">
        ← Quay lại danh sách
      </Link>

      <Card
        title={`Thông tin khách hàng: ${customer.fullName}`}
        className="mt-4"
      >
        <p>
          <b>ID:</b> {customer.customerID}
        </p>
        <p>
          <b>Email:</b> {customer.email}
        </p>
        <p>
          <b>SĐT:</b> {customer.phone}
        </p>
        <p>
          <b>Membership:</b> {customer.membershipLevel}
        </p>
        <p>
          <b>Điểm tích luỹ:</b> {customer.loyaltyPoints}
        </p>
        <p>
          <b>Địa chỉ:</b> {customer.address}
        </p>
        <p>
          <b>Ngày sinh:</b> {customer.dateOfBirth}
        </p>
        <p>
          <b>Trạng thái:</b>{" "}
          <Tag color={customer.status === "ACTIVE" ? "green" : "orange"}>
            {customer.status}
          </Tag>
        </p>
        <p>
          <b>Ghi chú:</b> {customer.note || "Không có"}
        </p>
      </Card>
    </div>
  );
};
