/* EMOB-2025 - DeliveryDetail */
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Divider, Space, Tag, Spin } from "antd";
import { ArrowLeftOutlined, PrinterOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
    useDeliveryDetailQuery,
    useDeliveryCompleteMutation,
} from "../../../service/deliveryService";
import { toast } from "react-toastify";

export const DeliveryDealerDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // route: /delivery/:id
    const { data, isLoading, refetch } = useDeliveryDetailQuery(id);
    const { mutateAsync: completeDelivery, isPending: completing } =
        useDeliveryCompleteMutation();

    const delivery = data?.result;
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Delivery_${delivery?.id}`,
    });

    const handleComplete = async () => {
        if (!id) return;
        try {
            await completeDelivery(id);
            toast.success("Đã hoàn tất giao hàng!");
            refetch();
        } catch {
            toast.error("Không thể hoàn tất giao hàng.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spin size="large" />
            </div>
        );
    }

    if (!delivery) {
        return (
            <Card>
                <p className="text-center text-gray-500">Không tìm thấy thông tin giao hàng.</p>
            </Card>
        );
    }

    return (
        <div className="p-4">
            <div
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#627254] cursor-pointer hover:text-[#4f5a42] transition-colors"
            >
                <ArrowLeftOutlined />
                <span className="font-medium">Quay lại trang trước</span>
            </div>

            <Card
                title={


                    <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-semibold text-[#627254]">
                            Chi tiết đơn giao hàng
                        </span>
                        <Button
                            icon={<PrinterOutlined />}
                            type="default"
                            onClick={handlePrint}
                            className="border-[#627254] text-[#627254] hover:!bg-[#627254] hover:!text-white"
                        >
                            In / Xuất PDF
                        </Button>
                    </div>

                }
                extra={
                    <Space>

                        {delivery.status === "IN_PROGRESS" && (
                            <Button
                                icon={<CheckCircleOutlined />}
                                loading={completing}
                                onClick={handleComplete}
                                className="!bg-green-600 !border-none text-white"
                            >
                                Hoàn tất giao hàng
                            </Button>
                        )}
                    </Space>
                }
            >
                <div ref={printRef} className="text-gray-700 space-y-4">
                    <Divider className="!my-3" />
                    <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Mã giao hàng</p>
                            <p className="font-semibold text-[#627254]">{delivery.id}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Ngày tạo</p>
                            <p>{dayjs(delivery.createAt).format("DD/MM/YYYY HH:mm")}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Ngày giao hàng dự kiến</p>
                            <p>{dayjs(delivery.deliveryDate).format("DD/MM/YYYY")}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Ngày hoàn tất</p>
                            <p>
                                {delivery.completedAt
                                    ? dayjs(delivery.completedAt).format("DD/MM/YYYY HH:mm")
                                    : "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Số lượng xe</p>
                            <p>{delivery.quantity}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Trạng thái</p>
                            <Tag
                                color={
                                    delivery.status === "SUCCESS"
                                        ? "green"
                                        : delivery.status === "IN_PROGRESS"
                                            ? "blue"
                                            : "red"
                                }
                                className="uppercase font-semibold"
                            >
                                {delivery.status}
                            </Tag>
                        </div>

                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Danh sách xe (ID)</p>
                            <div className="p-3 bg-gray-50 rounded-lg max-h-60 overflow-y-auto border border-gray-200">
                                {delivery.vehicleIds?.length ? (
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {delivery.vehicleIds.map((v: string) => (
                                            <li key={v}>{v}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="italic text-gray-400">Không có dữ liệu xe</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Divider className="!my-3" />
                    <p className="text-right text-sm italic text-gray-400">
                        Cập nhật lần cuối:{" "}
                        {dayjs(delivery.createAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                </div>
            </Card>
        </div>
    );
};
