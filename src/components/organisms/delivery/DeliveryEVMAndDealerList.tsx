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
} from "antd";
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
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  // Modal control
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();

  // Query deliveries
  const { data, isLoading, refetch } = useDeliveryQueryByEVM({}, {
    page,
    size,
    sortField,
    sortDir,
    statuses,
  });

  // Query all contracts (EVM → Dealer)
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

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        contractId: values.contractId,
        deliveryDate: values.deliveryDate.format("YYYY-MM-DD"),
      };
      await createDelivery(payload);
      toast.success("Tạo đơn vận chuyển thành công!");
      setOpenModal(false);
      form.resetFields();
      refetch();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Đã xảy ra lỗi không xác định!";
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <span className="flex justify-between p-5">
        <b className="text-[#627254]">Danh sách đơn vận chuyển từ Hãng xe đến Đại lý</b>
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

            {role === "EVM_STAFF" && (
              <>
                <Button
                  type="primary"
                  className="!bg-[#627254]"
                  onClick={() => setOpenModal(true)}
                >
                  + Tạo đơn vận chuyển
                </Button>
              </>
            )}
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

        {/* MODAL TẠO ĐƠN */}
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
            initialValues={{
              deliveryDate: dayjs(),
            }}
          >
            <Form.Item
              label="Chọn hợp đồng"
              name="contractId"
              rules={[{ required: true, message: "Vui lòng chọn hợp đồng" }]}
            >
              <Select
                placeholder="Chọn số hợp đồng"
                showSearch
                optionFilterProp="children"
              >
                {contracts
                  .filter((c: any) => c.status === "SIGNED") // chỉ lấy hợp đồng đã ký
                  .map((contract: any) => (
                    <Option key={contract.contractId} value={contract.contractId}>
                      {contract.contractNumber}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Ngày bắt đầu vận chuyển"
              name="deliveryDate"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày vận chuyển",
                },
                {
                  validator: (_, value) => {
                    if (!value || value.isSame(dayjs(), "day") || value.isAfter(dayjs(), "day")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Ngày vận chuyển phải từ hôm nay trở đi")
                    );
                  },
                },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                className="w-full"
                disabledDate={(current) =>
                  current && current.isBefore(dayjs().startOf("day"))
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card >

    </div>
  );
};
