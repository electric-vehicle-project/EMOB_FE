import { useState } from "react";
import {
  Table,
  Spin,
  Typography,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
} from "antd";
import {
  useDealerPointRules,
  useCreateDealerPointRule,
} from "../../service/dealerPointRuleService";

// ================= Interface =================
export interface IDealerPointRule {
  dealerId: string;
  membershipLevel: string;
  minPoints: number;
  price: number;
}

// ================= Component =================
export const DealerPointRulePage = () => {
  const { data: rules, isLoading, refetch } = useDealerPointRules();
  const { mutateAsync: createRule } = useCreateDealerPointRule();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // ========== Handle create rule ==========
  const handleCreate = async (values: any) => {
    try {
      await createRule(values);
      message.success("Tạo Dealer Point Rule thành công!");
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch {
      message.error("Không thể tạo rule, vui lòng thử lại!");
    }
  };

  const dataSource: IDealerPointRule[] = rules ?? [];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <Typography.Title level={3} className="mb-4">
        Dealer Point Rules
      </Typography.Title>

      {/* Button mở modal tạo rule */}
      <div className="flex justify-end mb-3">
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: "#627254", border: "none" }}
        >
          + Tạo Rule Mới
        </Button>
      </div>

      {/* Table hiển thị danh sách rule */}
      {isLoading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Spin size="large" />
        </div>
      ) : (
        <Table<IDealerPointRule>
          rowKey={(r) => `${r.dealerId}-${r.membershipLevel}`}
          dataSource={dataSource}
          columns={[
            { title: "Dealer ID", dataIndex: "dealerId" },
            { title: "Membership Level", dataIndex: "membershipLevel" },
            { title: "Min Points", dataIndex: "minPoints" },
            {
              title: "Price (₫)",
              dataIndex: "price",
              render: (v) => v.toLocaleString("vi-VN"),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Modal tạo rule */}
      <Modal
        open={isModalOpen}
        title="Tạo Dealer Point Rule"
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Tạo"
      >
        <Form layout="vertical" form={form} onFinish={handleCreate}>
          <Form.Item
            name="dealerId"
            label="Dealer ID"
            rules={[{ required: true, message: "Vui lòng nhập dealerId" }]}
          >
            <InputNumber className="w-full" />
          </Form.Item>

          <Form.Item
            name="membershipLevel"
            label="Membership Level"
            rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
          >
            <Select
              options={[
                { label: "BRONZE", value: "BRONZE" },
                { label: "SILVER", value: "SILVER" },
                { label: "GOLD", value: "GOLD" },
                { label: "PLATINUM", value: "PLATINUM" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="minPoints"
            label="Điểm tối thiểu"
            rules={[
              {
                required: true,
                type: "number",
                min: 0,
                message: "Điểm không hợp lệ",
              },
            ]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá trị mỗi điểm (₫)"
            rules={[
              {
                required: true,
                type: "number",
                min: 0,
                message: "Giá trị không hợp lệ",
              },
            ]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
