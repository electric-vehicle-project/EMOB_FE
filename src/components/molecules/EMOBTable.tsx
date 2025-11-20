import {
  ConfigProvider,
  Dropdown,
  Table,
  type MenuProps,
  type TableProps,
} from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

export interface EMOBTableProps<T> extends Omit<TableProps<T>, "title"> {
  actions?: (record: T) => MenuProps["items"];
  filterBar?: React.ReactNode;
}

export function EMOBTable<T extends object>({
  actions,
  columns,
  pagination,
  filterBar,
  ...props
}: EMOBTableProps<T>) {
  const actionColumn = actions
    ? ({
        title: "Thao tác",
        key: "actions",
        width: 80,
        align: "center",
        render: (_: unknown, record: T) => (
          <Dropdown
            trigger={["click"]}
            menu={{ items: actions(record) }}
            placement="bottomRight"
          >
            <EllipsisOutlined className="text-xl cursor-pointer text-gray-600 hover:text-black" />
          </Dropdown>
        ),
      } as ColumnsType<T>[number])
    : null;

  return (
    <ConfigProvider>
      {/* FILTER BAR */}
      {filterBar && <div className="mb-2">{filterBar}</div>}

      <Table<T>
        {...props}
        bordered
        className="bg-white rounded-lg shadow-sm"
        tableLayout="auto"
        columns={
          [...(columns || []), actionColumn].filter(Boolean) as ColumnsType<T>
        }
        pagination={{
          position: ["bottomCenter"],
          showSizeChanger: true,
          showTotal: (t) => `Tổng cộng ${t} mục`,
          ...pagination,
        }}
      />
    </ConfigProvider>
  );
}
