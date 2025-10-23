import { useEffect, useState } from "react";
import {
  Table,
  InputNumber,
  Input,
  Tag,
  message,
  Typography,
  Skeleton,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { useGetVehiclePriceRules } from "../../service/vehiclePriceRuleService";
import api from "../../config/api";
import { Button } from "../../components/atoms/Button";

const { Text } = Typography;

interface VehiclePriceRule {
  vehicleStatus: string;
  multiplier: number;
  note: string;
}

export const VehiclePriceRulePage = () => {
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";
  const isAdmin = role === "ADMIN";

  const { data, isLoading, error } = useGetVehiclePriceRules();
  const [rules, setRules] = useState<VehiclePriceRule[]>([]);

  // ✅ Load data từ API
  useEffect(() => {
    if (data?.result && Array.isArray(data.result)) {
      setRules(data.result);
    }
  }, [data]);

  // ⚠️ Handle error fetch
  useEffect(() => {
    if (error) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        message.error("🔒 Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      } else if (err.response?.status === 403) {
        message.error("⛔ Bạn không có quyền truy cập trang này!");
      } else {
        message.error("❌ Không thể tải dữ liệu quy tắc giá!");
      }
    }
  }, [error]);

  // 💾 Lưu thay đổi
  const handleSave = async () => {
    if (!isAdmin) {
      message.warning("⛔ Chỉ Admin mới được chỉnh sửa quy tắc giá!");
      return;
    }

    try {
      await api.put("/vehicle-price-rules", rules);
      message.success("✅ Cập nhật quy tắc giá thành công!");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        message.error("🔒 Token không hợp lệ hoặc đã hết hạn!");
      } else if (status === 403) {
        message.error("⛔ Bạn không có quyền cập nhật!");
      } else if (status === 400) {
        message.error("⚠️ Dữ liệu không hợp lệ, vui lòng kiểm tra lại!");
      } else {
        message.error("❌ Lưu thất bại, vui lòng thử lại!");
      }
    }
  };

  // 🧩 Cập nhật rule
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

  // 🟩 Hiển thị trạng thái tiếng Việt
  const statusLabel = (status: string) => {
    switch (status) {
      case "NORMAL":
        return "Xe tiêu chuẩn";
      case "SPECIAL":
        return "Xe đặc biệt / trưng bày";
      case "OLD_STOCK":
        return "Xe tồn kho cũ";
      case "TEST_DRIVE":
        return "Xe lái thử";
      case "RESERVED":
        return "Xe được đặt trước";
      case "SOLD":
        return "Xe đã bán";
      default:
        return status;
    }
  };

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

  // 🟦 Hàm chọn màu tag cho role (4 loại)
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "green";
      case "EVM_STAFF":
        return "blue";
      case "DEALER_MANAGER":
        return "orange";
      case "DEALER_STAFF":
        return "purple";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<VehiclePriceRule> = [
    {
      title: "Trạng thái xe",
      dataIndex: "vehicleStatus",
      align: "center",
      render: (status: string) => (
        <Tag color={getTagColor(status)}>{statusLabel(status)}</Tag>
      ),
    },
    {
      title: "Hệ số nhân giá (Multiplier)",
      dataIndex: "multiplier",
      align: "center",
      render: (val: number, record: VehiclePriceRule) =>
        isAdmin ? (
          <InputNumber
            value={val}
            onChange={(v) =>
              handleChange(record.vehicleStatus, "multiplier", v)
            }
            style={{
              textAlign: "center",
              width: "80px",
            }}
          />
        ) : (
          <Text>{val}</Text>
        ),
    },
    {
      title: <div style={{ textAlign: "center" }}>Ghi chú</div>,
      dataIndex: "note",
      align: "center",
      render: (val: string, record: VehiclePriceRule) =>
        isAdmin ? (
          <Input.TextArea
            value={val}
            autoSize={{ minRows: 1, maxRows: 3 }}
            onChange={(e) =>
              handleChange(record.vehicleStatus, "note", e.target.value)
            }
            style={{
              borderRadius: 8,
              textAlign: "left",
              resize: "none",
              whiteSpace: "pre-wrap",
            }}
          />
        ) : (
          <Text style={{ whiteSpace: "pre-wrap" }}>{val}</Text>
        ),
    },
  ];

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      {/* ✅ Tiêu đề giống VehiclePage */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Quản lý quy tắc giá xe
      </h1>

      {/* ✅ Thẻ Role đồng bộ hoàn toàn */}
      <p className="text-gray-600 mb-6">
        <Tag
          color={getRoleColor(role)}
          className="text-base font-medium px-4 py-1"
        >
          {role}
        </Tag>
      </p>

      {/* ✅ Bảng nội dung */}
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <Table
            bordered
            dataSource={rules}
            pagination={false}
            rowKey="vehicleStatus"
            columns={columns}
            className="rounded-xl overflow-hidden"
            rowClassName="hover:bg-[#f1f3ef]"
          />

          {isAdmin && (
            <div className="flex justify-end mt-6">
              <Button
                type="primary"
                className="!bg-[var(--default-color)] !text-white hover:!bg-[#76885B] rounded-lg"
                onClick={handleSave}
              >
                💾 Lưu thay đổi
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
