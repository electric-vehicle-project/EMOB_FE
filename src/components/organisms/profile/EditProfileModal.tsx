// src/components/organisms/profile/EditProfileModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, message, Tooltip } from "antd";
import dayjs from "dayjs";
import { AxiosError } from "axios";
import { SaveOutlined, CloseOutlined, LockOutlined } from "@ant-design/icons";
import type { IAccount, Gender } from "../../../model/Account";
import { useUpdateAccountProfile } from "../../../service/accountService";
import { Button } from "../../atoms/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (updated?: IAccount) => void;
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
  const [canSubmit, setCanSubmit] = useState(false);

  const emailEditable = useMemo<boolean>(() => false, []);

  // ✅ baseline chỉ gồm 5 field đúng schema PUT /api/auth/profile
  const baseline = useMemo(
    () => ({
      fullName: (profile.fullName || "").trim(),
      phone: (profile.phone || "").trim(),
      gender: profile.gender,
      address: (profile.address || "").trim(),
      dateOfBirth: profile.dateOfBirth || "",
    }),
    [profile]
  );

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
    setCanSubmit(false);
  }, [open, form, profile]);

  const computeDiff = () => {
    const v = form.getFieldsValue();
    const curr = {
      fullName: (v.fullName || "").trim(),
      phone: (v.phone || "").trim(),
      gender: v.gender as Gender,
      address: (v.address || "").trim(),
      dateOfBirth: v.dateOfBirth ? v.dateOfBirth.format("YYYY-MM-DD") : "",
    };
    return JSON.stringify(curr) !== JSON.stringify(baseline);
  };

  const onValuesChange = () => setCanSubmit(computeDiff());

  const onFinish = async (values: {
    fullName: string;
    phone: string;
    email?: string;
    gender: Gender;
    address: string;
    dateOfBirth?: dayjs.Dayjs;
  }) => {
    try {
      // ✅ Gửi đầy đủ shape đúng Swagger
      const payload = {
        fullName: values.fullName.trim(),
        gender: values.gender,
        address: values.address.trim(),
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : baseline.dateOfBirth || undefined,
        phone: values.phone.trim(),
      };

      if (!computeDiff()) {
        message.info("Bạn chưa thay đổi thông tin nào");
        return;
      }

      const resp = await updateProfile.mutateAsync(payload);
      const updated: IAccount | undefined =
        resp?.data?.result ?? resp?.data ?? undefined;

      message.success("Cập nhật thông tin thành công");
      onSuccess(updated);
      form.resetFields();
      setCanSubmit(false);
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
      <div className="relative">
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          onValuesChange={onValuesChange}
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
              className="!rounded-full !px-4 !py-2"
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
                className="!rounded-full !px-4 !py-2"
              />
            </Form.Item>

            <Form.Item name="email" label="Email">
              {emailEditable ? (
                <Input
                  type="email"
                  allowClear
                  className="!rounded-full !px-4 !py-2"
                  placeholder="Nhập email"
                />
              ) : (
                <Tooltip title="Email là định danh tài khoản, không thể thay đổi">
                  <Input
                    disabled
                    suffix={<LockOutlined />}
                    className="!rounded-full !px-4 !py-2"
                  />
                </Tooltip>
              )}
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
                className="!rounded-full"
              />
            </Form.Item>

            <Form.Item name="dateOfBirth" label="Ngày sinh">
              <DatePicker
                className="w-full !rounded-full !px-4 !py-2"
                format="YYYY-MM-DD"
                // ✅ Không cho chọn ngày trong tương lai
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea
              placeholder="Nhập địa chỉ"
              autoSize={{ minRows: 3, maxRows: 5 }}
              className="!rounded-xl !px-3 !py-2 resize-none"
              showCount
              maxLength={250}
            />
          </Form.Item>
        </Form>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-white pt-3 mt-4 border-t z-10 flex justify-end gap-2">
          <Button type="default" icon={<CloseOutlined />} onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={updateProfile?.isPending}
            onClick={() => form.submit()}
            disabled={!canSubmit}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
