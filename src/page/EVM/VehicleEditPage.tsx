import { useNavigate, useParams } from "react-router-dom";
import { Card, message, Spin, Form, Button, Space, Modal } from "antd";
import {
  useGetVehicleById,
  useUpdateVehicle,
} from "../../service/vehicleService";
import { VehicleForm } from "../../components/molecules/evm/VehicleForm";
import type { IVehicle } from "../../model/Vehicle";
import { useEffect, useRef } from "react";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const VehicleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetVehicleById(id ?? "");
  const updateVehicle = useUpdateVehicle();
  const vehicle = data?.result;
  const [form] = Form.useForm<IVehicle>();
  const initialValuesRef = useRef<IVehicle | null>(null);

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  useEffect(() => {
    if (role !== "EVM_STAFF") {
      message.warning("Tài khoản của bạn không có quyền chỉnh sửa xe!");
      navigate(`/dashboard/evm/vehicle/${id}`, { replace: true });
    }
  }, [role, navigate, id]);

  useEffect(() => {
    if (vehicle) {
      form.setFieldsValue(vehicle);
      initialValuesRef.current = vehicle;
    }
  }, [vehicle, form]);

  const isFormChanged = (): boolean => {
    const current = form.getFieldsValue();
    const initial = initialValuesRef.current;
    if (!initial) return false;
    return JSON.stringify(current) !== JSON.stringify(initial);
  };

  const handleSave = async (values: IVehicle) => {
    if (!isFormChanged()) {
      message.warning("Không có thay đổi nào để lưu.");
      return;
    }

    try {
      await updateVehicle.mutateAsync({ id: id!, data: values });
      message.success("✅ Đã lưu thay đổi xe thành công!");
      navigate(`/dashboard/evm/vehicle/${id}`, { replace: true });
    } catch {
      message.error("❌ Không thể cập nhật xe!");
    }
  };

  const handleCancel = () => {
    if (!isFormChanged()) {
      navigate(`/dashboard/evm/vehicle/${id}`, { replace: true });
      return;
    }

    Modal.confirm({
      title: "Bạn có chắc muốn hủy chỉnh sửa?",
      content: "Mọi thay đổi chưa lưu sẽ bị mất.",
      okText: "Đồng ý",
      cancelText: "Tiếp tục chỉnh",
      onOk: () => navigate(`/dashboard/evm/vehicle/${id}`, { replace: true }),
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );

  if (!vehicle)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Card className="max-w-3xl w-full text-center shadow-md rounded-2xl">
          <p className="mb-4">Không tìm thấy xe.</p>
          <Button
            type="primary"
            onClick={() => navigate("/dashboard/evm/vehicle")}
          >
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );

  return (
    <div className="flex justify-center items-start min-h-[90vh] bg-gray-50 py-10">
      <Card
        title="Chỉnh sửa thông tin xe"
        className="w-full max-w-3xl shadow-md rounded-2xl"
      >
        <VehicleForm form={form} onFinish={handleSave} canEditPrices={false} />

        <div className="flex justify-end gap-3 mt-6">
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateVehicle.isPending}
            >
              Lưu thay đổi
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};
