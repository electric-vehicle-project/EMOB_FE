import { useNavigate, useParams } from "react-router-dom";
import { Card, message, Spin, Form, Button, Space, Modal } from "antd";
import {
  useGetVehicleById,
  useUpdateVehicle,
} from "../../service/vehicleService";
import { VehicleForm } from "../../components/molecules/EVM/VehicleForm";
import { normalizeInitialFileList } from "../../components/molecules/EVM/vehicleForm.utils";
import type { IVehicle } from "../../model/Vehicle";
import { useEffect, useRef } from "react";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { ROUTES } from "../../model/routePaths";
import { getRoleBasePath } from "../../utils/roleGuard";
import type { UploadFile } from "antd/es/upload";
import { uploadFiles } from "../../utils/uploadFile";
import { EditOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

export const VehicleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicle, isLoading } = useGetVehicleById(id ?? "", { enabled: !!id });
  const updateVehicle = useUpdateVehicle();
  const [form] = Form.useForm<IVehicle>();
  const initialValuesRef = useRef<IVehicle | null>(null);

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";
  const basePath = getRoleBasePath(user);

  useEffect(() => {
    if (role !== "EVM_STAFF") {
      toast.warning("Tài khoản của bạn không có quyền chỉnh sửa xe!");
      navigate(`${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(":id", id!), {
        replace: true,
      });
    }
  }, [role, navigate, id, basePath]);

  useEffect(() => {
    if (vehicle) {
      const withUploadList: IVehicle = {
        ...vehicle,
        images: normalizeInitialFileList(vehicle.images as string[]),
      } as unknown as IVehicle;
      form.setFieldsValue(withUploadList);
      initialValuesRef.current = withUploadList;
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
      toast.warning("Không có thay đổi nào để lưu.");
      return;
    }
    try {
      const fileList =
        (values.images as unknown as UploadFile[] | undefined) ?? [];
      const oldUrls =
        fileList
          .filter((f) => !!f.url && !f.originFileObj)
          .map((f) => String(f.url)) ?? [];
      const newFiles =
        fileList
          .filter((f) => f.originFileObj instanceof File)
          .map((f) => f.originFileObj as File) ?? [];
      const newUrls = await uploadFiles(newFiles);

      const payload: IVehicle = {
        ...values,
        images: [...oldUrls, ...newUrls],
      };

      await updateVehicle.mutateAsync({ id: id!, data: payload });
      toast.success("✅ Đã lưu thay đổi xe thành công!");

      navigate(`${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(":id", id!), {
        replace: true,
        state: { from: "edit" },
      });
    } catch {
      toast.error("❌ Không thể cập nhật xe!");
    }
  };

  const handleCancel = () => {
    if (!isFormChanged()) {
      navigate(`${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(":id", id!), {
        replace: true,
        state: { from: "edit" },
      });
      return;
    }
    Modal.confirm({
      title: "Bạn có chắc muốn hủy chỉnh sửa?",
      content: "Mọi thay đổi chưa lưu sẽ bị mất.",
      okText: "Đồng ý",
      cancelText: "Tiếp tục chỉnh",
      onOk: () =>
        navigate(
          `${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(":id", id!),
          { replace: true, state: { from: "edit" } }
        ),
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
        <Card className="max-w-3xl w/full text-center shadow-md rounded-2xl">
          <p className="mb-4">Không tìm thấy xe.</p>
          <Button
            type="primary"
            onClick={() => navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`)}
          >
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );

  return (
    <div className="flex justify-center items-start min-h-[90vh] bg-gray-50 py-10 px-4">
      <Card
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-[#627254]" />
            <span className="text-lg font-semibold">
              Chỉnh sửa thông tin xe
            </span>
          </div>
        }
        className="w-full max-w-4xl shadow-md rounded-2xl"
        styles={{ header: { borderBottom: "1px solid #f0f0f0" } }}
      >
        <VehicleForm form={form} onFinish={handleSave} canEditPrices={false} />

        <div className="flex justify-end gap-3 mt-6">
          <Space>
            <Button onClick={handleCancel} className="rounded-md">
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateVehicle.isPending}
              className="!bg-[#627254] !border-[#627254] hover:!bg-[#76885B] rounded-md"
            >
              Lưu thay đổi
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default VehicleEditPage;
