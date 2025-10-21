import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Button,
  Modal,
  message,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { MembershipLevel, CustomerStatus, Gender } from "../../model/Customer";
import { ROUTES } from "../../model/routePaths";

type Order = {
  orderID: string;
  date: string;
  status: string;
  amount: number;
};

const mockOrders: Order[] = Array.from({ length: 28 }, (_, i) => {
  const idx = i + 1;
  const status =
    idx % 3 === 0 ? "Đã huỷ" : idx % 2 === 0 ? "Đang giao" : "Đã giao";
  return {
    orderID: `O${String(idx).padStart(3, "0")}`,
    date: `2023-${String(((idx - 1) % 12) + 1).padStart(2, "0")}-10`,
    status,
    amount: status === "Đã huỷ" ? 0 : 120000 + idx * 10000,
  };
});

const initialCustomer = {
  customerID: "C001",
  fullName: "Nguyễn Văn A",
  email: "a@example.com",
  phone: "0909123456",
  gender: Gender.MALE,
  address: "Hà Nội",
  dateOfBirth: "1995-02-20",
  status: CustomerStatus.ACTIVE as CustomerStatus,
  membershipLevel: MembershipLevel.GOLD as MembershipLevel,
  loyaltyPoints: 1000,
  note: "Khách VIP lâu năm",
};

const membershipColor: Record<string, string> = {
  GOLD: "gold",
  SILVER: "#bfbfbf",
  PLATINUM: "purple",
};

const orderStatusColor: Record<string, string> = {
  "Đã giao": "green",
  "Đang giao": "blue",
  "Đã huỷ": "red",
};

