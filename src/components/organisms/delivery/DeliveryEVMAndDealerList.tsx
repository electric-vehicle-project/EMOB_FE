/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Card,
  Select,
  Space,
  Button,
  Modal,
  Form,
  DatePicker,
  Pagination,
  Input,
  Dropdown,
} from "antd";
import { SlidersOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  useDeliveryQueryByEVM,
  useDeliveryDeleteMutation,
  useDeliveryCompleteMutation,
  useDeliveryCreateByEVMMutation,
} from "../../../service/deliveryService";
import { DeliveryTable } from "../../molecules/delivery/DeliveryTable";
import { useContractQueryByEVM } from "../../../service/contractService";
import { useCurrentUser } from "../../../utils/getCurrentUser";

const { Option } = Select;

export const DeliveryEVMAndDealerList = () => {
  // Query params
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("createAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  const user = useCurrentUser();
  const role = (user as any)?.role;

  // Modal control
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();

  // API queries
  const { data, isLoading, refetch } = useDeliveryQueryByEVM(
    {},
    { page, size, sortField, sortDir, statuses, keyword }
  );

  const { data: contractsData } = useContractQueryByEVM({}, {});
  const contracts = contractsData?.result?.data ?? [];

  // Mutations
  const { mutateAsync: deleteDelivery, isPending: deleting } =
    useDeliveryDeleteMutation();

  const { mutateAsync: completeDelivery, isPending: completing } =
    useDeliveryCompleteMutation();

  const { mutateAsync: createDelivery, isPending: creating } =
    useDeliveryCreateByEVMMutation();

  const deliveries = data?.result?.data ?? [];
  const total = data?.result?.metadata.totalElements ?? 0;

  // ================= FILTER DROPDOWN CONTENT =================
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

  // ================= CREATE DELIVERY =================
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createDelivery({
        contractId: values.contractId,
        deliveryDate: values.deliveryDate.format("YYYY-MM-DD"),
      });

      toast.success("Tạo đơn vận chuyển thành công!");
      setOpenModal(false);
      form.resetFields();
      refetch();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tạo đơn vận chuyển.";
      toast.error(msg);
    }
  };

  // ================= COMPLETE / DELETE =================
  const handleComplete = async (record: any) => {
    try {
      await completeDelivery(record.id);
      toast.success("Đã đánh dấu hoàn tất!");
      refetch();
    } catch {
      toast.error("Không thể hoàn tất đơn vận chuyển.");
    }
  };

  const handleDelete = async (record: any) => {
    try {
      await deleteDelivery(record.id);
      toast.success("Xóa thành công!");
      refetch();
    } catch {
      toast.error("Không thể xóa đơn vận chuyển.");
    }
  };

  // ================= RENDER =================
  return (
    <div>
      <span className="flex justify-between p-5">
        <b className="text-[#627254]">
          Danh sách đơn vận chuyển từ Hãng xe đến Đại lý
        </b>
      </span>

      <Card>
        {/* Toolbar */}
        <Space className="flex justify-between w-full pb-5">
          <div>
            <Input
              placeholder="Tìm kiếm theo mã hợp đồng..."
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
          </div>

          <div>
            {role === "EVM_STAFF" && (
              <Button
                type="primary"
                className="!bg-[#627254]"
                onClick={() => setOpenModal(true)}
              >
                + Tạo đơn vận chuyển
              </Button>
            )}
          </div>

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

        {/* MODAL */}
        <Modal
          title="Tạo đơn vận chuyển mới"
          open={openModal}
          confirmLoading={creating}
          okText="Tạo"
          cancelText="Hủy"
          onCancel={() => setOpenModal(false)}
          onOk={handleCreate}
        >
          <Form
            layout="vertical"
            form={form}
            initialValues={{ deliveryDate: dayjs() }}
          >
            <Form.Item
              label="Chọn hợp đồng"
              name="contractId"
              rules={[{ required: true }]}
            >
              <Select>
                {contracts
                  .filter((c: any) => c.status === "SIGNED" && !c.deliveryId)
                  .map((c: any) => (
                    <Option key={c.contractId} value={c.contractId}>
                      {c.contractNumber} — <span className="text-green-600">Chưa tạo vận chuyển</span>
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Ngày bắt đầu vận chuyển"
              name="deliveryDate"
              rules={[{ required: true }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                disabledDate={(current) =>
                  current && current.isBefore(dayjs().startOf("day"))
                }
                className="w-full"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};
