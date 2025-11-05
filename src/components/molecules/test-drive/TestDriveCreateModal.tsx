/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Button,
  message,
  Row,
  Col,
  Divider,
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import {
  useCreateTestDriveMutation,
  useCustomerQuery,
  useFreeVehiclesQuery,
  useVehicleQuery,
} from "../../../service/testDriveService";
import { FreeVehicleCardList } from "../../atoms/FreeVehicleCardList";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TestDriveCreateModal = ({ open, onClose, onSuccess }: Props) => {
  const [form] = Form.useForm();
  const [freeVehicles, setFreeVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>();
  const [searching, setSearching] = useState(false);

  // Hooks
  const { data: customers } = useCustomerQuery({}, { size: 100, sortField: "fullName" });
  const { data: vehicles } = useVehicleQuery({}, { size: 100, sortField: "createdAt" });
  const { mutateAsync: createTestDrive, isPending } = useCreateTestDriveMutation();
  const { refetch: findFreeVehicles } = useFreeVehiclesQuery({},{});

  // Dropdown data
  const customerOptions =
    customers?.result?.data?.map((c: any) => ({
      label: c.fullName,
      value: c.id,
    })) ?? [];

  const modelOptions =
    vehicles?.result?.data?.map((v: any) => ({
      label: v.model,
      value: v.model,
    })) ?? [];

  // Actions
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedVehicleId) return message.warning("Vui lòng chọn xe lái thử!");
      await createTestDrive({
        customerId: values.customerId,
        testDriveVehicleId: selectedVehicleId,
        location: values.location,
        duration: Number(values.duration),
        scheduledAt: `${values.date.format("YYYY-MM-DD")}T${values.time}`,
      });
      message.success("Tạo lịch lái thử thành công!");
      form.resetFields();
      setFreeVehicles([]);
      setSelectedVehicleId(undefined);
      onSuccess();
    } catch {
      message.error("Không thể tạo lịch lái thử!");
    }
  };

  const handleFindVehicles = async () => {
    const date = form.getFieldValue("date");
    const time = form.getFieldValue("time");
    const duration = form.getFieldValue("duration");
    const model = form.getFieldValue("model");

    if (!date || !time || !duration || !model) {
      return message.warning("Vui lòng chọn đủ thông tin trước khi tìm xe trống!");
    }

    setSearching(true);
    try {
      const { data } = await findFreeVehicles({
        scheduledAt: `${date.format("YYYY-MM-DD")}T${time}`,
        duration,
        model,
      });
      setFreeVehicles(data?.result ?? []);
      message.success(`Tìm thấy ${data?.result?.length ?? 0} xe trống lịch`);
    } catch {
      message.error("Không thể tải danh sách xe trống lịch!");
    } finally {
      setSearching(false);
    }
  };

  return (
    <Modal
      title="Tạo lịch lái thử mới"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={isPending}
      centered
      width={800}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Khách hàng"
              name="customerId"
              rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
            >
              <Select
                placeholder="Chọn khách hàng"
                options={customerOptions}
                showSearch
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Địa điểm"
              name="location"
              rules={[{ required: true, message: "Nhập địa điểm lái thử" }]}
            >
              <Select
                placeholder="Chọn địa điểm"
                options={[
                  { label: "EV Showroom District 9", value: "EV Showroom District 9" },
                  { label: "EV Showroom Bến Thành", value: "EV Showroom Bến Thành" },
                  { label: "EV Showroom Thủ Đức", value: "EV Showroom Thủ Đức" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Ngày lái thử"
              name="date"
              rules={[{ required: true, message: "Chọn ngày lái thử" }]}
            >
              <DatePicker
                disabledDate={(d) => d.isBefore(dayjs(), "day")}
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Giờ bắt đầu"
              name="time"
              rules={[{ required: true, message: "Chọn giờ bắt đầu" }]}
            >
              <Select
                placeholder="Chọn giờ"
                options={[
                  { label: "08:00", value: "08:00" },
                  { label: "10:00", value: "10:00" },
                  { label: "12:00", value: "12:00" },
                  { label: "14:00", value: "14:00" },
                  { label: "16:00", value: "16:00" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Thời lượng (phút)"
              name="duration"
              rules={[{ required: true, message: "Chọn thời lượng" }]}
            >
              <Select
                placeholder="Thời lượng"
                options={[
                  { label: "60", value: 60 },
                  { label: "90", value: 90 },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              label="Model xe"
              name="model"
              rules={[{ required: true, message: "Chọn model xe" }]}
            >
              <Select
                placeholder="Chọn model xe"
                options={modelOptions}
                showSearch
              />
            </Form.Item>
          </Col>

          <Col span={8} className="flex items-end">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              block
              onClick={handleFindVehicles}
              disabled={
                !form.getFieldValue("date") ||
                !form.getFieldValue("time") ||
                !form.getFieldValue("duration") ||
                !form.getFieldValue("model")
              }
              loading={searching}
              className="!bg-[#627254]"
            >
              Tìm xe trống lịch
            </Button>
          </Col>
        </Row>

        {freeVehicles.length > 0 && (
          <>
            <Divider orientation="left">Xe trống lịch</Divider>
            <FreeVehicleCardList
              vehicles={freeVehicles}
              onSelect={(id) => setSelectedVehicleId(id)}
              selectedVehicleId={selectedVehicleId}
            />
          </>
        )}
      </Form>
    </Modal>
  );
};
