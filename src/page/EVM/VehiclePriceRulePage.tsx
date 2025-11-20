/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  InputNumber,
  Input,
  Tag,
  Typography,
  Skeleton,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useCurrentUser } from "../../utils/getCurrentUser";
import { useGetVehiclePriceRules } from "../../service/vehiclePriceRuleService";
import api from "../../config/api";

import { Button } from "../../components/atoms/Button";
import { CardWrapper } from "../../components/template/CardWrapper";

import { toast } from "react-toastify";

import type {
  VehiclePriceRule as Rule,
  VehicleStatus,
} from "../../model/VehiclePriceRule";
import {
  VEHICLE_STATUS_COLORS,
  VEHICLE_STATUS_LABELS,
} from "../../model/VehiclePriceRule";

import { CreateRuleModal } from "./CreateRuleModal";

const { Text } = Typography;

export const VehiclePriceRulePage = () => {
  const user = useCurrentUser();
  const isAdmin = (user as any)?.role === "ADMIN";

  const { data, isLoading, error, refetch } = useGetVehiclePriceRules();

  const [rules, setRules] = useState<Rule[]>([]);
  const [baseline, setBaseline] = useState<Rule[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const creatableStatuses: VehicleStatus[] = [
    "NORMAL",
    "SPECIAL",
    "TEST_DRIVE",
    "OLD_STOCK",
    "RESERVED",
  ];

  const normalizeRules = (incoming: unknown): Rule[] => {
    if (!Array.isArray(incoming)) return [];
    return incoming.filter(
      (item): item is Rule =>
        typeof item?.vehicleStatus === "string" &&
        typeof item?.multiplier === "number" &&
        typeof item?.note === "string"
    );
  };

  useEffect(() => {
    const next = normalizeRules(data?.result ?? data?.data);
    if (next.length) {
      setRules(next);
      setBaseline(next);
    } else {
      setRules([]);
      setBaseline([]);
    }
  }, [data]);

  useEffect(() => {
    if (error) toast.error("Không thể tải dữ liệu!");
  }, [error]);

  const sortRules = (arr: Rule[]) =>
    [...arr].sort((a, b) => a.vehicleStatus.localeCompare(b.vehicleStatus));

  const isDirty = useMemo(() => {
    return (
      JSON.stringify(sortRules(rules)) !== JSON.stringify(sortRules(baseline))
    );
  }, [rules, baseline]);

  const handleSave = async () => {
    if (!isAdmin) return toast.warning("Chỉ admin có quyền sửa!");
    if (!isDirty) return;

    try {
      setSaving(true);
      await api.put("/vehicle-price-rules", rules);
      toast.success("Đã lưu thay đổi!");
      setBaseline(rules);
      refetch?.();
    } catch {
      toast.error("Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    status: VehicleStatus,
    field: "multiplier" | "note",
    value: number | string | null
  ) => {
    setRules((prev) =>
      prev.map((r) =>
        r.vehicleStatus === status
          ? {
              ...r,
              [field]:
                field === "multiplier"
                  ? Number(value ?? r.multiplier)
                  : String(value ?? ""),
            }
          : r
      )
    );
  };

  const usedStatuses = useMemo(
    () => new Set<VehicleStatus>(rules.map((r) => r.vehicleStatus)),
    [rules]
  );

  const columns: ColumnsType<Rule> = [
    {
      title: "Trạng thái xe",
      dataIndex: "vehicleStatus",
      render: (status: VehicleStatus) => (
        <Tag
          color={VEHICLE_STATUS_COLORS[status]}
          className="rounded-full px-4 py-1 text-sm"
        >
          {VEHICLE_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: "Hệ số giá",
      dataIndex: "multiplier",
      width: 180,
      render: (val: Rule["multiplier"], rec: Rule) =>
        isAdmin ? (
          <InputNumber
            value={val}
            min={0}
            step={0.1}
            onChange={(v) => handleChange(rec.vehicleStatus, "multiplier", v)}
            className="rounded-full w-full text-center"
          />
        ) : (
          <Text>{val}</Text>
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      render: (val: Rule["note"], rec: Rule) =>
        isAdmin ? (
          <Input.TextArea
            value={val}
            autoSize={{ minRows: 1, maxRows: 3 }}
            onChange={(e) =>
              handleChange(rec.vehicleStatus, "note", e.target.value)
            }
            className="rounded-xl"
          />
        ) : (
          <Text>{val}</Text>
        ),
    },
  ];

  return (
    <CardWrapper
      title="Quy tắc giá xe"
      subtitle="Quản lý hệ số giá theo trạng thái"
      variant="dashboard"
    >
      {isAdmin && (
        <div className="flex justify-end gap-3 mb-4">
          <Button
            type="default"
            onClick={() => setShowCreate(true)}
            className="rounded-full px-5"
          >
            Tạo quy tắc mới
          </Button>

          <Button
            type="primary"
            loading={saving}
            disabled={!isDirty}
            onClick={handleSave}
            className="rounded-full px-6"
          >
            Lưu thay đổi
          </Button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border">
        {isLoading ? (
          <div className="p-4">
            <Skeleton active />
          </div>
        ) : rules.length ? (
          <Table
            rowKey="vehicleStatus"
            dataSource={rules}
            columns={columns}
            pagination={false}
            bordered
            className="rounded-2xl overflow-hidden"
          />
        ) : (
          <div className="py-10 flex justify-center">
            <Empty description="Chưa có quy tắc giá" />
          </div>
        )}
      </div>

      <CreateRuleModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        usedStatuses={usedStatuses}
        creatableStatuses={creatableStatuses}
        onSubmit={(values) => {
          setRules((prev) => [
            ...prev,
            {
              vehicleStatus: values.vehicleStatus,
              multiplier: Number(values.multiplier),
              note: values.note || "",
            },
          ]);
          toast.success("Đã thêm quy tắc. Nhấn 'Lưu' để xác nhận.");
        }}
      />
    </CardWrapper>
  );
};

export default VehiclePriceRulePage;
