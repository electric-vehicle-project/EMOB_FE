import { useMemo, useState } from "react";
import { Spin, Select } from "antd";
import { useDealersQuery } from "../../service/dealerService";
import { useDealerPointRuleList } from "../../service/dealerPointRuleService";
import { CardWrapper } from "../../components/template/CardWrapper";
import { DealerPointRuleAdminTable } from "../../components/organisms/dealerPointRule/DealerPointRuleAdminTable";
import type { IDealerPointRule } from "../../model/DealerPointRule";

export const DealerPointRuleAdminPage: React.FC = () => {
  const { data: dealersData, isLoading: loadingDealers } = useDealersQuery(
    {},
    { size: 1000 }
  );

  const { data: ruleData, isLoading: loadingRules } = useDealerPointRuleList();

  /** ===========================
   *  MAP DEALER LIST
   *  =========================== */
  const dealerOptions = useMemo(() => {
    const list = dealersData?.result?.data ?? dealersData?.data ?? [];
    return (list as { id: string; name: string }[]).map((d) => ({
      id: d.id,
      name: d.name,
    }));
  }, [dealersData]);

  /** ===========================
   *  LOCAL FILTER STATE
   *  =========================== */
  const [filterDealerId, setFilterDealerId] = useState<string | undefined>(
    undefined
  );

  /** ===========================
   *  APPLY LOCAL FILTER
   *  =========================== */
  const finalRules = useMemo(() => {
    const rules: IDealerPointRule[] = ruleData?.result ?? [];

    const mapped = rules.map((r) => ({
      ...r,
      dealerName:
        dealerOptions.find((d) => d.id === r.dealerId)?.name ||
        "Không xác định",
    }));

    // lọc theo dealerId
    if (filterDealerId) {
      return mapped.filter((r) => r.dealerId === filterDealerId);
    }

    return mapped;
  }, [ruleData, dealerOptions, filterDealerId]);

  const isLoading = loadingDealers || loadingRules;

  return (
    <CardWrapper>
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Quy tắc tích điểm của các đại lý
        </h2>

        {/* FILTER DEALER */}
        <Select
          allowClear
          placeholder="Lọc theo đại lý"
          className="w-64"
          value={filterDealerId}
          onChange={(v) => setFilterDealerId(v || undefined)}
          options={dealerOptions.map((d) => ({
            label: d.name,
            value: d.id,
          }))}
        />
      </div>

      {/* TABLE */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <DealerPointRuleAdminTable data={finalRules} loading={isLoading} />
      )}
    </CardWrapper>
  );
};

export default DealerPointRuleAdminPage;
