
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Modal, Form, Select, DatePicker, Button, Row, Col, Divider,
  Avatar, Typography, Tag, Empty
} from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import {
  useCreateTestDriveMutation,
  useFreeVehiclesQuery,
} from "../../../service/testDriveService";
import { useWatch } from "antd/es/form/Form";
import { toast } from "react-toastify";
import { useCustomerList } from "../../../service/customerService";
import { useGetVehicles } from "../../../service/vehicleService";

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TestDriveCreateModal = ({ open, onClose, onSuccess }: Props) => {
  const [form] = Form.useForm();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>();
  const [customerInfo, setCustomerInfo] = useState<any>();
  const [queryParams, setQueryParams] = useState<any>();
  const [searched, setSearched] = useState(false); // NEW

  // Hooks
  const { data: customers } = useCustomerList({ size: 100 });
  const { data: vehicles } = useGetVehicles({}, { size: 100 });
  const { mutateAsync: createTestDrive, isPending } = useCreateTestDriveMutation();
  const { data: freeVehicles, refetch, isFetching } = useFreeVehiclesQuery({}, queryParams || {});

  const customersRaw = customers?.result?.data ?? [];
  const vehiclesRaw = vehicles?.result?.data ?? [];

  const date = useWatch("date", form);
  const time = useWatch("time", form);
  const duration = useWatch("duration", form);
  const model = useWatch("model", form);
  const canSearch = !!date && !!time && !!duration && !!model;

  const customerOptions = customersRaw.map((c: any) => ({
    label: `${c.fullName} — ${c.phoneNumber}`,
    value: c.id,
    data: c,
  }));
  const modelOptions = vehiclesRaw.map((v: any) => ({ label: v.model, value: v.model }));

  const handleCustomerChange = (_: any, option: any) => setCustomerInfo(option?.data);

  const handleFindFreeVehicles = async () => {
    if (!canSearch) return toast.warning("Vui lòng nhập đủ thông tin cần thiết!");
    setSelectedVehicleId(undefined);
    setSearched(true); // NEW: đánh dấu đã tìm
    setQueryParams({
      scheduledAt: `${date.format("YYYY-MM-DD")}T${time}`,
      duration,
      model,
    });
    await refetch();
    toast.success("Tìm xe trống thành công!");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedVehicleId) return toast.warning("Vui lòng chọn xe lái thử!");
      await createTestDrive({
        customerId: values.customerId,
        testDriveVehicleId: selectedVehicleId,
        location: values.location,
        duration: Number(values.duration),
        scheduledAt: `${values.date.format("YYYY-MM-DD")}T${values.time}`,
      });
      toast.success("Tạo lịch lái thử thành công!");
      form.resetFields();
      setSelectedVehicleId(undefined);
      setCustomerInfo(null);
      setSearched(false);
      onSuccess();
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


  const timeOptions = [
    "08:00",
    "10:00",
    "12:00",
    "14:00",
    "16:00",
  ].map((t) => {
    // Nếu chưa chọn ngày → tất cả enabled
    if (!date) return { label: t, value: t };

    const now = dayjs();
    const selectedDate = dayjs(date);

    // Nếu ngày lớn hơn hôm nay → enable hết
    if (selectedDate.isAfter(now, "day")) {
      return { label: t, value: t };
    }

    // Nếu ngày hôm nay → disable những giờ đã trôi qua
    if (selectedDate.isSame(now, "day")) {
      const hour = dayjs(`${selectedDate.format("YYYY-MM-DD")} ${t}`);
      return {
        label: t,
        value: t,
        disabled: hour.isBefore(now),
      };
    }

    // Nếu ngày trong quá khứ → disable toàn bộ (optional)
    return { label: t, value: t, disabled: true };
  });
  // Chuẩn bị list xe (API trả về result là ARRAY)
  const freeList: any[] = Array.isArray(freeVehicles?.result) ? freeVehicles!.result : [];

  return (
    <Modal
      title={<Title level={4} style={{ color: "#627254", margin: 0 }}>Tạo lịch lái thử mới</Title>}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={isPending}
      width={1050}
      centered
    >
      <Form layout="vertical" form={form}>
        <Row gutter={24} align="top" style={{ display: "flex" }}>
          {/* LEFT */}
          <Col span={12} style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
            <div style={{ flex: 1 }}>
              <Form.Item label="Khách hàng" name="customerId"
                rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}>
                <Select placeholder="Chọn khách hàng"
                  options={customerOptions}
                  onChange={handleCustomerChange}
                  showSearch
                  filterOption={(i, o) => o?.label?.toLowerCase().includes(i.toLowerCase())} />
              </Form.Item>

              <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-[#f9f9f9] min-h-[120px] flex items-center">
                {customerInfo ? (
                  <>
                    <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: "#627254" }} />
                    <div className="ml-10">
                      <Text strong style={{ fontSize: 16 }}>{customerInfo.fullName}</Text>


                      <div className="text-gray-600 flex flex-col mt-1 mb-2">
                        <span>{customerInfo.phoneNumber}</span>
                        <span>{customerInfo.email}</span>
                      </div>
                      <Tag color="green" className="mt-1">Member Ship Level: {customerInfo.memberShipLevel || "NORMAL"}</Tag>
                    </div>

                  </>
                ) : (
                  <div className="flex items-center justify-center w-full text-gray-400 italic">
                    Chưa chọn khách hàng
                  </div>
                )}
              </div>

              <Form.Item label="Địa điểm" name="location"
                rules={[{ required: true, message: "Vui lòng chọn địa điểm" }]}>
                <Select placeholder="Chọn địa điểm" options={[
                  { label: "EV Showroom District 9", value: "EV Showroom District 9" },
                  { label: "EV Showroom Bến Thành", value: "EV Showroom Bến Thành" },
                  { label: "EV Showroom Thủ Đức", value: "EV Showroom Thủ Đức" },
                ]} />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Ngày lái thử" name="date"
                    rules={[{ required: true, message: "Chọn ngày lái thử" }]}>
                    <DatePicker disabledDate={(d) => d.isBefore(dayjs(), "day")}
                      style={{ width: "100%" }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Giờ bắt đầu"
                    name="time"
                    rules={[
                      { required: true, message: "Chọn giờ bắt đầu" },
                      // VALIDATOR: cấm thời điểm quá khứ
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value) return Promise.resolve();

                          const selectedDate = getFieldValue("date");
                          if (!selectedDate) return Promise.resolve();

                          const now = dayjs();
                          const scheduled = dayjs(
                            `${selectedDate.format("YYYY-MM-DD")} ${value}`,
                            "YYYY-MM-DD HH:mm"
                          );

                          if (scheduled.isBefore(now)) {
                            return Promise.reject(
                              new Error("Không thể đặt lịch trước thời điểm hiện tại")
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Select placeholder="Chọn giờ" options={timeOptions} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Thời lượng (phút)" name="duration"
                rules={[{ required: true, message: "Chọn thời lượng lái thử" }]}>
                <Select placeholder="Thời lượng" options={[
                  { label: "60", value: 60 },
                  { label: "90", value: 90 },
                ]} />
              </Form.Item>
            </div>
          </Col>

          {/* RIGHT */}
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
                    disabled={!canSearch || isFetching}
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

              {/* Khu vực danh sách xe – chiều cao cố định, 2 cột luôn bằng nhau */}
              <div
                className="grid grid-cols-2 gap-3"
                style={{ flex: 1, minHeight: 340, maxHeight: 340, overflowY: "auto", paddingRight: 4 }}
              >
                {searched ? (
                  freeList.length > 0 ? (
                    freeList.map((v: any) => (
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
                        <div className="text-xs text-gray-400 mt-1">Tình trạng: {v.status}</div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-gray-400 italic text-center py-5">
                      <Empty
                        description="Không có xe khả dụng trong khung giờ này"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )
                ) : (
                  <div className="col-span-2 text-gray-400 italic text-center py-5">
                    <Empty
                      description="Chưa có xe khả dụng"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
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