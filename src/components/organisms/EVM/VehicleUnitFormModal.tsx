import { Modal, Form, InputNumber, Input, DatePicker, Select } from "antd";
import { useBulkCreateVehicleUnits } from "../../../service/vehicleService";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  vehicleId: string | null; // truyền ngầm từ record đang thao tác
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
    status: string;
  };

  const [form] = Form.useForm<FormValues>();
  const bulkCreate = useBulkCreateVehicleUnits();

  const onFinish = async (values: FormValues) => {
    if (!vehicleId) return;

    const payload = {
      vehicleId,
      quantity: values.quantity,
      color: values.color,
      productionYear: values.productionYear
        ? dayjs(values.productionYear).format("YYYY-01-01")
        : undefined,
      purchaseDate: values.purchaseDate
        ? dayjs(values.purchaseDate).toISOString()
        : undefined,
      status: values.status as "IN_STOCK" | "SOLD" | "DAMAGED", // nên là IN_STOCK khi nhập kho
      // ❌ KHÔNG gửi warrantyStart / warrantyEnd ở bước nhập kho
    };

    await bulkCreate.mutateAsync(payload);
    form.resetFields();
    onClose();
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
        initialValues={{ quantity: 1, status: "IN_STOCK" }}
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
            <Select.Option value="IN_STOCK">Trong kho</Select.Option>
            <Select.Option value="SOLD">Đã bán</Select.Option>
            <Select.Option value="DAMAGED">Hư hỏng</Select.Option>
          </Select>
        </Form.Item>

        {/* ❌ Không có bảo hành, VIN hay ID – server tự sinh khi tạo */}
      </Form>
    </Modal>
  );
}
