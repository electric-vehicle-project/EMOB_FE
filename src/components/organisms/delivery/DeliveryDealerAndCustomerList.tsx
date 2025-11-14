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
import { FilterOutlined } from "@ant-design/icons";
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
  const [keyword, setKeyword] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  const user = useCurrentUser();
  const role = (user as any)?.role || "";
  const navigate = useNavigate();

  // Modal control
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();

  // Query deliveries
  const { data, isLoading, refetch } = useDeliveryQueryByCustomers(
    {},
    {
      page,
      size,
      sortField,
      sortDir,
      statuses,
      keyword,
    }
  );

  // Query hợp đồng Dealer ↔ Customer
  const { data: contractData } = useContractQueryByDealer({}, {});
  const contracts = contractData?.result?.data ?? [];

  const { mutateAsync: createDelivery, isPending: creating } =
    useDeliveryCreateByDealerMutation();

  const deliveries = data?.result?.data ?? [];
  const total = data?.result?.metadata.totalElements ?? 0;

  // ============ Filter Dropdown Content ============
  const FilterContent = () => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      {/* STATUS */}
      <div>
        <b className="text-gray-700">Trạng thái</b>
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
        <b className="text-gray-700">Sắp xếp theo</b>
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
        <b className="text-gray-700">Thứ tự</b>
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

  // ============ CREATE DELIVERY ============
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
      {/* HEADER */}
      <span className="flex justify-between p-5">
        <b className="text-[#627254]">
          Danh sách đơn vận chuyển từ Đại lý đến Khách hàng
        </b>

        <b
          onClick={() =>
            navigate(`/${role.toLowerCase()}/${ROUTES.DELIVERY_CURRENT_DEALER}`)
          }
          className="underline text-[#627254] cursor-pointer hover:text-[#4f5a42]"
        >
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
              <Button type="text" icon={<FilterOutlined style={{ fontSize: 20 }} />} />
            </Dropdown>
          </div>

          <div>
            {role === "DEALER_STAFF" && (
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
          loading={isLoading}
          page={page}
          size={size}
          total={total}
          onPageChange={(p) => setPage(p - 1)}
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
            initialValues={{ deliveryDate: dayjs() }}
          >
            <Form.Item
              label="Chọn hợp đồng"
              name="contractId"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn hợp đồng" showSearch>
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
              rules={[
                { required: true },
                {
                  validator: (_, value) => {
                    if (!value || value.isAfter(dayjs().startOf("day")))
                      return Promise.resolve();
                    return Promise.reject(
                      "Ngày vận chuyển phải từ hôm nay trở đi"
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
