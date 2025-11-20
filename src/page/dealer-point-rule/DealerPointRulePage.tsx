import { useEffect, useMemo, useState } from "react";
import { Table, InputNumber, Tag, Skeleton, Empty, Form, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

import type {
  IDealerPointRule,
  DealerPointRuleRequest,
  MembershipLevel,
} from "../../model/DealerPointRule";
import {
  useDealerPointRuleList,
  useDealerPointRuleByDealerId,
} from "../../service/dealerPointRuleService";

import api from "../../config/api";
import { CardWrapper } from "../../components/template/CardWrapper";
import { Button } from "../../components/atoms/Button";
import { toast } from "react-toastify";

const GREEN = "#627254";
const GREEN_HOVER = "#525e46";

const LEVELS: MembershipLevel[] = [
  "NORMAL",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
];

const getLevelColor = (level: MembershipLevel): string => {
  switch (level) {
    case "NORMAL":
      return "green";
    case "BRONZE":
      return "volcano";
    case "SILVER":
      return "gray";
    case "GOLD":
      return "gold";
    case "PLATINUM":
      return "geekblue";
    default:
      return "default";
  }
};

const sortRules = (arr: IDealerPointRule[]) =>
  [...arr].sort((a, b) => a.membershipLevel.localeCompare(b.membershipLevel));

export const DealerPointRulePage = () => {
  const user = useSelector((s: RootState) => s.user);
  const role = user?.role ?? "";
  const dealerId = user?.dealerId ?? "";

  const isManager = role === "MANAGER";
  const isAdminOrStaff = role === "ADMIN" || role === "EVM_STAFF";

  // Query
  const { data: allRules, isLoading: loadingAll } = useDealerPointRuleList();
  const {
    data: dealerRules,
    isLoading: loadingDealer,
    refetch,
  } = useDealerPointRuleByDealerId(dealerId, { enabled: !!dealerId });

  // Chọn nguồn rules theo role
  const rulesSrc: IDealerPointRule[] = useMemo(() => {
    if (isAdminOrStaff) return allRules?.result ?? [];
    return dealerRules?.result ?? [];
  }, [isAdminOrStaff, allRules, dealerRules]);

  const isLoading = isAdminOrStaff ? loadingAll : loadingDealer;

  // State local + baseline để so dirty
  const [rules, setRules] = useState<IDealerPointRule[]>([]);
  const [baseline, setBaseline] = useState<IDealerPointRule[]>([]);
  const [saving, setSaving] = useState(false);

  // Modal tạo mới
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm<DealerPointRuleRequest>();

  useEffect(() => {
    if (rulesSrc && Array.isArray(rulesSrc)) {
      setRules(rulesSrc);
      setBaseline(rulesSrc);
    }
  }, [rulesSrc]);

  // Dirty check giống VehiclePriceRulePage
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(sortRules(rules)) !== JSON.stringify(sortRules(baseline))
    );
  }, [rules, baseline]);

  // Lưu toàn bộ (Manager only)
  const handleSave = async () => {
    if (!isManager) {
      toast.warning("Chỉ Manager được chỉnh sửa quy tắc điểm!");
      return;
    }
    if (!isDirty) return;

    // So sánh để thông báo
    const baseMap = new Map(baseline.map((r) => [r.membershipLevel, r]));
    let addedCount = 0;
    let changedMinPointsCount = 0;
    let changedPriceCount = 0;

    for (const r of rules) {
      const old = baseMap.get(r.membershipLevel);
      if (!old) {
        addedCount++;
        if (typeof r.minPoints === "number") changedMinPointsCount++;
        if (typeof r.price === "number") changedPriceCount++;
      } else {
        if ((old.minPoints ?? 0) !== (r.minPoints ?? 0))
          changedMinPointsCount++;
        if ((old.price ?? 0) !== (r.price ?? 0)) changedPriceCount++;
      }
    }

    const body: DealerPointRuleRequest[] = rules.map((r) => ({
      level: r.membershipLevel,
      dealerId: r.dealerId,
      minPoints: r.minPoints,
      price: r.price,
    }));

    try {
      setSaving(true);
      await api.put("/dealer-point-rules", body);

      if (addedCount > 0) {
        toast.success(`Đã thêm ${addedCount} quy tắc mới`);
      }
      if (changedMinPointsCount > 0) {
        toast.success(
          changedMinPointsCount === 1
            ? "Cập nhật điểm tối thiểu thành công (1 mục)"
            : `Cập nhật điểm tối thiểu thành công (${changedMinPointsCount} mục)`
        );
      }
      if (changedPriceCount > 0) {
        toast.success(
          changedPriceCount === 1
            ? "Cập nhật giá trị quy đổi thành công (1 mục)"
            : `Cập nhật giá trị quy đổi thành công (${changedPriceCount} mục)`
        );
      }
      if (
        addedCount === 0 &&
        changedMinPointsCount === 0 &&
        changedPriceCount === 0
      ) {
        toast.success("Cập nhật quy tắc điểm thành công!");
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
  const usedLevels = useMemo(
    () => new Set(rules.map((r) => r.membershipLevel)),
    [rules]
  );

  const creatableLevels = LEVELS.filter((l) => !usedLevels.has(l));

  const handleAddRule = async () => {
    try {
      const values = await form.validateFields();
      const newRule: IDealerPointRule = {
        membershipLevel: values.level as MembershipLevel,
        dealerId: dealerId, // Manager luôn gắn với 1 dealer
        minPoints: Number(values.minPoints),
        price: Number(values.price),
      };
      setRules((prev) => [...prev, newRule]);
      setShowModal(false);
      form.resetFields();
      toast.success("Đã thêm quy tắc. Nhấn 'Lưu thay đổi' để xác nhận!");
    } catch {
      // validate fail -> im lặng
    }
  };

  // Sửa inline
  const handleChange = (
    level: MembershipLevel,
    field: "minPoints" | "price",
    value: number | null
  ) => {
    setRules((prev) =>
      prev.map((r) =>
        r.membershipLevel === level ? { ...r, [field]: value ?? 0 } : r
      )
    );
  };

  const columns: ColumnsType<IDealerPointRule> = [
    {
      title: "Cấp độ",
      dataIndex: "membershipLevel",
      align: "center",
      render: (level: MembershipLevel) => (
        <Tag color={getLevelColor(level)} className="font-medium">
          {level}
        </Tag>
      ),
    },
    {
      title: "Điểm tối thiểu",
      dataIndex: "minPoints",
      align: "center",
      render: (val: number, record: IDealerPointRule) =>
        isManager ? (
          <InputNumber
            min={0}
            value={val}
            onChange={(v) =>
              handleChange(record.membershipLevel, "minPoints", v)
            }
          />
        ) : (
          val.toLocaleString("vi-VN")
        ),
    },
    {
      title: "Giá trị quy đổi (₫)",
      dataIndex: "price",
      align: "center",
      render: (val: number, record: IDealerPointRule) =>
        isManager ? (
          <InputNumber
            min={0}
            step={100}
            value={val}
            onChange={(v) => handleChange(record.membershipLevel, "price", v)}
          />
        ) : (
          `${val.toLocaleString("vi-VN")} ₫`
        ),
    },
  ];

  return (
    <CardWrapper
      title="Quy tắc tích điểm"
      subtitle="Quản lý quy đổi điểm theo cấp độ thành viên"
      variant="dashboard"
    >
      {/* Chỉ Manager mới được tạo / lưu */}
      {isManager && (
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : rules.length > 0 ? (
          <Table
            bordered
            pagination={false}
            rowKey="membershipLevel"
            dataSource={rules}
            columns={columns}
          />
        ) : (
          <div className="py-10 flex items-center justify-center">
            <Empty
              description={
                isManager
                  ? "Chưa có quy tắc điểm. Hãy tạo quy tắc đầu tiên."
                  : "Chưa có quy tắc điểm."
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>

      {/* Modal tạo mới – giống style VehiclePriceRulePage */}
      {isManager && showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-[460px] max-w-[92%]"
          >
            <h2 className="text-lg font-semibold mb-4 text-[#627254]">
              Tạo quy tắc tích điểm
            </h2>

            <Form form={form} layout="vertical">
              <Form.Item
                label="Cấp độ"
                name="level"
                rules={[{ required: true, message: "Chọn cấp độ!" }]}
              >
                <Select placeholder="Chọn cấp độ">
                  {creatableLevels.map((lv) => (
                    <Select.Option key={lv} value={lv}>
                      {lv}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Điểm tối thiểu"
                name="minPoints"
                rules={[
                  { required: true, message: "Nhập điểm tối thiểu!" },
                  {
                    validator: (_, v) =>
                      v === undefined || v === null || Number(v) < 0
                        ? Promise.reject("Điểm phải ≥ 0")
                        : Promise.resolve(),
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Giá trị quy đổi (₫)"
                name="price"
                rules={[
                  { required: true, message: "Nhập giá trị quy đổi!" },
                  {
                    validator: (_, v) =>
                      v === undefined || v === null || Number(v) < 0
                        ? Promise.reject("Giá trị phải ≥ 0")
                        : Promise.resolve(),
                  },
                ]}
              >
                <InputNumber min={0} step={100} style={{ width: "100%" }} />
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

export default DealerPointRulePage;
