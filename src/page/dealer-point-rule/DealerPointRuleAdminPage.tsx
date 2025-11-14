import { useMemo } from "react";
import { Spin } from "antd";
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

  const dealerOptions = useMemo(() => {
    const list = dealersData?.result?.data ?? dealersData?.data ?? [];
    return (list as { id: string; name: string }[]).map((d) => ({
      id: d.id,
      name: d.name,
    }));
  }, [dealersData]);

  const finalRules = useMemo(() => {
    const rules: IDealerPointRule[] = ruleData?.result ?? [];
    return rules.map((r) => ({
      ...r,
      dealerName:
        dealerOptions.find((d) => d.id === r.dealerId)?.name ||
        "Không xác định",
    }));
  }, [ruleData, dealerOptions]);

  const isLoading = loadingDealers || loadingRules;

  return (
    <CardWrapper>
      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Quy tắc tích điểm của các đại lý
      </h2>

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
