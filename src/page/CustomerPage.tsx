import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";

// interface/type phải import bằng 'import type' do cấu hình TS của dự án
import type { ICustomer } from "../model/Customer";
import { MembershipLevel, Gender, CustomerStatus } from "../model/Customer";

export const CustomerPage = () => {
  // dữ liệu tạm để FE chạy độc lập; sau này thay bằng gọi API
  const [customers, setCustomers] = useState<ICustomer[]>([
    {
      customerID: "C001",
      fullName: "Nguyễn Văn A",
      email: "a@example.com",
      phone: "0909123456",
      membershipLevel: MembershipLevel.GOLD,
      loyaltyPoints: 1000,
      gender: Gender.MALE,
      address: "Hà Nội",
      dateOfBirth: "1995-02-20",
      status: CustomerStatus.ACTIVE,
      note: "Khách VIP",
    },
    {
      customerID: "C002",
      fullName: "Trần Thị B",
      email: "b@example.com",
      phone: "0912345678",
      membershipLevel: MembershipLevel.SILVER,
      loyaltyPoints: 300,
      gender: Gender.FEMALE,
      address: "TP.HCM",
      dateOfBirth: "1998-07-15",
      status: CustomerStatus.INACTIVE,
      note: "",
    },
  ]);

  // text tìm kiếm
  const [search, setSearch] = useState("");

  // điều khiển mở/đóng modal form
  const [modalOpen, setModalOpen] = useState(false);

  // nếu khác null → đang sửa; null → đang thêm mới
  const [editing, setEditing] = useState<ICustomer | null>(null);

  // form instance của AntD để get/set dữ liệu form
  const [form] = Form.useForm();

  // lọc danh sách theo tên/email/điện thoại (đơn giản, chạy trên mảng tạm)
  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  // lưu form: nếu có 'editing' → cập nhật; ngược lại → thêm mới
  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editing) {
        // update theo customerID
        setCustomers((prev) =>
          prev.map((c) =>
            c.customerID === editing.customerID ? { ...editing, ...values } : c
          )
        );
        message.success("Cập nhật khách hàng thành công");
      } else {
        // tạo ID đơn giản từ độ dài mảng (tạm); thực tế server sẽ trả về ID
        const newCustomer: ICustomer = {
          customerID: `C${customers.length + 1}`.padStart(4, "0"),
          loyaltyPoints: 0, // mặc định
          ...values, // các field còn lại lấy từ form
        };
        setCustomers((prev) => [...prev, newCustomer]);
        message.success("Thêm khách hàng thành công");
      }

      // đóng modal + dọn state
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  // xoá theo ID; thực tế sẽ gọi API delete rồi refetch
  const handleDelete = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.customerID !== id));
    message.success("Xoá khách hàng thành công");
  };

  // cấu hình cột cho bảng
  const columns: ColumnsType<ICustomer> = [
    { title: "ID", dataIndex: "customerID", key: "customerID", width: 100 },

    // tên là link → sang trang chi tiết /admin/customers/:id
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Link
          to={`/admin/customers/${record.customerID}`}
          className="text-[#627254] hover:underline"
        >
          {text}
        </Link>
      ),
    },

    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },

    // hiển thị membership bằng Tag đơn giản
    {
      title: "Membership",
      dataIndex: "membershipLevel",
      key: "membershipLevel",
      render: (v: string) => <Tag>{v}</Tag>,
    },

    // tô màu status để dễ nhìn
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => {
        const color =
          v === "ACTIVE" ? "green" : v === "INACTIVE" ? "orange" : "red";
        return <Tag color={color}>{v}</Tag>;
      },
    },

    // action: sửa/xoá
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            type="primary" // lấy màu primary đã cấu hình (#627254)
            size="small"
            onClick={() => {
              setEditing(record); // bật chế độ edit
              form.setFieldsValue(record); // đổ dữ liệu lên form
              setModalOpen(true);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xác nhận xoá?"
            onConfirm={() => handleDelete(record.customerID)}
          >
            <Button danger size="small">
              Xoá
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quản lý khách hàng</h1>

      {/* thanh công cụ: search + thêm */}
      <div className="flex justify-between mb-4">
        <Input.Search
          placeholder="Tìm kiếm theo tên, email, SĐT"
          onChange={(e) => setSearch(e.target.value)}
          // viền search theo màu project; nếu muốn global thì sửa trong config/antd.ts
          style={{ width: 300, borderColor: "#627254" }}
          allowClear
        />

        <Button
          type="primary"
          onClick={() => {
            setEditing(null); // chuyển về chế độ create
            form.resetFields();
            setModalOpen(true);
          }}
        >
          + Thêm khách hàng
        </Button>
      </div>

      {/* bảng danh sách */}
      <Table rowKey="customerID" columns={columns} dataSource={filtered} />

      {/* modal: dùng chung cho thêm và sửa */}
      <Modal
        title={editing ? "Sửa khách hàng" : "Thêm khách hàng"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={handleSave}
      >
        <Form layout="vertical" form={form}>
          {/* các field bắt buộc: tên, email (validate email), SĐT */}
          <Form.Item name="fullName" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="SĐT" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {/* field không bắt buộc */}
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>

          {/* enum dạng select: map từ const object → options */}
          <Form.Item
            name="membershipLevel"
            label="Membership"
            rules={[{ required: true }]}
          >
            <Select
              options={Object.values(MembershipLevel).map((m) => ({
                label: m,
                value: m,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select
              options={Object.values(CustomerStatus).map((s) => ({
                label: s,
                value: s,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
