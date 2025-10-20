import { useEffect, useState } from "react";
import {
  Card,
  Table,
  InputNumber,
  Input,
  Tag,
  Button,
  message,
  Space,
  Typography,
  Skeleton,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../utils/getCurrentUser";
import {
  useGetVehiclePriceRules,
  usePutVehiclePriceRules,
} from "../../service/vehiclePriceRuleService";

const { Text } = Typography;

interface VehiclePriceRule {
  vehicleStatus: string;
  multiplier: number;
  note: string;
}

export const VehiclePriceRulePage = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";
  const isAdmin = role === "ADMIN";

  // 🧩 Gọi API hooks
  const { data, isLoading, error } = useGetVehiclePriceRules();
  const updateRules = usePutVehiclePriceRules();

  const [rules, setRules] = useState<VehiclePriceRule[]>([]);
  const [basePrice, setBasePrice] = useState(500_000_000);

  // ✅ Đồng bộ dữ liệu khi fetch xong
  useEffect(() => {
    if (data?.result && Array.isArray(data.result)) {
      setRules(data.result);
    } else {
      // Nếu chưa có dữ liệu thì hiển thị bộ mặc định
      setRules([
        { vehicleStatus: "NORMAL", multiplier: 1.0, note: "Xe tiêu chuẩn" },
        {
          vehicleStatus: "SPECIAL",
          multiplier: 1.2,
          note: "Xe trưng bày / đặc biệt",
        },
        { vehicleStatus: "OLD_STOCK", multiplier: 0.8, note: "Xe tồn kho cũ" },
        { vehicleStatus: "TEST_DRIVE", multiplier: 0.9, note: "Xe lái thử" },
        { vehicleStatus: "RESERVED", multiplier: 1.0, note: "Xe được đặt" },
        { vehicleStatus: "SOLD", multiplier: 1.0, note: "Xe đã bán" },
      ]);
    }
  }, [data]);

  // ⚠️ Nếu lỗi 400 hoặc 403
  useEffect(() => {
    if (error) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 403) {
        message.error("⛔ Bạn không có quyền truy cập trang này!");
      } else {
        message.error("❌ Không thể tải dữ liệu Price Rules!");
      }
    }
  }, [error]);

  // 💾 PUT cập nhật rule (Admin-only)
  const handleSave = async () => {
    if (!isAdmin) {
      message.warning("⛔ Chỉ Admin mới được chỉnh sửa quy tắc giá!");
      return;
    }

    try {
      console.log("🔹 Sending rules:", rules);
      await updateRules.mutateAsync(rules);
      message.success("✅ Cập nhật quy tắc giá thành công!");
    } catch (err: unknown) {
      console.error("❌ PUT /vehicle-price-rules failed:", err);
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 400) {
        message.error("⚠️ Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!");
      } else if (axiosErr?.response?.status === 403) {
        message.error("⛔ Bạn không có quyền cập nhật!");
      } else {
        message.error("❌ Lưu thất bại, vui lòng thử lại!");
      }
    }
  };

  // 🧮 Xử lý khi thay đổi multiplier / note
  const handleChange = (
    status: string,
    field: keyof VehiclePriceRule,
    value: string | number | null
  ) => {
    setRules((prev) =>
      prev.map((r) =>
        r.vehicleStatus === status ? { ...r, [field]: value ?? "" } : r
      )
    );
  };

  // 🎨 Màu tag cho từng trạng thái
  const getTagColor = (status: string) => {
    switch (status) {
      case "NORMAL":
        return "green";
      case "SPECIAL":
        return "purple";
      case "OLD_STOCK":
        return "orange";
      case "TEST_DRIVE":
        return "blue";
      case "RESERVED":
        return "gold";
      case "SOLD":
        return "red";
      default:
        return "default";
    }
  };

  const formatPrice = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // 🧾 Cấu hình Table
  const columns = [
    {
      title: "Trạng thái xe",
      dataIndex: "vehicleStatus",
      render: (status: string) => (
        <Tag color={getTagColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Hệ số nhân (Multiplier)",
      dataIndex: "multiplier",
      render: (val: number, record: VehiclePriceRule) =>
        isAdmin ? (
          <InputNumber
            min={0.1}
            max={5}
            step={0.1}
            value={val}
            onChange={(v) =>
              handleChange(record.vehicleStatus, "multiplier", v)
            }
          />
        ) : (
          <Text>{val}</Text>
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      render: (val: string, record: VehiclePriceRule) =>
        isAdmin ? (
          <Input
            value={val}
            onChange={(e) =>
              handleChange(record.vehicleStatus, "note", e.target.value)
            }
          />
        ) : (
          <Text>{val}</Text>
        ),
    },
    {
      title: "Giá thực tế (Base × Multiplier)",
      key: "price",
      render: (_: unknown, record: VehiclePriceRule) => (
        <Text strong className="text-[#627254]">
          {formatPrice(basePrice * record.multiplier)}
        </Text>
      ),
    },
  ];

  return (
    <div className="flex justify-center min-h-[85vh] bg-gray-50 py-8 px-4">
      <Card
        bordered={false}
        className="w-full max-w-6xl shadow-md rounded-2xl p-6"
        title={
          <div className="flex justify-between items-center">
            <Text strong className="text-lg">
              ⚙️ Vehicle Price Rule Management
            </Text>
            <Button onClick={() => navigate(-1)}>Quay lại</Button>
          </div>
        }
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Space>
                <Text strong>Giá cơ bản:</Text>
                <InputNumber
                  min={10_000_000}
                  step={10_000_000}
                  style={{ width: 180 }}
                  value={basePrice}
                  onChange={(v) => setBasePrice(v ?? 0)}
                  disabled={!isAdmin}
                  formatter={(v) =>
                    `${Number(v || 0).toLocaleString("vi-VN")} ₫`
                  }
                />
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={rules}
              pagination={false}
              rowKey="vehicleStatus"
              bordered
            />

            {isAdmin && (
              <Space className="w-full flex justify-end mt-6">
                <Button
                  type="primary"
                  className="bg-[#627254] hover:bg-[#76885B] text-white"
                  onClick={handleSave}
                  loading={updateRules.isPending}
                >
                  💾 Lưu thay đổi
                </Button>
              </Space>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
