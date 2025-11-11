import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { mapToSelectOptions } from "../../../utils/mapToSelectOptions";
import type { IReport } from "../../../model/Report";

interface Props {
  keyword: string;
  setKeyword: (val: string) => void;
  status?: IReport["status"];
  setStatus: (val?: IReport["status"]) => void;
}

const STATUS_OPTIONS = mapToSelectOptions(
  [
    { label: "All", value: undefined },
    { label: "Pending", value: "PENDING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "Deleted", value: "DELETED" },
  ],
  "label",
  "value"
);

export const ReportFilterBar = ({
  keyword,
  setKeyword,
  status,
  setStatus,
}: Props) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <Space className="w-full md:w-auto flex-1">
        <Input
          placeholder="Search by title or description..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full md:w-64"
          allowClear
        />
        <Select
          placeholder="Filter by status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setStatus(v)}
          allowClear
          className="w-full md:w-48"
        />
      </Space>
    </div>
  );
};
