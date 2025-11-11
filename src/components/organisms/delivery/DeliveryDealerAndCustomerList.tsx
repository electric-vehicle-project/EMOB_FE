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
  Pagination
} from "antd";
import dayjs from "dayjs";
import {
  useDeliveryQueryByCustomers,
  useDeliveryCreateByDealerMutation,
} from "../../../service/deliveryService";
import { useContractQueryByDealer } from "../../../service/contractService";
import { DeliveryTable } from "../../molecules/delivery/DeliveryTable";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../model/routePaths";
import { toast } from "react-toastify";

const { Option } = Select;

export const DeliveryDealerAndCustomerList = () => {
  // Query params
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("createAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statuses, setStatuses] = useState<string[]>([]);
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";
  const navigate = useNavigate();

  // Modal control
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();

  // Query deliveries
  const { data, isLoading, refetch } = useDeliveryQueryByCustomers({}, {
    page,
    size,
    sortField,
    sortDir,
    statuses,
  });

  // Query hợp đồng giữa Dealer ↔ Customer
  const { data: contractData } = useContractQueryByDealer({}, {});
  const contracts = contractData?.result?.data ?? [];

  // Mutations
  
  const { mutateAsync: createDelivery, isPending: creating } =
    useDeliveryCreateByDealerMutation();

  const deliveries = data?.result?.data ?? [];
  const total = data?.result?.metadata.totalElements ?? 0;

  // Actions
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
    } catch {
      toast.error("Không thể tạo đơn vận chuyển.");
    }
  };

  return (
    <div>
      <span className="flex justify-between p-5">
        <b className="text-[#627254]">Danh sách đơn vận chuyển từ Đại lý đến Khách hàng</b>
        <b
          onClick={() => navigate("/" + role.toLowerCase() + "/" + ROUTES.DELIVERY_CURRENT_DEALER)}
          className="underline gap-2 text-[#627254] cursor-pointer hover:text-[#4f5a42] transition-colors"
        >
          Danh sách đơn vận chuyển từ Hãng xe đến Đại lý
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

            {role === "DEALER_STAFF" && (
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
          loading={isLoading}
          page={page}
          size={size}
          total={total}
          onPageChange={(newPage) => setPage(newPage - 1)}
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
          title="Tạo đơn giao hàng cho Khách hàng"
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
                  .filter((c: any) => c.status === "SIGNED") // chỉ hợp đồng đã ký
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
                    if (
                      !value ||
                      value.isSame(dayjs(), "day") ||
                      value.isAfter(dayjs(), "day")
                    ) {
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
      </Card>
    </div>
  );
};
