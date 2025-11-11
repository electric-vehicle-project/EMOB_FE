/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Card, Pagination, Select, Space } from "antd";
import {
  useDeliveryDeleteMutation,
  useDeliveryCompleteMutation,
  useDeliveryQueryByCurrentDealer,
} from "../../../service/deliveryService";
import { DeliveryTable } from "../../molecules/delivery/DeliveryTable";
import { toast } from "react-toastify";
import { ROUTES } from "../../../model/routePaths";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

export const DeliveryEVMAndDealerListCurrent = () => {
  // Query params
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("createAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statuses, setStatuses] = useState<string[]>([]);
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useDeliveryQueryByCurrentDealer({}, {
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
    <div>
      <span className="flex justify-between p-5">
        <b className="text-[#627254]">Danh sách đơn vận chuyển từ Hãng xe đến Đại lý</b>
        <b
          onClick={() => navigate("/" + role.toLowerCase() + "/" + ROUTES.DELIVERY_CUSTOMERS)}
          className="underline gap-2 text-[#627254] cursor-pointer hover:text-[#4f5a42] transition-colors"
        >
          Danh sách đơn vận chuyển từ Đại lý đến Khách hàng
        </b>
      </span>
      <Card
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
              style={{ width: '100%' }}
            >
              <Option value="asc">Tăng dần</Option>
              <Option value="desc">Giảm dần</Option>
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

        <div className="p-3 flex justify-center">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={total}
            showSizeChanger={true}
            onChange={(v) => setSize(v)}
            showTotal={(total) => `Tổng ${total} đơn giao hàng`}
          />
        </div>
      </Card>
    </div>
  );
};
