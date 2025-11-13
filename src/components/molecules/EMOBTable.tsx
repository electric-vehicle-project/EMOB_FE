import {
  ConfigProvider,
  Dropdown,
  Table,
  type MenuProps,
  type TableProps,
} from "antd";
import { EllipsisButton } from "../atoms/EllipsisButton";
import type { ColumnsType } from "antd/es/table";
import { TableWrapper } from "../atoms/TableWrapper";

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
        width: 110,
        align: "center",
        render: (_: unknown, record: T) => (
          <div className="flex justify-center items-center w-full">
            <Dropdown menu={{ items: actions(record) }} trigger={["click"]}>
              <div>
                <EllipsisButton size={26} />
              </div>
            </Dropdown>
          </div>
        ),
      } as ColumnsType<T>[number])
    : null;

  return (
    <ConfigProvider theme={{ components: { Table: { headerBg: "#414d38" } } }}>
      <TableWrapper>
        {filterBar && <div className="p-4">{filterBar}</div>}

        <Table<T>
          {...props}
          columns={
            [...(columns || []), actionColumn].filter(Boolean) as ColumnsType<T>
          }
          pagination={{
            position: ["bottomCenter"],
            showSizeChanger: true,
            showTotal: (t) => `Tổng cộng ${t} mục`,
            ...pagination,
          }}
          scroll={{ x: "max-content" }}
        />
      </TableWrapper>
    </ConfigProvider>
  );
}
