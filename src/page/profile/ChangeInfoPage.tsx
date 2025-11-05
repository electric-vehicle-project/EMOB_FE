import React, { useEffect, useState } from "react";
import { Form, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import {
  useGetAccountProfile,
  useUpdateAccountProfile,
} from "../../service/accountService";
import { Button } from "../../components/atoms/Button";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const ChangeInfoPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [avatarPreview] = useState<string | null>(null);

  const profileQuery = useGetAccountProfile();
  useEffect(() => {
    const res = profileQuery.data;
    if (res) {
      form.setFieldsValue({
        fullName: res?.fullName,
        phone: res?.phone,
        gender: res?.gender,
        address: res?.address,
        dateOfBirth: res?.dateOfBirth ? dayjs(res.dateOfBirth) : undefined,
      });
    }
  }, [profileQuery.data, form]);

  const updateProfile = useUpdateAccountProfile();
  const onFinish = async (values: {
    fullName: string;
    phone: string;
    gender: string;
    address: string;
    dateOfBirth?: import("dayjs").Dayjs;
  }) => {
    const payload = {
      fullName: values.fullName,
      phone: values.phone,
      gender: values.gender,
      address: values.address,
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth.format("YYYY-MM-DD")
        : "",
    };
    await updateProfile.mutateAsync(payload);
    message.success("Cập nhật thông tin thành công");
    if (avatarPreview) {
      message.success("Ảnh đại diện đã được cập nhật thành công!");
    }
    navigate("/admin/profile/info");
  };

  return (
    <section className="p-6 md:p-8 bg-[var(--neutural-color)] min-h-[calc(100vh-80px)] flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-6 md:p-8 mx-auto transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 hover:bg-[#f2f7ea]">
        <div className="mb-6">
          <div className="border-l-4 border-[#627254] pl-3">
            <h2 className="text-2xl font-bold text-[#414d38]">
              Chỉnh sửa thông tin cá nhân
            </h2>
            <p className="text-gray-500 mt-1">
              Cập nhật thông tin cơ bản để hồ sơ của bạn
            </p>
          </div>
        </div>

        {/* Form */}
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          requiredMark={false}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
        >
          <Form.Item
            name="fullName"
            label={
              <span className="font-semibold text-[#414d38]">Họ và tên</span>
            }
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input
              className="bg-white rounded-xl border border-gray-300 focus:border-[#627254] focus:ring-[#627254]/20"
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Nhập họ và tên"
            />
          </Form.Item>
          <Form.Item
            name="phone"
            label={
              <span className="font-semibold text-[#414d38]">
                Số điện thoại
              </span>
            }
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input
              className="bg-white rounded-xl border border-gray-300 focus:border-[#627254] focus:ring-[#627254]/20"
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>
          <Form.Item
            name="gender"
            label={
              <span className="font-semibold text-[#414d38]">Giới tính</span>
            }
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select
              className="rounded-xl"
              options={[
                { label: "Nam", value: "Male" },
                { label: "Nữ", value: "Female" },
                { label: "Khác", value: "Other" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="dateOfBirth"
            label={
              <span className="font-semibold text-[#414d38]">Ngày sinh</span>
            }
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <DatePicker
              className="w-full rounded-xl border border-gray-300 focus:border-[#627254] focus:ring-[#627254]/20"
              format="YYYY-MM-DD"
              suffixIcon={<CalendarOutlined />}
            />
          </Form.Item>
          <Form.Item
            className="md:col-span-2"
            name="address"
            label={
              <span className="font-semibold text-[#414d38]">Địa chỉ</span>
            }
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea
              className="bg-white rounded-xl border border-gray-300 focus:border-[#627254] focus:ring-[#627254]/20"
              rows={3}
              placeholder="Nhập địa chỉ"
              prefix={undefined}
            />
          </Form.Item>
        </Form>

        {/* Buttons */}
        <div className="flex justify-end items-center mt-8 flex-wrap gap-3">
          <Button
            className="!bg-[#627254] hover:!bg-[#525e46] active:!bg-[#414d38] text-white rounded-xl transition-all duration-300 px-6 py-2"
            onClick={() => form.submit()}
            loading={updateProfile.isPending}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ChangeInfoPage;
