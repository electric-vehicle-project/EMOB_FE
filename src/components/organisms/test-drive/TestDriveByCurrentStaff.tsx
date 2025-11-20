/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
    Card,
    Button,
    Calendar,
    Dropdown,
    Select,
    Input,
    Pagination,
    Space,
    Divider,
} from "antd";
import { SlidersOutlined, PlusOutlined } from "@ant-design/icons";
import { useTestDriveByStaffQuery } from "../../../service/testDriveService";
import { TestDriveCalendar } from "../../molecules/test-drive/TestDriveCalendar";
import { TestDriveCreateModal } from "../../molecules/test-drive/TestDriveCreateModal";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import dayjs from "dayjs";

const { Option } = Select;

export const TestDriveByCurrentStaff = () => {


    // Pagination state
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(50);

    // Filter state
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [keyword, setKeyword] = useState("");
    const [sortField, setSortField] = useState("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const [filterOpen, setFilterOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const user = useCurrentUser();
    const role = (user as { role?: string } | null)?.role || "";

    // API Call
    const { data, isLoading, refetch } = useTestDriveByStaffQuery(
        {},
        {
            page,
            size,
            keyword,
            status: selectedStatuses,
            sortField,
            sortDir,
        }
    );

    const testDrives = data?.result?.data ?? [];
    const total = data?.result?.metadata?.totalElements ?? 0;


    // Lấy danh sách ngày có lịch
    const scheduledDates = new Set(
        testDrives.map((t: any) => dayjs(t.scheduledAt).format("YYYY-MM-DD"))
    );

    // =====================
    // Dropdown Filters
    // =====================
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
                    allowClear
                    value={selectedStatuses}
                    onChange={(v) => {
                        setSelectedStatuses(v);
                        setPage(0);
                    }}
                    className="w-full mt-2"
                >
                    <Option value="PENDING">Chờ xác nhận</Option>
                    <Option value="CONFIRMED">Đã xác nhận</Option>
                    <Option value="COMPLETED">Hoàn thành</Option>
                    <Option value="CANCELLED">Đã hủy</Option>
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
                    <Option value="createdAt">Ngày tạo</Option>
                    <Option value="scheduledAt">Ngày hẹn lái thử</Option>
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
                    <Option value="asc">Xa nhất</Option>
                    <Option value="desc">Gần nhất</Option>
                </Select>
            </div>
        </div>
    );

    return (
        <div className="flex gap-6">
            {/* SIDEBAR */}
            <div className="flex flex-col gap-4 w-[320px]">
                <Card>
                    <Calendar
                        fullscreen={false}
                        onChange={(d) => setSelectedDate(d.toDate())}
                        dateFullCellRender={(date) => {
                            const formatted = date.format("YYYY-MM-DD");
                            const isScheduled = scheduledDates.has(formatted);
                            const isToday = date.isSame(dayjs(), "day");

                            return (
                                <div
                                    className="flex items-center justify-center rounded-md"
                                    style={{
                                        height: "28px",
                                        width: "28px",
                                        margin: "0 auto",
                                        border: isToday ? "2px solid #627254" : undefined,
                                        backgroundColor: isScheduled ? "#627254" : undefined,
                                        color: isScheduled ? "white" : undefined,
                                        fontWeight: isToday ? 600 : 400,
                                    }}
                                >
                                    {date.date()}
                                </div>
                            );
                        }}
                    />
                </Card>

                <Divider style={{ margin: 10 }} />

                {/* Pagination */}
                <div className="flex justify-center">
                    <Pagination
                        className="flex"
                        current={page + 1}
                        pageSize={size}
                        total={total}
                        showSizeChanger
                        onChange={(p, s) => {
                            setPage(p - 1);
                            setSize(s);
                        }}
                    />
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1">
                <Card>
                    {/* Toolbar */}
                    <div className="flex justify-between pb-5">
                        <Space>
                            <Input
                                placeholder="Tìm kiếm..."
                                value={keyword}
                                onChange={(e) => {
                                    setKeyword(e.target.value);
                                    setPage(0);
                                }}
                                allowClear
                                style={{ width: 360 }}
                            />

                            <Dropdown
                                trigger={["click"]}
                                open={filterOpen}
                                onOpenChange={setFilterOpen}
                                dropdownRender={() => <FilterContent />}
                            >
                                <Button
                                    type="text"
                                    icon={<SlidersOutlined style={{ fontSize: 20 }} />}
                                    className="text-gray-600 hover:text-black"
                                />
                            </Dropdown>
                        </Space>

                        {role === "DEALER_STAFF" && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                className="!bg-[#627254] hover:!bg-[#556948]"
                                onClick={() => setOpenModal(true)}
                            >
                                Tạo lịch mới
                            </Button>
                        )}
                    </div>

                    {/* WEEK CALENDAR */}
                    <TestDriveCalendar
                        testDrives={testDrives}
                        loading={isLoading}
                        selectedStatuses={selectedStatuses}
                        selectedDate={selectedDate}
                        onRefetch={refetch}
                    />
                </Card>
            </div>

            {/* CREATE MODAL */}
            <TestDriveCreateModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSuccess={() => {
                    setOpenModal(false);
                    refetch();
                }}
            />
        </div>
    );
};