// Tự tính rows/page cho bảng để “điền đầy trang”
function useAutoPageSize(rowHeight = 54, headerReserve = 380) {
  const [pageSize, setPageSize] = useState<number>(10);
  useEffect(() => {
    const calc = () => {
      const usable = window.innerHeight - headerReserve;
      const rows = Math.max(5, Math.floor(usable / rowHeight));
      setPageSize(rows);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [rowHeight, headerReserve]);
  return pageSize;
}

export const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ lấy prefix động từ URL (ví dụ: /dealer-staff, /manager)
  const prefix =
    location.pathname.split("/").slice(0, 2).join("/") || ROUTES.DEALER_STAFF;

  const [customer, setCustomer] = useState(initialCustomer);
  const [form] = Form.useForm();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // regex giống CustomerPage
  const NAME_REGEX = /^[\p{L}\s'.-]{2,50}$/u;
  const PHONE_REGEX = /^(0\d{9}|\+84\d{9})$/;
  const ADDRESS_REGEX = /^[\p{L}\d\s.,#-]{5,100}$/u;

  const columns: ColumnsType<Order> = useMemo(
    () => [
      { title: "Mã đơn", dataIndex: "orderID", key: "orderID", width: 120 },
      { title: "Ngày", dataIndex: "date", key: "date", width: 150 },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (v: string) => <Tag color={orderStatusColor[v]}>{v}</Tag>,
      },
      {
        title: "Số tiền",
        dataIndex: "amount",
        key: "amount",
        render: (v: number) => (v || 0).toLocaleString("vi-VN") + " ₫",
      },
    ],
    []
  );

  const pageSize = useAutoPageSize(54, 420);

  const statusTag = (s: CustomerStatus) => {
    const color =
      s === CustomerStatus.ACTIVE
        ? "green"
        : s === CustomerStatus.INACTIVE
        ? "orange"
        : "red";
    return <Tag color={color}>{s}</Tag>;
  };

  // Mở form chỉnh sửa
  const handleOpenEdit = () => {
    form.setFieldsValue({
      ...customer,
      dateOfBirth: dayjs(customer.dateOfBirth),
    });
    setIsEditOpen(true);
  };

  // Lưu form chỉnh sửa
  const handleSaveEdit = () => {
    form.validateFields().then(async (values) => {
      const updated = {
        ...customer,
        ...values,
        dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD"),
      };

      // TODO: Gọi API cập nhật thông tin khách hàng
      // await api.put(`/customers/${customer.customerID}`, updated)

      setCustomer(updated);
      setIsEditOpen(false);
      message.success("Cập nhật thông tin khách hàng thành công");
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ✅ Nút quay lại động */}
      <Button
        onClick={() => navigate(`${prefix}/customers`)}
        style={{
          backgroundColor: "#627254",
          color: "white",
          border: "none",
          borderRadius: 6,
          marginBottom: 20,
        }}
      >
        ← Quay lại danh sách
      </Button>

      <Typography.Title level={3}>
        Chi tiết khách hàng #{id || customer.customerID}
      </Typography.Title>

      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            className="shadow-md rounded-2xl mb-6"
            title="Thông tin khách hàng"
          >
            <div className="flex items-center gap-4 mb-4">
              {/* Avatar vuông chữ EMOB */}
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-extrabold tracking-wider"
                style={{
                  backgroundColor: "#627254",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  fontSize: 18,
                }}
              >
                EMOB
              </div>

              <div>
                <div className="text-lg font-semibold">{customer.fullName}</div>
                <div className="text-gray-500">{customer.email}</div>
                <div className="mt-1">
                  <Tag color={membershipColor[customer.membershipLevel]}>
                    {customer.membershipLevel}
                  </Tag>
                  <span className="ml-2 text-sm text-gray-500">
                    Điểm: {customer.loyaltyPoints}
                  </span>
                </div>
              </div>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="SĐT">
                {customer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {customer.gender}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {customer.address}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {customer.dateOfBirth}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {statusTag(customer.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {customer.note || "Không có"}
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-4 flex gap-2">
              <Button type="primary" onClick={handleOpenEdit}>
                Chỉnh sửa
              </Button>

              <Popconfirm
                title="Xác nhận xoá khách hàng?"
                description="Hành động này sẽ xoá khách hàng khỏi hệ thống."
                okText="Xoá"
                cancelText="Huỷ"
                okButtonProps={{
                  style: {
                    backgroundColor: "#d32f2f",
                    borderColor: "#d32f2f",
                    color: "white",
                  },
                }}
                onConfirm={async () => {
                  // TODO: Gọi API xoá khách hàng theo ID
                  // await api.delete(`/customers/${customer.customerID}`)
                  message.success("Đã xoá khách hàng");
                  navigate(`${prefix}/customers`);
                }}
              >
                <Button
                  danger
                  type="default"
                  style={{
                    borderRadius: 6,
                    borderColor: "#d32f2f",
                    color: "#d32f2f",
                    background: "transparent",
                  }}
                  className="hover:bg-red-600 hover:text-white"
                >
                  Xoá khách hàng
                </Button>
              </Popconfirm>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card
            bordered={false}
            className="shadow-md rounded-2xl"
            title="Đơn hàng đã đặt"
          >
            <Table
              rowKey="orderID"
              columns={columns}
              dataSource={mockOrders}
              pagination={{
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: [pageSize, 10, 15, 20].map(String),
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal CHỈNH SỬA */}
      <Modal
        title="Chỉnh sửa thông tin khách hàng"
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onOk={handleSaveEdit}
        width={700}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="fullName"
            label="Tên"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng" },
              {
                pattern: NAME_REGEX,
                message: "Tên chỉ gồm chữ, khoảng trắng và ký tự hợp lệ",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="SĐT"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: PHONE_REGEX, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!ADDRESS_REGEX.test(value))
                      return Promise.reject(
                        new Error("Địa chỉ chứa ký tự không hợp lệ")
                      );
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select
                options={Object.values(Gender).map((g) => ({
                  label: g,
                  value: g,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="membershipLevel"
              label="Membership"
              rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
            >
              <Select
                options={Object.values(MembershipLevel).map((m) => ({
                  label: m,
                  value: m,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="loyaltyPoints"
              label="Điểm tích luỹ"
              rules={[
                { required: true, message: "Vui lòng nhập điểm tích luỹ" },
                {
                  validator: (_, value) =>
                    value < 0
                      ? Promise.reject(new Error("Không được nhỏ hơn 0"))
                      : Promise.resolve(),
                },
              ]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select
                options={Object.values(CustomerStatus).map((s) => ({
                  label: s,
                  value: s,
                }))}
              />
            </Form.Item>
          </div>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerDetailPage;
