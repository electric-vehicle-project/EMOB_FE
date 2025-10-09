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
  InputNumber,
  DatePicker,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";

import type { ICustomer } from "../model/Customer";
import { MembershipLevel, Gender, CustomerStatus } from "../model/Customer";

export const CustomerPage = () => {
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

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ICustomer | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // UI map
  const membershipColorMap: Record<string, string> = {
    GOLD: "gold",
    SILVER: "#bfbfbf",
    PLATINUM: "purple",
  };

  // Regex + validator
  const NAME_REGEX = /^[\p{L}\s'.-]{2,50}$/u;
  const PHONE_REGEX = /^(0\d{9}|\+84\d{9})$/;
  const ADDRESS_REGEX = /^[\p{L}\d\s.,#/-]{5,100}$/u;

  // filter search
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.customerID.toLowerCase().includes(q) ||
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(search)
    );
  });

  const handleSave = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : undefined,
      };

      if (editing) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.customerID === editing.customerID ? { ...editing, ...payload } : c
          )
        );
        message.success("Cập nhật khách hàng thành công");
      } else {
        const newCustomer: ICustomer = {
          customerID: `C${customers.length + 1}`.padStart(4, "0"),
          loyaltyPoints: 0,
          ...payload,
        };
        setCustomers((prev) => [...prev, newCustomer]);
        message.success("Thêm khách hàng thành công");
      }

      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.customerID !== id));
    message.success("Xoá khách hàng thành công");
  };

  const renderStatusTag = (status?: string) => {
    const s = (status ?? "").toString().trim().toLowerCase();
    switch (s) {
      case "active":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Active
          </Tag>
        );
      case "inactive":
        return (
          <Tag color="volcano" icon={<CloseCircleOutlined />}>
            Inactive
          </Tag>
        );
      case "banned":
        return (
          <Tag color="red" icon={<StopOutlined />}>
            Banned
          </Tag>
        );
      default:
        return <Tag>{status ?? "—"}</Tag>;
    }
  };

  // Columns
  const columns: ColumnsType<ICustomer> = [
    {
      title: "ID",
      dataIndex: "customerID",
      key: "customerID",
      width: 100,
      sorter: (a, b) => a.customerID.localeCompare(b.customerID),
      align: "center",
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
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
    { title: "SĐT", dataIndex: "phone", key: "phone", width: 200 },
    {
      title: "Membership",
      dataIndex: "membershipLevel",
      key: "membershipLevel",
      align: "center",
      width: 180,
      filters: Object.values(MembershipLevel).map((m) => ({
        text: m,
        value: m,
      })),
      onFilter: (value, record) => record.membershipLevel === value,
      render: (v: string) => (
        <Tag color={membershipColorMap[v] || "default"} className="px-3 py-1">
          {v}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 180,
      filters: [
        { text: "ACTIVE", value: "ACTIVE" },
        { text: "INACTIVE", value: "INACTIVE" },
        { text: "BANNED", value: "BANNED" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (v: string) => renderStatusTag(v),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            icon={<EditOutlined />}
            size="middle"
            onClick={() => {
              setEditing(record);
              form.setFieldsValue({
                ...record,
                dateOfBirth: record.dateOfBirth
                  ? dayjs(record.dateOfBirth, "YYYY-MM-DD")
                  : undefined,
              });
              setModalOpen(true);
            }}
            className="h-8 px-3 rounded-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: "#627254",
              color: "#fff",
              border: "none",
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xác nhận xoá?"
            onConfirm={() => handleDelete(record.customerID)}
          >
            <Button
              icon={<DeleteOutlined />}
              type="primary"
              danger
              size="middle"
              className="h-8 px-3 rounded-md"
            >
              Xoá
            </Button>
          </Popconfirm>

          <Button
            type="primary"
            size="middle"
            className="h-8 w-10 rounded-md"
            style={{ backgroundColor: "#627254", border: "none" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4f5f44";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#627254";
            }}
            onClick={() => navigate(`/admin/customers/${record.customerID}`)}
          >
            ⋮
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold mb-4">Quản lý khách hàng</h1>

      {/* Toolbar giống Dealer */}
      <div className="space-y-3 sm:space-y-0 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <Input
          placeholder="Tìm kiếm theo ID, tên, email, SĐT"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-[420px]"
          style={{ borderColor: "var(--primary-color, #627254)" }}
        />

        <Button
          type="primary"
          size="middle"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalOpen(true);
          }}
          className="w-full sm:w-auto px-6 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: "var(--primary-color, #627254)",
            border: "none",
          }}
        >
          Thêm khách hàng mới
        </Button>
      </div>

      <Table
        rowKey="customerID"
        columns={columns}
        dataSource={filtered}
        size="middle"
        className="rounded-lg [&_.ant-table-thead>tr>th]:text-center"
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 1100 }}
        tableLayout="fixed"
      />

      <Modal
        title={editing ? "Sửa khách hàng" : "Thêm khách hàng"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={handleSave}
        width={840}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="fullName"
            label="Tên"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng" },
              {
                pattern: NAME_REGEX,
                message: "Tên chỉ gồm chữ, khoảng trắng và . ' - (2–50 ký tự)",
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label="Email"
              className="md:col-span-2"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input allowClear />
            </Form.Item>

            <Form.Item
              name="phone"
              label="SĐT"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: PHONE_REGEX,
                  message:
                    "Số điện thoại phải 10 số bắt đầu bằng 0 hoặc +84xxxxxxxxx",
                },
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
                    if (!value || value.length === 0) return Promise.resolve();
                    if (!ADDRESS_REGEX.test(value))
                      return Promise.reject(
                        new Error("Địa chỉ không được chứa ký tự đặc biệt lạ")
                      );
                    if (value.length < 5 || value.length > 100)
                      return Promise.reject(
                        new Error("Địa chỉ phải từ 5 đến 100 ký tự")
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
              rules={[{ required: true, message: "Vui lòng chọn membership" }]}
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
                  validator: (_, value) => {
                    if (value === null || value === undefined)
                      return Promise.resolve();
                    if (!Number.isInteger(value))
                      return Promise.reject(
                        new Error("Điểm tích luỹ phải là số nguyên")
                      );
                    if (value < 0)
                      return Promise.reject(
                        new Error("Điểm tích luỹ không được nhỏ hơn 0")
                      );
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
              rules={[
                { required: true, message: "Vui lòng chọn ngày sinh" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (value.isAfter(dayjs(), "day"))
                      return Promise.reject(
                        new Error("Ngày sinh không được ở tương lai")
                      );
                    return Promise.resolve();
                  },
                },
              ]}
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

          <Form.Item
            name="note"
            label="Ghi chú"
            rules={[{ max: 300, message: "Ghi chú tối đa 300 ký tự" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
