import { Segmented } from "antd";

interface Props {
  counts: { all: number; active: number; upcoming: number; expired: number };
  defaultScope: "LOCAL" | "GLOBAL";
  onScopeChange: (s: "LOCAL" | "GLOBAL") => void;
}

export const PromotionFilterBar = ({
  counts,
  defaultScope,
  onScopeChange,
}: Props) => {
  const localLabel =
    defaultScope === "LOCAL" ? `Cục bộ (${counts.all})` : "Cục bộ";
  const globalLabel =
    defaultScope === "GLOBAL"
      ? `Toàn hệ thống (${counts.all})`
      : "Toàn hệ thống";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <Segmented
        options={[
          { label: localLabel, value: "LOCAL" },
          { label: globalLabel, value: "GLOBAL" },
        ]}
        value={defaultScope}
        onChange={(val) => onScopeChange(val as "LOCAL" | "GLOBAL")}
        className="bg-white border rounded-xl px-3 py-1 shadow-sm"
      />
    </div>
  );
};
