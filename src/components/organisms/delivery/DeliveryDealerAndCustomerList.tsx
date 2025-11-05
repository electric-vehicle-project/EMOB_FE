/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Card, Select, Space } from "antd";
import {
  useDeliveryDeleteMutation,
  useDeliveryCompleteMutation,
  useDeliveryQueryByCustomers,
} from "../../../service/deliveryService";
import { DeliveryTable } from "../../molecules/delivery/DeliveryTable";
import { toast } from "react-toastify";

const { Option } = Select;

export const DeliveryDealerAndCustomerList = () => {
  // Query params
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("createAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statuses, setStatuses] = useState<string[]>([]);

  const { data, isLoading, refetch } = useDeliveryQueryByCustomers({}, {
    page,
    size,
    sortField,
    sortDir,
    statuses,
  });

  const { mutateAsync: deleteDelivery, isPending: deleting } =
    useDeliveryDeleteMutation();
  const { mutateAsync: completeDelivery, isPending: completing } =
    useDeliveryCompleteMutation();

  const deliveries = data?.result?.data ?? [];
  const total = data?.result?.metadata.totalElements ?? 0;

  // Actions
  const handleComplete = async (record: any) => {
    try {
      await completeDelivery(record.id);
      toast.success("Đã đánh dấu hoàn tất giao hàng!");
      refetch();
    } catch {
      toast.error("Không thể hoàn tất giao hàng.");
    }
  };

  const handleDelete = async (record: any) => {
    try {
      await deleteDelivery(record.id);
      toast.success("Xóa giao hàng thành công!");
      refetch();
    } catch {
      toast.error("Không thể xóa giao hàng.");
    }
  };

  return (
    <Card
      title="Danh sách đơn vận chuyển từ Đại lý đến Khách hàng"
      extra={
        <Space>
          <Select
            placeholder="Trạng thái"
            mode="multiple"
            value={statuses}
            onChange={setStatuses}
            style={{ width: 180 }}
            allowClear
          >
            <Option value="IN_PROGRESS">IN_PROGRESS</Option>
            <Option value="SUCCESS">SUCCESS</Option>
          </Select>

          <Select
            value={sortField}
            onChange={(v) => setSortField(v)}
            style={{ width: 150 }}
          >
            <Option value="createAt">Ngày tạo</Option>
            <Option value="deliveryDate">Ngày giao hàng</Option>
          </Select>

          <Select
            value={sortDir}
            onChange={(v) => setSortDir(v)}
            style={{ width: 100 }}
          >
            <Option value="asc">ASC</Option>
            <Option value="desc">DESC</Option>
          </Select>

          <Select
            value={size}
            onChange={(v) => setSize(v)}
            style={{ width: 100 }}
          >
            <Option value={10}>10 / page</Option>
            <Option value={20}>20 / page</Option>
            <Option value={50}>50 / page</Option>
            <Option value={100}>100 / page</Option>
          </Select>
        </Space>
      }
    >
      <DeliveryTable
        data={deliveries}
        loading={isLoading || deleting || completing}
        page={page}
        size={size}
        total={total}
        onPageChange={(newPage) => setPage(newPage - 1)} // convert to 0-index
        onComplete={handleComplete}
        onDelete={handleDelete}
      />
    </Card>
  );
};
