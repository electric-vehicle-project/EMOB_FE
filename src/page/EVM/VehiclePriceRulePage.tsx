// EMOB-2025 - Vehicle Price Rule Page (Admin editable, Custom Modal)
// Tham khảo UI/UX Dealer page, đồng bộ màu & layout, thông báo theo loại thay đổi

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  InputNumber,
  Input,
  Tag,
  Typography,
  Skeleton,
  Form,
  Select,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { motion } from "framer-motion";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { useGetVehiclePriceRules } from "../../service/vehiclePriceRuleService";
import api from "../../config/api";
import { Button } from "../../components/atoms/Button";
import { CardWrapper } from "../../components/template/CardWrapper";

import type {
  VehiclePriceRule as Rule,
  VehicleStatus,
} from "../../model/VehiclePriceRule";
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_COLORS,
} from "../../model/VehiclePriceRule";
import { toast } from "react-toastify";

const { Text } = Typography;

const GREEN = "#627254";
const GREEN_HOVER = "#525e46";

const sortRules = (arr: Rule[]) =>
  [...arr].sort((a, b) => a.vehicleStatus.localeCompare(b.vehicleStatus));

export const VehiclePriceRulePage = () => {
  // Role: mọi role xem được; chỉ ADMIN được tạo/sửa
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "";
  const isAdmin = role === "ADMIN";

  // Query & state
  const { data, isLoading, error, refetch } = useGetVehiclePriceRules();
  const [rules, setRules] = useState<Rule[]>([]);
  const [baseline, setBaseline] = useState<Rule[]>([]);
  const [saving, setSaving] = useState(false);

  // Modal tạo mới
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  // Trạng thái cho phép tạo (loại SOLD ra)
  const creatableStatuses: VehicleStatus[] = [
    "NORMAL",
    "SPECIAL",
    "TEST_DRIVE",
    "OLD_STOCK",
    "RESERVED",
  ];

  // Load data
  useEffect(() => {
    if (data?.result && Array.isArray(data.result)) {
      const res = data.result as Rule[];
      setRules(res);
      setBaseline(res);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error("Không thể tải quy tắc giá. Vui lòng thử lại!");
    }
  }, [error]);

  // Dirty check để disable nút Lưu khi không có thay đổi
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(sortRules(rules)) !== JSON.stringify(sortRules(baseline))
    );
  }, [rules, baseline]);

  // PUT cập nhật (Admin only)
  const handleSave = async () => {
    if (!isAdmin) {
      toast.warning("Chỉ Admin được chỉnh sửa!");
      return;
    }
    if (!isDirty) return;

    // So sánh trước khi lưu để biết thay đổi gì
    const baseMap = new Map(baseline.map((r) => [r.vehicleStatus, r]));
    let addedCount = 0;
    let changedMultiplierCount = 0;
    let changedNoteCount = 0;

    for (const r of rules) {
      const old = baseMap.get(r.vehicleStatus);
      if (!old) {
        addedCount++;
        // coi thêm mới như thay đổi cả giá & ghi chú nếu muốn show chi tiết
        if (typeof r.multiplier === "number") changedMultiplierCount++;
        if ((r.note ?? "") !== "") changedNoteCount++;
      } else {
        if ((old.multiplier ?? 0) !== (r.multiplier ?? 0))
          changedMultiplierCount++;
        if ((old.note ?? "") !== (r.note ?? "")) changedNoteCount++;
      }
    }

    try {
      setSaving(true);
      await api.put("/vehicle-price-rules", rules); // Body là mảng Rule theo Swagger

      // Thông báo theo loại thay đổi
      if (addedCount > 0) {
        toast.success(`Đã thêm ${addedCount} quy tắc mới`);
      }
      if (changedMultiplierCount > 0) {
        toast.success(
          changedNoteCount > 0 && changedMultiplierCount === 1
            ? "Sửa giá thành công (1 mục)"
            : `Sửa giá thành công (${changedMultiplierCount} mục)`
        );
      }
      if (changedNoteCount > 0) {
        toast.success(
          changedNoteCount === 1
            ? "Sửa ghi chú thành công (1 mục)"
            : `Sửa ghi chú thành công (${changedNoteCount} mục)`
        );
      }
      // Trường hợp chỉ reorder hoặc thay đổi không bắt được (hiếm)
      if (
        addedCount === 0 &&
        changedMultiplierCount === 0 &&
        changedNoteCount === 0
      ) {
        toast.success("Cập nhật quy tắc giá thành công!");
      }

      setBaseline(rules);
      refetch?.();
    } catch {
      toast.error("Lưu thất bại! Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // Thêm rule mới (local), cần Lưu để đẩy BE
  const handleAddRule = async () => {
    try {
      const values = await form.validateFields();
      const newRule: Rule = {
        vehicleStatus: values.vehicleStatus as VehicleStatus,
        multiplier: Number(values.multiplier),
        note: values.note ?? "",
      };
      setRules((prev) => [...prev, newRule]);
      setShowModal(false);
      form.resetFields();
      toast.success("Đã thêm quy tắc. Nhấn 'Lưu thay đổi' để xác nhận!");
    } catch {
      // validate fail -> im lặng
    }
  };

  // Sửa multiplier/note inline
  const handleChange = (
    status: VehicleStatus,
    field: keyof Pick<Rule, "multiplier" | "note">,
    value: number | string | null
  ) => {
    setRules((prev) =>
      prev.map((r) =>
        r.vehicleStatus === status
          ? field === "multiplier"
            ? {
                ...r,
                multiplier:
                  typeof value === "number"
                    ? value
                    : Number(String(value ?? r.multiplier)),
              }
            : { ...r, note: (value ?? "") as string }
          : r
      )
    );
  };

  const usedStatuses = useMemo(
    () => new Set(rules.map((r) => r.vehicleStatus)),
    [rules]
  );

  const columns: ColumnsType<Rule> = [
    {
      title: "Trạng thái xe",
      dataIndex: "vehicleStatus",
      align: "center",
      render: (status: VehicleStatus) => (
        <Tag color={VEHICLE_STATUS_COLORS[status]}>
          {VEHICLE_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: "Hệ số nhân giá",
      dataIndex: "multiplier",
      align: "center",
      render: (val: number, record: Rule) =>
        isAdmin ? (
          <InputNumber
            value={val}
            min={0}
            step={0.1}
            onChange={(v) =>
              handleChange(record.vehicleStatus, "multiplier", v)
            }
            style={{ textAlign: "center", width: 112 }}
          />
        ) : (
          <Text>{val}</Text>
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      align: "center",
      render: (val: string, record: Rule) =>
        isAdmin ? (
          <Input.TextArea
            value={val}
            autoSize={{ minRows: 1, maxRows: 3 }}
            onChange={(e) =>
              handleChange(record.vehicleStatus, "note", e.target.value)
            }
          />
        ) : (
          <Text style={{ whiteSpace: "pre-wrap" }}>{val}</Text>
        ),
    },
  ];

  return (
    <CardWrapper
      title="Quản lý quy tắc giá xe"
      subtitle="Xem và điều chỉnh hệ số nhân giá theo trạng thái xe"
      variant="dashboard"
    >
      {/* Action bar: căn phải, màu đồng bộ với các controller khác */}
      {isAdmin && (
        <div className="flex justify-end items-center mb-3 gap-3">
          <Button
            type="default"
            onClick={() => setShowModal(true)}
            className={`border-[${GREEN}] text-[${GREEN}] hover:!bg-[${GREEN}] hover:!text-white`}
          >
            Tạo quy tắc mới
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={!isDirty}
            loading={saving}
            className={`!bg-[${GREEN}] hover:!bg-[${GREEN_HOVER}] !text-white border-none`}
          >
            Lưu thay đổi
          </Button>
        </div>
      )}

      {/* Container table: nền trắng bo góc + viền mảnh */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : rules.length > 0 ? (
          <Table
            bordered
            pagination={false}
            rowKey="vehicleStatus"
            dataSource={rules}
            columns={columns}
          />
        ) : (
          <div className="py-10 flex items-center justify-center">
            <Empty
              description={
                isAdmin
                  ? "Chưa có quy tắc giá. Hãy tạo quy tắc đầu tiên."
                  : "Chưa có quy tắc giá."
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>

      {/* Modal tạo mới */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-[460px] max-w-[92%]"
          >
            <h2 className="text-lg font-semibold mb-4 text-[#627254]">
              Tạo quy tắc giá
            </h2>

            <Form form={form} layout="vertical">
              <Form.Item
                label="Thể loại xe"
                name="vehicleStatus"
                rules={[{ required: true, message: "Chọn thể loại xe!" }]}
              >
                <Select placeholder="Chọn thể loại xe">
                  {creatableStatuses
                    .filter((s) => !usedStatuses.has(s))
                    .map((s) => (
                      <Select.Option key={s} value={s}>
                        {VEHICLE_STATUS_LABELS[s]}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Hệ số nhân giá"
                name="multiplier"
                rules={[
                  { required: true, message: "Nhập hệ số nhân!" },
                  {
                    validator: (_, v) =>
                      v === undefined || v === null || Number(v) < 0
                        ? Promise.reject("Hệ số phải ≥ 0")
                        : Promise.resolve(),
                  },
                ]}
              >
                <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Ghi chú" name="note">
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
            </Form>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="default"
                onClick={() => setShowModal(false)}
                className={`border-[${GREEN}] text-[${GREEN}] hover:!bg-[${GREEN}] hover:!text-white`}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleAddRule}
                className={`!bg-[${GREEN}] hover:!bg-[${GREEN_HOVER}] !text-white border-none`}
              >
                Thêm
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </CardWrapper>
  );
};

export default VehiclePriceRulePage;
