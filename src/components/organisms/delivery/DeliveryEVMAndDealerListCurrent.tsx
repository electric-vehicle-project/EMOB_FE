/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Card,
  Pagination,
  Select,
  Space,
  Input,
  Dropdown,
  Button,
} from "antd";
import { SlidersOutlined } from "@ant-design/icons";
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
  const [keyword, setKeyword] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  const user = useCurrentUser();
  const role = (user as any)?.role || "";
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useDeliveryQueryByCurrentDealer(
    {},
    { page, size, sortField, sortDir, statuses, keyword }
  );

  const { mutateAsync: deleteDelivery, isPending: deleting } =
    useDeliveryDeleteMutation();

  const { mutateAsync: completeDelivery, isPending: completing } =
    useDeliveryCompleteMutation();

  const deliveries = data?.result?.data ?? [];
  const total = data?.result?.metadata.totalElements ?? 0;

  // ================= FILTER DROPDOWN =================
  const FilterContent = () => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      {/* STATUS */}
      <div>
        <b>Trạng thái</b>
        <Select
          mode="multiple"
          value={statuses}
          onChange={(v) => {
            setStatuses(v);
            setPage(0);
          }}
          allowClear
          className="w-full mt-2"
        >
          <Option value="IN_PROGRESS">IN_PROGRESS</Option>
          <Option value="SUCCESS">SUCCESS</Option>
        </Select>
      </div>

      {/* SORT FIELD */}
      <div>
        <b>Sắp xếp theo</b>
        <Select
          value={sortField}
          onChange={(v) => {
            setSortField(v);
            setPage(0);
          }}
          className="w-full mt-2"
        >
          <Option value="createAt">Ngày tạo</Option>
          <Option value="deliveryDate">Ngày giao hàng</Option>
        </Select>
      </div>

      {/* SORT DIR */}
      <div>
        <b>Thứ tự</b>
        <Select
          value={sortDir}
          onChange={(v) => {
            setSortDir(v);
            setPage(0);
          }}
          className="w-full mt-2"
        >
          <Option value="asc">Tăng dần</Option>
          <Option value="desc">Giảm dần</Option>
        </Select>
      </div>
    </div>
  );

  // ================= COMPLETE / DELETE =================
  const handleComplete = async (record: any) => {
    try {
      await completeDelivery(record.id);
      toast.success("Hoàn tất đơn giao hàng!");
      refetch();
    } catch {
      toast.error("Không thể hoàn tất đơn.");
    }
  };

  const handleDelete = async (record: any) => {
    try {
      await deleteDelivery(record.id);
      toast.success("Đã xóa thành công!");
      refetch();
    } catch {
      toast.error("Không thể xóa đơn giao hàng.");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <span className="flex justify-between p-5">
        <b className="text-lg text-[#627254]">
          Danh sách đơn vận chuyển từ Hãng xe đến Đại lý
        </b>

        <b
          onClick={() =>
            navigate(`/${role.toLowerCase()}/${ROUTES.DELIVERY_CUSTOMERS}`)
          }
          className="underline cursor-pointer text-[#627254] hover:text-[#4f5a42]"
        >
          Danh sách đơn vận chuyển từ Đại lý đến Khách hàng
        </b>
      </span>

      <Card>
        {/* Toolbar */}
        <Space className="flex justify-start pb-5">
          <Input
            placeholder="Tìm kiếm theo mã đơn giao hàng..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            allowClear
            style={{ width: 350 }}
          />

          <Dropdown
            trigger={["click"]}
            open={filterOpen}
            onOpenChange={setFilterOpen}
            dropdownRender={() => <FilterContent />}
          >
            <Button type="text" icon={<SlidersOutlined style={{ fontSize: 20 }} />} />
          </Dropdown>
        </Space>

        {/* TABLE */}
        <DeliveryTable
          data={deliveries}
          loading={isLoading || deleting || completing}
          page={page}
          size={size}
          total={total}
          onPageChange={(p) => setPage(p - 1)}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />

        {/* PAGINATION */}
        <div className="p-3 flex justify-center">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={total}
            showSizeChanger
            onChange={(p, s) => {
              setPage(p - 1);
              setSize(s);
            }}
            showTotal={(t) => `Tổng ${t} đơn giao hàng`}
          />
        </div>
      </Card>
    </div>
  );
};
