import { useEffect, useState, useMemo } from "react";
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
  Popconfirm,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { CustomerStatus, Gender, type ICustomer } from "../../model/Customer";
import {
  useCustomerById,
  useCustomerDelete,
  useCustomerUpdate,
} from "../../service/customerService";
import { ROUTES } from "../../model/routePaths";

// --- Mock đơn hàng (tạm thời)
type Order = {
  orderID: string;
  date: string;
  status: string;
  amount: number;
};
const mockOrders: Order[] = Array.from({ length: 12 }, (_, i) => ({
  orderID: `O${String(i + 1).padStart(3, "0")}`,
  date: `2023-${String((i % 12) + 1).padStart(2, "0")}-10`,
  status: i % 3 === 0 ? "Đã huỷ" : i % 2 === 0 ? "Đang giao" : "Đã giao",
  amount: i % 3 === 0 ? 0 : 120000 + i * 10000,
}));

// --- Map màu tag
const membershipColor: Record<string, string> = {
  NORMAL: "#627254",
  BRONZE: "#cd7f32",
  SILVER: "#bfbfbf",
  GOLD: "#ffd700",
  PLATINUM: "#e5e4e2",
};
const orderStatusColor: Record<string, string> = {
  "Đã giao": "green",
  "Đang giao": "blue",
  "Đã huỷ": "red",
};

// --- Hook tự động tính page size cho bảng
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

  // ✅ Lấy prefix động: /dealer-staff, /manager, /evm-staff,...
  const prefix =
    location.pathname.split("/").slice(0, 2).join("/") || ROUTES.DEALER_STAFF;

  // === API hooks ===
  const { data, isLoading, error } = useCustomerById(id ?? "");
  const { mutateAsync: deleteCustomer } = useCustomerDelete();
  const { mutateAsync: updateCustomer } = useCustomerUpdate();

  const customer: ICustomer | undefined = data?.result;
  const [form] = Form.useForm();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const pageSize = useAutoPageSize(54, 420);

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

  // Tag trạng thái khách hàng
  const statusTag = (s?: string) => {
    switch (s?.toUpperCase()) {
      case "ACTIVE":
        return <Tag color="green">ACTIVE</Tag>;
      case "INACTIVE":
        return <Tag color="orange">INACTIVE</Tag>;
      case "BLOCKED":
        return <Tag color="volcano">BLOCKED</Tag>;
      case "DELETED":
        return <Tag color="red">DELETED</Tag>;
      case "LEAD":
        return <Tag color="blue">LEAD</Tag>;
      default:
        return <Tag color="default">{s ?? "—"}</Tag>;
    }
  };

  // Khi lỗi → quay lại danh sách
  useEffect(() => {
    if (error) {
      message.error("Không tìm thấy khách hàng.");
      navigate(`${prefix}/customers`);
    }
  }, [error]);

  // Loading
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );

  if (!customer) return null;

  // === Chỉnh sửa ===
  const handleOpenEdit = () => {
    form.setFieldsValue({
      ...customer,
      dateOfBirth: customer.dateOfBirth
        ? dayjs(customer.dateOfBirth)
        : undefined,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
          : undefined,
      };
      await updateCustomer({ id: customer.id, data: payload });
      message.success("Cập nhật thông tin khách hàng thành công");
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật, vui lòng thử lại.");
    }
  };

  // === Xoá khách hàng ===
  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
      message.success("Đã xoá khách hàng");
      navigate(`${prefix}/customers`);
    } catch {
      message.error("Xoá khách hàng thất bại");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ✅ Nút quay lại danh sách động */}
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

      <Typography.Title level={3}>Chi tiết khách hàng #{id}</Typography.Title>

      <Row gutter={24}>
        {/* --- Thông tin khách hàng --- */}
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            className="shadow-md rounded-2xl mb-6"
            title="Thông tin khách hàng"
          >
            <div className="flex items-center gap-4 mb-4">
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
                  <Tag
                    color={
                      membershipColor[customer.memberShipLevel ?? "NORMAL"]
                    }
                  >
                    {customer.memberShipLevel}
                  </Tag>
                  <span className="ml-2 text-sm text-gray-500">
                    Điểm: {customer.loyaltyPoints ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="SĐT">
                {customer.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {customer.gender}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {customer.address || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {customer.dateOfBirth
                  ? dayjs(customer.dateOfBirth).format("YYYY-MM-DD")
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {statusTag(customer.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {customer.note || "Không có"}
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-4 flex gap-2">
              <Button
                type="primary"
                style={{ backgroundColor: "#627254", border: "none" }}
                onClick={handleOpenEdit}
              >
                Chỉnh sửa
              </Button>

              <Popconfirm
                title="Xác nhận xoá khách hàng?"
                okText="Xoá"
                cancelText="Huỷ"
                okButtonProps={{
                  style: {
                    backgroundColor: "#d93025",
                    borderColor: "#d93025",
                    color: "white",
                  },
                }}
                onConfirm={handleDelete}
              >
                <Button
                  danger
                  style={{
                    borderRadius: 6,
                    borderColor: "#d93025",
                    color: "#d93025",
                  }}
                  className="hover:bg-red-600 hover:text-white"
                >
                  Xoá khách hàng
                </Button>
              </Popconfirm>
            </div>
          </Card>
        </Col>

        {/* --- Đơn hàng đã đặt --- */}
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

      {/* --- Modal chỉnh sửa --- */}
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
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="SĐT">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính">
            <Select
              options={Object.values(Gender).map((g) => ({
                label: g,
                value: g,
              }))}
            />
          </Form.Item>
          <Form.Item name="dateOfBirth" label="Ngày sinh">
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select
              options={Object.values(CustomerStatus).map((s) => ({
                label: s,
                value: s,
              }))}
            />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerDetailPage;
