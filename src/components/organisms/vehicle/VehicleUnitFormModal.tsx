// src/components/organisms/EVM/VehicleUnitFormModal.tsx
import {
  Modal,
  Form,
  InputNumber,
  Input,
  DatePicker,
  Select,
  message,
} from "antd";
import { useBulkCreateVehicleUnits } from "../../../service/vehicleService";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  vehicleId: string | null; // id của model
}

export default function VehicleUnitFormModal({
  open,
  onClose,
  vehicleId,
}: Props) {
  type FormValues = {
    quantity: number;
    color: string;
    productionYear?: Dayjs;
    purchaseDate?: Dayjs;
    status:
      | "NORMAL"
      | "SPECIAL"
      | "OLD_STOCK"
      | "TEST_DRIVE"
      | "RESERVED"
      | "SOLD";
  };

  const [form] = Form.useForm<FormValues>();
  const bulkCreate = useBulkCreateVehicleUnits();

  const onFinish = async (values: FormValues) => {
    if (!vehicleId) return;

    try {
      await bulkCreate.mutateAsync({
        vehicleId,
        quantity: values.quantity,
        color: values.color,
        productionYear: values.productionYear
          ? dayjs(values.productionYear).format("YYYY-01-01")
          : undefined,
        purchaseDate: values.purchaseDate
          ? dayjs(values.purchaseDate).toISOString()
          : undefined,
        status: values.status, // ✅ chuẩn enum BE
      });

      message.success("✅ Tạo lô xe thành công");
      form.resetFields();
      onClose();
    } catch {
      message.error("❌ Không thể tạo lô xe, vui lòng thử lại!");
    }
  };

  return (
    <Modal
      open={open}
      title="Thêm nhiều đơn vị xe (Vehicle Units)"
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Tạo"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ quantity: 1, status: "NORMAL" }}
      >
        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item
          name="color"
          label="Màu sắc"
          rules={[{ required: true, message: "Vui lòng nhập màu sắc" }]}
        >
          <Input placeholder="Ví dụ: Trắng" />
        </Form.Item>

        <Form.Item name="productionYear" label="Năm sản xuất">
          <DatePicker picker="year" className="w-full" />
        </Form.Item>

        <Form.Item name="purchaseDate" label="Ngày nhập kho (tùy chọn)">
          <DatePicker showTime className="w-full" />
        </Form.Item>

        <Form.Item name="status" label="Tình trạng">
          <Select>
            <Select.Option value="NORMAL">Xe mới (bình thường)</Select.Option>
            <Select.Option value="SPECIAL">
              Xe trưng bày / đặc biệt
            </Select.Option>
            <Select.Option value="OLD_STOCK">Xe tồn kho cũ</Select.Option>
            <Select.Option value="TEST_DRIVE">Xe lái thử</Select.Option>
            <Select.Option value="RESERVED">Xe được đặt giữ chỗ</Select.Option>
            <Select.Option value="SOLD">Xe đã bán</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
