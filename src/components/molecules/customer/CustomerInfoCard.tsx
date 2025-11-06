import { Card, Descriptions, Tag } from "antd";
import dayjs from "dayjs";
import type { ICustomer } from "../../../model/Customer";

interface Props {
  customer: ICustomer;
}

export const CustomerInfoCard: React.FC<Props> = ({ customer }) => {
  return (
    <Card bordered className="mb-6">
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Họ và tên">
          {customer.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {customer.phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {customer.gender === "MALE"
            ? "Nam"
            : customer.gender === "FEMALE"
            ? "Nữ"
            : "Khác"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {customer.dateOfBirth
            ? dayjs(customer.dateOfBirth).format("DD/MM/YYYY")
            : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {customer.address}
        </Descriptions.Item>
        <Descriptions.Item label="Cấp độ thành viên">
          <Tag color="geekblue">{customer.memberShipLevel}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Điểm tích lũy">
          {customer.loyaltyPoints ?? 0}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái" span={2}>
          <Tag
            color={
              customer.status === "ACTIVE"
                ? "green"
                : customer.status === "INACTIVE"
                ? "orange"
                : customer.status === "LEAD"
                ? "blue"
                : "default"
            }
          >
            {customer.status}
          </Tag>
        </Descriptions.Item>
        {customer.note && (
          <Descriptions.Item label="Ghi chú" span={2}>
            {customer.note}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};
