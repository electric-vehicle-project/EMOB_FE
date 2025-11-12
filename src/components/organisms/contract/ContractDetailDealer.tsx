/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router";
import {
  Card,
  Button,
  Divider,
  Spin,
  Modal,
  Select,
  InputNumber,
  Form,
  DatePicker,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";
import {
  useContractCancelMutation,
  useContractDetailQuery,
  useContractSignMutation,
} from "../../../service/contractService";
import { toast } from "react-toastify";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { DeleteConfirm } from "../DeleteConfirm";
import { useSaleOrderById } from "../../../service/saleOrderService";
import { useDealerByIdQuery } from "../../../service/dealerService";
import { ROUTES } from "../../../model/routePaths";


export const ContractDetailDealer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, refetch } = useContractDetailQuery(id);

  const { mutateAsync: signContract, isPending: signing } = useContractSignMutation();
  const { mutateAsync: cancelContract } = useContractCancelMutation();

  const user = useCurrentUser();
  const contract = data?.result;
  const saleOrder = useSaleOrderById(contract?.orderId).data?.result;
  const dealer = useDealerByIdQuery(saleOrder?.dealerId).data?.result;
  const printRef = useRef<HTMLDivElement>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"FULL" | "INSTALLMENT">(
    "FULL"
  );

  const [form] = Form.useForm();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Hợp đồng_${contract?.contractNumber}`,
  });

  const handleOpenSign = () => setModalVisible(true);
  const handleCancelModal = () => {
    form.resetFields();
    setModalVisible(false);
  };

  const handleSignSubmit = async () => {
    try {
      const formValues = form.getFieldsValue();
      const baseParams = {
        purchaseDate: dayjs().format("YYYY-MM-DD"),
        paymentStatus,
      };

      const body =
        paymentStatus === "FULL"
          ? { contractId: contract.contractId }
          : {
            contractId: contract.contractId,
            deposit: formValues.deposit,
            downPayment: formValues.downPayment,
            termMonths: formValues.termMonths,
            interestRate: formValues.interestRate,
          };

      await signContract({
        params: baseParams,
        body
      });
      toast.success("Đã ký hợp đồng thành công!");
      refetch();
      handleCancelModal();
    } catch {
      toast.error("Ký hợp đồng thất bại!");
    }
  };

  const handleCancelContract = async () => {
    try {
      await cancelContract(contract.contractId);
      toast.success("Đã hủy hợp đồng thành công!");
      refetch();
    } catch {
      toast.error("Hủy hợp đồng thất bại!");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-6">
      {/* Thanh điều hướng + nút in */}
      <div className="flex justify-between items-center mb-3">
        <div
          onClick={() => {
            if (user.role === "EVM_STAFF" || user.role === "ADMIN")
              navigate("/" + user.role.toLowerCase() + "/" + ROUTES.CONTRACT);
            if (user.role === "DEALER_STAFF" || user.role === "MANAGER")
              navigate("/" + user.role.toLowerCase() + "/" + ROUTES.CONTRACT_WITH_EVM);
          }
          }
          className="flex items-center gap-2 text-[#627254] cursor-pointer hover:text-[#4f5a42] transition-colors"
        >
          <ArrowLeftOutlined />
          <span className="font-medium">Quay lại trang trước</span>
        </div>

        <Button
          icon={<PrinterOutlined />}
          type="default"
          onClick={handlePrint}
          className="border-[#627254] text-[#627254] hover:!bg-[#627254] hover:!text-white"
        >
          In / Xuất PDF
        </Button>
      </div>

      <div ref={printRef}>
        <Card
          className="bg-white shadow-md print:shadow-none print:border-none"
          title={
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold mt-6">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </h2>
                <p className="text-xl font-bold mt-1">
                  Độc lập - Tự do - Hạnh phúc
                </p>
                -----------------------------------
                <h2 className="text-xl font-bold uppercase mt-1">
                  HỢP ĐỒNG BÀN GIAO LÔ XE ĐIỆN
                </h2>
                <p className="text-gray-600 mt-1 mb-1">
                  (Số: {contract?.contractNumber})
                </p>
              </div>
              <div className="text-end italic">TP.HCM, ngày {dayjs(contract?.createdAt).format("DD")} tháng {dayjs(contract?.createdAt).format("MM")} năm {dayjs(contract?.createdAt).format("YYYY")}
              </div>
            </>

          }
        >
          {/* ---------- Nội dung hợp đồng ---------- */}
          <div className="text-[15px] leading-7 text-justify space-y-4">
            <p>
              Căn cứ Bộ luật Dân sự và các quy định pháp luật có liên quan, hôm
              nay, chúng tôi gồm có:
            </p>

            <p>
              <b>BÊN A (Hãng xe):</b> Công ty TNHH EMOB Electric Vehicle
              <br />
              Đại diện: Ông/Bà <b>{user?.fullName ?? "______________________"}</b> - Chức vụ: Nhân viên hãng
              xe
              <br />
              Địa chỉ: Tòa nhà FPTU, Quận 9, TP. Thủ Đức, TP. Hồ Chí Minh
            </p>

            <p>
              <b>BÊN B (Đại lý):</b>  {dealer?.name ?? "______________________"}
              <br />
              Đại diện: Ông/Bà ______________________ - Chức vụ: Nhân viên đại
              lý
              <br />
              Địa chỉ: {dealer?.address ?? "______________________"}
            </p>

            <Divider />

            <p>
              Hai bên thống nhất ký kết <b>Hợp đồng bàn giao lô xe điện</b> với
              các điều khoản sau:
            </p>

            <p>
              <b>Điều 1. Thông tin lô xe bàn giao</b>
              <br />- Số lượng xe: <b>{contract?.totalQuantity}</b> chiếc
              <br />- Tổng giá trị:{" "}
              <b>{contract?.totalPrice?.toLocaleString("vi-VN")} ₫</b>
              <br />- Chủng loại xe: Theo danh mục đính kèm trong phụ lục hợp
              đồng.
            </p>

            <p>
              <b>Điều 2. Thời gian và địa điểm bàn giao</b>
              <br />- Thời gian: Trong vòng 15 ngày kể từ ngày ký hợp đồng hoặc
              thời gian khác theo thỏa thuận.
              <br />- Địa điểm: Kho hàng của Bên A hoặc địa điểm khác theo thỏa
              thuận.
            </p>

            <p>
              <b>Điều 3. Thanh toán</b>
              <br />- Hình thức thanh toán: Theo thỏa thuận.
              <br />- Trạng thái thanh toán:{" "}
              <b>
                {contract?.status === "PENDING"
                  ? "Chưa thanh toán"
                  : contract?.status === "SIGNED"
                    ? "Đã thỏa thuận"
                    : contract?.status || "Không xác định"}
              </b>
              <br />- Bên B chịu trách nhiệm thanh toán đầy đủ và đúng hạn.
            </p>


            <p>
              <b>Điều 4. Quyền và nghĩa vụ của các bên</b>
              <br />- Bên A đảm bảo xe bàn giao đúng số lượng, chất lượng.
              <br />- Bên B có nghĩa vụ kiểm tra, nhận xe và thực hiện thanh
              toán.
            </p>

            <p>
              <b>Điều 5. Điều khoản chung</b>
              {/* ---------- Phụ lục hợp đồng ---------- */}
              <Divider />

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3 text-center uppercase">
                  Phụ lục hợp đồng
                </h3>
                <p className="text-gray-600 mb-3 text-center">
                  (Chi tiết các dòng xe thuộc hợp đồng)
                </p>

                <div className="space-y-6">
                  {(contract?.items || []).map((item, index) => (
                    <div
                      key={item.id}
                      className="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      <h4 className="font-semibold mb-3 text-[#394a2f]">
                        #{index + 1}. Xe{" "}
                        {item.vehicleStatus === "TEST_DRIVE"
                          ? "lái thử"
                          : item.vehicleStatus === "SPECIAL"
                            ? "đặc biệt"
                            : "tiêu chuẩn"}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[15px]">
                        <p>
                          <b>Mã xe:</b> {item.vehicleId ?? "Không xác định"}
                        </p>
                        <p>
                          <b>Màu sắc:</b> {item.color || "Không xác định"}
                        </p>
                        <p>
                          <b>Số lượng:</b> {item.quantity ?? 0}
                        </p>
                        <p>
                          <b>Đơn giá:</b>{" "}
                          {item.unitPrice?.toLocaleString("vi-VN") ?? "0"} ₫
                        </p>
                        <p>
                          <b>Giảm giá:</b>{" "}
                          {item.discountPrice?.toLocaleString("vi-VN") ?? "0"} ₫
                        </p>
                        <p>
                          <b>Thành tiền:</b>{" "}
                          {item.totalPrice?.toLocaleString("vi-VN") ?? "0"} ₫
                        </p>
                        <p>
                          <b>Tình trạng xe:</b>{" "}
                          {item.vehicleStatus === "NORMAL"
                            ? "Xe tiêu chuẩn"
                            : item.vehicleStatus === "TEST_DRIVE"
                              ? "Xe lái thử"
                              : item.vehicleStatus === "SPECIAL"
                                ? "Xe đặc biệt"
                                : "Khác"}
                        </p>

                        <div className="col-span-2">
                          <b>Danh sách mã xe con (Vehicle Unit IDs):</b>
                          {item.vehicleUnitIds && item.vehicleUnitIds.length > 0 ? (
                            <ul className="list-disc ml-6 mt-1 text-[14px]">
                              {item.vehicleUnitIds.map((uid: string) => (
                                <li key={uid}>{uid}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 ml-2 mt-1">Không có</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6 text-[15px] font-medium">
                  <p>
                    <b>Tổng số lượng:</b> {contract?.totalQuantity ?? 0} &nbsp;&nbsp;
                    <b>Tổng giá trị:</b>{" "}
                    {contract?.totalPrice?.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
              </div>


              <br />- Hai bên cam kết thực hiện nghiêm chỉnh hợp đồng này.
              <br />- Hợp đồng có hiệu lực kể từ ngày ký.
              <br />- Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản có giá
              trị pháp lý như nhau.
            </p>
          </div>

          <Divider />

          <div className="flex justify-between items-start mt-8 mr-10 ml-10">
            <div className="text-center">
              <p className="font-semibold uppercase">ĐẠI DIỆN BÊN A</p>
              <div className="border h-28 w-40 mx-auto mt-2 items-center justify-center flex">
                (đã ký)
              </div>
              <p className="mt-1 text-sm text-gray-500">(Ký và ghi rõ họ tên)</p>
            </div>

            <div className="text-center">
              <p className="font-semibold uppercase">ĐẠI DIỆN BÊN B</p>
              <div className="border h-28 w-40 mx-auto mt-2 items-center justify-center flex text-green-900">
                {contract?.status === "SIGNED" ? "(đã ký)" : ""}
              </div>
              <p className="mt-1 text-sm text-gray-500">(Ký và ghi rõ họ tên)</p>
            </div>
          </div>


          <Divider />

          <div className="flex justify-end gap-3 mt-6 print:hidden">
            {contract?.status === "PENDING" && user?.role === "EVM_STAFF" && (
              <>
                <Button
                  type="primary"
                  icon={<FileDoneOutlined />}
                  onClick={handleOpenSign}
                  className="!bg-[#627254] hover:!bg-[#556547] text-white"
                >
                  Ký hợp đồng
                </Button>
                <Button
                  danger
                  onClick={() => setDeleteModalVisible(true)}
                  className="!bg-[#f34b4b] hover:!bg-[#ba0000] !text-white rounded-xl h-9"
                >
                  Hủy hợp đồng
                </Button>

              </>
            )}
            {contract?.status === "SIGNED" && (
              <Button disabled type="default">
                Hợp đồng đã được ký
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* ---------- Modal ký hợp đồng ---------- */}
      <Modal
        open={modalVisible}
        title="Ký hợp đồng"
        onCancel={handleCancelModal}
        onOk={handleSignSubmit}
        okText="Ký"
        cancelText="Hủy"
        confirmLoading={signing}
        okButtonProps={{
          disabled:
            paymentStatus === "INSTALLMENT"
              ? !form.isFieldsTouched(true) ||
              form.getFieldsError().some(({ errors }) => errors.length > 0)
              : false,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-2"
          onValuesChange={() => {
            // Bắt buộc re-render để cập nhật trạng thái nút khi người dùng nhập
            form.validateFields().catch(() => { });
          }}
        >
          <Form.Item label="Trạng thái thanh toán">
            <Select
              value={paymentStatus}
              onChange={(v) => setPaymentStatus(v)}
              options={[
                { label: "Trả thẳng", value: "FULL" },
                { label: "Trả góp", value: "INSTALLMENT" },
              ]}
            />
          </Form.Item>

          {paymentStatus === "INSTALLMENT" && (
            <>
              <Form.Item
                name="deposit"
                label="Tiền đặt cọc (₫)"
                rules={[
                  {
                    required: true,
                    message: "Tiền đặt cọc ít nhất phải đạt 10% giá trị tổng đơn",
                  },
                  {
                    validator: (_, value) => {
                      const minDeposit = (contract?.totalPrice || 0) * 0.1;
                      if (value === undefined || value < minDeposit) {
                        return Promise.reject(
                          new Error(
                            `Tiền đặt cọc tối thiểu là ${minDeposit.toLocaleString(
                              "vi-VN"
                            )} ₫`
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber min={0} className="!w-full" />
              </Form.Item>

              <Form.Item
                name="downPayment"
                label="Ngày bắt đầu kế hoạch trả góp"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày bắt đầu kế hoạch trả góp",
                  },
                ]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  className="w-full"
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>

              <Form.Item
                name="termMonths"
                label="Thời hạn vay (tháng)"
                rules={[{ required: true, message: "Vui lòng chọn thời hạn" }]}
              >
                <Select
                  options={[
                    { label: "12 tháng", value: 12 },
                    { label: "18 tháng", value: 18 },
                    { label: "24 tháng", value: 24 },
                    { label: "30 tháng", value: 30 },
                    { label: "36 tháng", value: 36 },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="interestRate"
                label="Lãi suất (%)"
                rules={[{ required: true, message: "Vui lòng nhập lãi suất" }]}
              >
                <InputNumber min={0} max={100} step={0.1} className="!w-full" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <DeleteConfirm
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={async () => {
          await handleCancelContract();
          setDeleteModalVisible(false);
        }}
        message="Bạn có chắc chắn muốn hủy hợp đồng này không? Hành động này không thể hoàn tác."
        okText="Hủy hợp đồng"
        danger
        title="Xác nhận hủy hợp đồng"
      />
    </div>
  );
};
