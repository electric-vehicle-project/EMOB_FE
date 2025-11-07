// src/components/organisms/profile/EditProfileModal.tsx
import React, { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { AxiosError } from "axios";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";

import type { IAccount, Gender } from "../../../model/Account";
import { useUpdateAccountProfile } from "../../../service/accountService";
import { Button } from "../../atoms/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (updated?: IAccount) => void; // parent sẽ dispatch Redux nếu có updated
  profile: IAccount;
}

const genderOptions = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
  { label: "Không xác định", value: "UNKNOWN" },
];

const phoneRule = {
  pattern: /^(\+?\d{7,15})$/,
  message: "Số điện thoại không hợp lệ",
};

const EditProfileModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  profile,
}) => {
  const [form] = Form.useForm();
  const updateProfile = useUpdateAccountProfile();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      gender: profile.gender,
      address: profile.address,
      dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : undefined,
    });
  }, [open, form, profile]);

  const onFinish = async (values: {
    fullName: string;
    phone: string;
    email?: string;
    gender: Gender;
    address: string;
    dateOfBirth?: dayjs.Dayjs;
  }) => {
    try {
      const payload = {
        fullName: values.fullName?.trim(),
        phone: values.phone?.trim(),
        email: values.email?.trim(),
        gender: values.gender,
        address: values.address?.trim(),
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : "",
      };
      const resp = await updateProfile.mutateAsync(payload);
      const updated: IAccount | undefined =
        resp?.data?.result ?? resp?.data ?? undefined;

      message.success("Cập nhật thông tin thành công");
      onSuccess(updated);
      form.resetFields();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      message.error(
        e?.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại"
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      title="Chỉnh sửa thông tin"
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        requiredMark={false}
        className="mt-2"
      >
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input
            placeholder="Nhập họ và tên"
            allowClear
            className="!rounded-xl"
          />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              phoneRule,
            ]}
          >
            <Input
              placeholder="Nhập số điện thoại"
              allowClear
              className="!rounded-xl"
            />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input
              placeholder="Nhập email"
              type="email"
              allowClear
              className="!rounded-xl"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select
              options={genderOptions}
              placeholder="Chọn giới tính"
              className="!rounded-xl"
            />
          </Form.Item>

          <Form.Item name="dateOfBirth" label="Ngày sinh">
            <DatePicker className="w-full !rounded-xl" format="YYYY-MM-DD" />
          </Form.Item>
        </div>

        {/* 🧱 Địa chỉ: gọn, không pill, không allowClear, không “hở sườn” */}
        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input.TextArea
            placeholder="Nhập địa chỉ"
            autoSize={{ minRows: 3, maxRows: 5 }}
            className="!rounded-xl !px-3 !py-2 resize-none"
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button type="default" icon={<CloseOutlined />} onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={updateProfile?.isPending}
            onClick={() => form.submit()}
          >
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
