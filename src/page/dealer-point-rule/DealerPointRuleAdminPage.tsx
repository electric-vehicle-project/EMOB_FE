import { useMemo, useState } from "react";
import { Button, Select, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useDealersQuery } from "../../service/dealerService";
import { useDealerPointRuleList } from "../../service/dealerPointRuleService";
import { CardWrapper } from "../../components/template/CardWrapper";
import { DealerPointRuleAdminTable } from "../../components/organisms/dealerPointRule/DealerPointRuleAdminTable";
import type { IDealerPointRule } from "../../model/DealerPointRule";

export const DealerPointRuleAdminPage: React.FC = () => {
  const [selectedDealer, setSelectedDealer] = useState<string | undefined>();

  const { data: dealersData, isLoading: loadingDealers } = useDealersQuery(
    {},
    { size: 1000 }
  );

  const dealerOptions = useMemo(() => {
    const list = dealersData?.result?.data ?? dealersData?.data ?? [];
    return (list as { id: string; name: string }[]).map((d) => ({
      label: d.name,
      value: d.id,
    }));
  }, [dealersData]);

  const {
    data: allRules,
    isLoading: loadingAll,
    refetch: refetchAll,
  } = useDealerPointRuleList();

  // ✅ Lọc rule theo đại lý (nếu có chọn) – thêm type cho r
  const filteredRules: IDealerPointRule[] = useMemo(() => {
    if (!selectedDealer) return allRules?.result ?? [];
    return (allRules?.result ?? []).filter(
      (r: IDealerPointRule) => r.dealerId === selectedDealer
    );
  }, [allRules, selectedDealer]);

  const isLoading = loadingAll || loadingDealers;

  const handleReload = () => {
    refetchAll();
  };

  return (
    <CardWrapper>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-[#627254]">
          Quy tắc tích điểm của các đại lý
        </h2>

        <div className="flex flex-wrap gap-3">
          <Select
            allowClear
            showSearch
            loading={loadingDealers}
            placeholder="Chọn đại lý để lọc..."
            options={dealerOptions}
            value={selectedDealer}
            onChange={(v) => setSelectedDealer(v || undefined)}
            style={{ width: 320 }}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={handleReload}
            type="primary"
            className="!bg-[#627254] hover:!bg-[#4f6f52] text-white"
          >
            Tải lại
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <DealerPointRuleAdminTable
          data={(filteredRules ?? []).map((r) => {
            const dealerName =
              dealerOptions.find((opt) => opt.value === r.dealerId)?.label ??
              "Không xác định";
            return { ...r, dealerName };
          })}
          loading={isLoading}
        />
      )}
    </CardWrapper>
  );
};

export default DealerPointRuleAdminPage;
