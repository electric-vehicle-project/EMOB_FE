/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Empty,
  Typography,
  Divider,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useWatch } from "antd/es/form/Form";
import {
  useTestDriveDetailQuery,
  useFreeVehiclesQuery,
  useVehicleQuery,
  useUpdateTestDriveMutation,
} from "../../../service/testDriveService";
import { toast } from "react-toastify";

const { Title } = Typography;

interface Props {
  open: boolean;
  testDriveId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TestDriveEditModal = ({ open, testDriveId, onClose, onSuccess }: Props) => {
  const [form] = Form.useForm();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>();
  const [queryParams, setQueryParams] = useState<any>();

  const { data: detailData } = useTestDriveDetailQuery(testDriveId || undefined, {
    enabled: !!testDriveId && open,
  });
  const detail = detailData?.result;

  const { data: vehicles } = useVehicleQuery({}, { size: 100 });
  const { data: freeVehicles, refetch } = useFreeVehiclesQuery({}, queryParams);

  const { mutateAsync: updateTestDrive, isPending } = useUpdateTestDriveMutation();

  const modelOptions = (vehicles?.result?.data ?? []).map((v: any) => ({
    label: v.model,
    value: v.model,
  }));

  // Prefill data khi mở
  useEffect(() => {
    if (!detail) return;
    const sched = dayjs(detail.scheduledAt);
    form.setFieldsValue({
      location: detail.location,
      date: sched.startOf("day"),
      time: sched.format("HH:00"),
      duration: detail.duration,
      model: undefined,
    });
    setSelectedVehicleId(detail.testDriveVehicleUnitId);
  }, [detail, form]);

  const date = useWatch("date", form);
  const time = useWatch("time", form);
  const duration = useWatch("duration", form);
  const model = useWatch("model", form);
  const canSearch = !!date && !!time && !!duration && !!model;

  const handleFindFreeVehicles = async () => {
    if (!canSearch) return toast.warning("Vui lòng nhập đủ thông tin!");
    const params = {
      scheduledAt: `${date.format("YYYY-MM-DD")}T${time}`,
      duration,
      model,
    };
    setQueryParams(params);
    await refetch();
    toast.success("Tìm xe trống lịch thành công!");
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedVehicleId) return toast.warning("Vui lòng chọn xe lái thử!");
      await updateTestDrive({
        id: testDriveId!,
        data: {
          customerId: detail.customerId,
          testDriveVehicleId: selectedVehicleId,
          location: values.location,
          duration: Number(values.duration),
          scheduledAt: `${values.date.format("YYYY-MM-DD")}T${values.time}`,
        },
      });
      toast.success("Cập nhật lịch lái thử thành công!");
      onSuccess?.();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message;

      if (serverMsg === "Staff or vehicle is busy at this time") {
        toast.error("Nhân viên hoặc xe đã có lịch vào thời gian này!");
      } else if (serverMsg) {
        toast.error(`Lỗi từ máy chủ: ${serverMsg}`);
      } else {
        toast.error("Không thể tạo lịch lái thử, vui lòng thử lại sau!");
      }
    }
  };

  return (
    <Modal
      title={<Title level={4} style={{ color: "#627254", margin: 0 }}>Chỉnh sửa lịch lái thử</Title>}
      open={open}
      onCancel={onClose}
      onOk={handleUpdate}
      okText="Lưu thay đổi"
      confirmLoading={isPending}
      width={950}
      centered
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Địa điểm"
              name="location"
              rules={[{ required: true, message: "Vui lòng chọn địa điểm" }]}
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

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label="Ngày lái thử"
                  name="date"
                  rules={[{ required: true, message: "Chọn ngày lái thử" }]}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    style={{ width: "100%" }}
                    disabledDate={(d) => d.isBefore(dayjs(), "day")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Giờ bắt đầu"
                  name="time"
                  rules={[{ required: true, message: "Chọn giờ bắt đầu" }]}
                >
                  <Select
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
            </Row>

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

          <Col span={12} style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Row gutter={8} align="middle">
                <Col span={16}>
                  <Form.Item label="Model xe" name="model"
                    rules={[{ required: true, message: "Vui lòng chọn model xe" }]}>
                    <Select placeholder="Chọn model xe" options={modelOptions} showSearch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleFindFreeVehicles}
                    disabled={!canSearch}
                    block
                    style={{
                      height: 40,
                      backgroundColor: canSearch ? "#627254" : "#a0a0a0",
                      border: "none",
                      fontWeight: 500,
                    }}
                  >
                    Tìm xe trống lịch
                  </Button>
                </Col>
              </Row>

              <Divider className="my-3" />

              <div
                className="grid grid-cols-2 gap-3 overflow-y-auto pr-1"
                style={{ maxHeight: 360, minHeight: 360 }}
              >
                {freeVehicles?.result && freeVehicles.result.length > 0 ? (
                  freeVehicles.result.map((v: any) => (
                    <div
                      key={v.vehicleUnitId}
                      onClick={() => setSelectedVehicleId(v.vehicleUnitId)}
                      className={`border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${selectedVehicleId === v.vehicleUnitId
                        ? "border-[#627254] bg-[#f6ffed]"
                        : "border-gray-200 bg-white"
                        }`}
                    >
                      <div className="font-semibold text-[#627254]">{v.vinNumber}</div>
                      <div className="text-sm text-gray-600">{v.color}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Trạng thái: {v.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex items-center justify-center">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có xe khả dụng"
                    />
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};