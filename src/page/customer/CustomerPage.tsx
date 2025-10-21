import { useState } from "react";
import { Table, Tag, Button, Input, Popconfirm, message } from "antd";
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

import {
  useCustomerList,
  useCustomerDelete,
} from "../../service/customerService";
import type { ICustomer } from "../../model/Customer";
import { ROUTES } from "../../model/routePaths";

export const CustomerPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useCustomerList(0, 20);
  const { mutateAsync: deleteCustomer } = useCustomerDelete();

  const customers = data?.result?.data ?? [];

  // Lọc theo nội dung thanh tìm kiếm
  const filtered = customers.filter((c: ICustomer) => {
    const q = search.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phoneNumber?.toLowerCase().includes(q)
    );
  });

  // Xử lý xoá khách hàng
  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      message.success("Xoá khách hàng thành công");
      refetch();
    } catch {
      message.error("Xoá khách hàng thất bại");
    }
  };

  // Hiển thị tag trạng thái (chuẩn hoá chữ hoa/thường)
  const renderStatusTag = (status?: string) => {
    const s = status?.trim().toUpperCase();
    switch (s) {
      case "LEAD":
        return (
          <Tag color="blue" icon={<CheckCircleOutlined />}>
            Lead
          </Tag>
        );
      case "ACTIVE":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Active
          </Tag>
        );
      case "INACTIVE":
        return (
          <Tag color="orange" icon={<CloseCircleOutlined />}>
            Inactive
          </Tag>
        );
      case "BLOCKED":
        return (
          <Tag color="volcano" icon={<StopOutlined />}>
            Blocked
          </Tag>
        );
      case "DELETED":
        return (
          <Tag color="red" icon={<StopOutlined />}>
            Deleted
          </Tag>
        );
      default:
        return <Tag color="default">{status ?? "—"}</Tag>;
    }
  };

  //  Hiển thị tag Membership
  const renderMemberTag = (level?: string) => {
    switch (level?.toUpperCase()) {
      case "BRONZE":
        return <Tag color="#CD7F32">BRONZE</Tag>; // đồng
      case "SILVER":
        return <Tag color="#BFBFBF">SILVER</Tag>; // bạc
      case "GOLD":
        return <Tag color="#FFD700">GOLD</Tag>; // vàng
      case "PLATINUM":
        return <Tag color="#E5E4E2">PLATINUM</Tag>; // bạch kim
      case "NORMAL":
        return <Tag color="#627254">NORMAL</Tag>; // màu chủ đạo EMOB
      default:
        return <Tag color="default">{level ?? "—"}</Tag>;
    }
  };

  //  Cấu hình bảng
  const columns: ColumnsType<ICustomer> = [
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (text, record) => (
        <Link
          to={`${ROUTES.DEALER_STAFF}/customers/${record.id}`}
          className="text-[#627254] hover:underline"
        >
          {text}
        </Link>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 180,
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Membership",
      dataIndex: "memberShipLevel",
      key: "memberShipLevel",
      align: "center",
      filters: ["NORMAL", "BRONZE", "SILVER", "GOLD", "PLATINUM"].map((v) => ({
        text: v,
        value: v,
      })),
      onFilter: (value, record) =>
        record.memberShipLevel?.toUpperCase() === value,
      render: (v: string) => renderMemberTag(v),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      filters: [
        { text: "MALE", value: "MALE" },
        { text: "FEMALE", value: "FEMALE" },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      align: "center",
      sorter: (a, b) =>
        dayjs(a.dateOfBirth).unix() - dayjs(b.dateOfBirth).unix(),
      render: (v: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: "LEAD", value: "LEAD" },
        { text: "ACTIVE", value: "ACTIVE" },
        { text: "INACTIVE", value: "INACTIVE" },
        { text: "BLOCKED", value: "BLOCKED" },
        { text: "DELETED", value: "DELETED" },
      ],
      onFilter: (value, record) =>
        record.status?.trim().toUpperCase() === value,
      render: (v: string) => renderStatusTag(v),
    },

    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`${ROUTES.DEALER_STAFF}/customers/edit/${record.id}`)
            }
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
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              danger
              className="!bg-[#d93025] !text-white hover:!bg-[#b1271e] hover:!text-white border-none"
              onClick={() => handleDelete(record.id)}
            >
              <DeleteOutlined /> Xoá
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // ✅ Render giao diện
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold mb-4">Quản lý khách hàng</h1>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <Input
          placeholder="Tìm kiếm theo tên, email, SĐT"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-[420px]"
          style={{ borderColor: "#627254" }}
        />

        <Button
          type="primary"
          onClick={() => navigate(`${ROUTES.DEALER_STAFF}/customers/create`)}
          style={{ backgroundColor: "#627254", border: "none" }}
        >
          Thêm khách hàng mới
        </Button>
      </div>

      <Table
        loading={isLoading}
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};
