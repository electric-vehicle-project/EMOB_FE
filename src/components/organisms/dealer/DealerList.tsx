/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { Result, Button, Empty, Dropdown, Select, Space } from "antd";
import { SlidersOutlined, PlusOutlined } from "@ant-design/icons";
import type { IDealer } from "../../../model/Dealer";

import { SearchBar } from "../../molecules/SearchBar";
import { DeleteConfirm } from "../DeleteConfirm";
import { useDebounce } from "../../../hook/useDebounce";
import { useCurrentUser } from "../../../utils/getCurrentUser";

import {
  useDealersQuery,
  useCreateDealerMutation,
  useUpdateDealerMutation,
  useDeleteDealerMutation,
} from "../../../service/dealerService";

import { DealerTable } from "../../molecules/dealer/DealerTable";
import {
  buildDealerPayloadFromForm,
  normalizeDealerValues,
} from "../../molecules/dealer/dealerUtils";

import type { DealerApiModel } from "../../../model/Dealer";
import { toast } from "react-toastify";
import { DealerModal } from "./DealerModal";
import { Button as EmobButton } from "../../atoms/Button";

export const DealerList = () => {
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";
  const canView = role === "ADMIN" || role === "EVM_STAFF";
  const canModify = role === "ADMIN";

  // ================== STATE ==================
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [modalOpen, setModalOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<IDealer | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [country, setCountry] = useState<string | undefined>();
  const [regions, setRegions] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // ================== MAIN QUERY (SERVER FILTER + SORT) ==================
  const { data, refetch, isLoading, isError, error } = useDealersQuery(
    page - 1,
    pageSize,
    debouncedSearch,
    sortField,
    sortDir,
    country,
    regions
  );

  const dealers: IDealer[] = useMemo(() => {
    const raw = Array.isArray(data?.result?.data) ? data.result.data : [];
    return raw.map((d: DealerApiModel) => ({
      id: d.id,
      name: d.name,
      emailContact: d.emailContact,
      phoneContact: d.phoneContact,
      country: d.country,
      address: d.address,
      region: d.region,
      createdAt: d.createdAt,
    }));
  }, [data]);

  const total = data?.result?.metadata?.totalElements ?? 0;

  // ================== LOAD COUNTRY LIST ==================
  const { data: allDealerResp } = useDealersQuery(
    0,
    9999,
    "",
    "createdAt",
    "desc",
    undefined
  );

  const countryOptions = useMemo<string[]>(() => {
    const list = Array.isArray(allDealerResp?.result?.data)
      ? allDealerResp.result.data
          .map((d: DealerApiModel) => d.country)
          .filter(Boolean)
      : [];
    return Array.from(new Set(list));
  }, [allDealerResp]);

  // ================== MUTATIONS ==================
  const createDealer = useCreateDealerMutation();
  const updateDealer = useUpdateDealerMutation();
  const deleteDealer = useDeleteDealerMutation();

  const handleSave = async (values: IDealer) => {
    const normalized = normalizeDealerValues(values);
    const payload = buildDealerPayloadFromForm(normalized);

    if (editDealer?.id) {
      await updateDealer.mutateAsync({ id: editDealer.id, data: payload });
      toast.success("Cập nhật đại lý thành công");
    } else {
      await createDealer.mutateAsync(payload);
      toast.success("Tạo đại lý thành công");
    }

    setModalOpen(false);
    setEditDealer(undefined);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteDealer.mutateAsync(deleteId);
    toast.success("Đã xoá đại lý");
    setDeleteId(null);
    refetch();
  };

  // ================== FILTER CONTENT ==================
  const FilterContent = () => (
    <div
      {...({ onClick: (e: any) => e.stopPropagation() } as any)}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {/* COUNTRY */}
        <div>
          <b className="text-gray-700">Quốc gia</b>
          <Select
            allowClear
            className="w-full mt-2"
            value={country}
            onChange={(v) => {
              setCountry(v);
              setPage(1);
            }}
          >
            {countryOptions.map((c) => (
              <Select.Option key={c} value={c}>
                {c}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* REGIONS */}
        <div>
          <b className="text-gray-700">Vùng</b>
          <Select
            mode="multiple"
            allowClear
            className="w-full mt-2"
            value={regions}
            onChange={(v) => {
              setRegions(v);
              setPage(1);
            }}
          >
            <Select.Option value="NORTH">Miền Bắc</Select.Option>
            <Select.Option value="CENTRAL">Miền Trung</Select.Option>
            <Select.Option value="SOUTH">Miền Nam</Select.Option>
          </Select>
        </div>

        {/* SORT FIELD */}
        <div>
          <b className="text-gray-700">Sắp xếp theo</b>
          <Select
            className="w-full mt-2"
            value={sortField}
            onChange={(v) => {
              setSortField(v);
              setPage(1);
            }}
          >
            <Select.Option value="createdAt">Ngày tạo</Select.Option>
            <Select.Option value="name">Tên đại lý</Select.Option>
            <Select.Option value="country">Quốc gia</Select.Option>
          </Select>
        </div>

        {/* SORT DIR */}
        <div>
          <b className="text-gray-700">Thứ tự</b>
          <Select
            className="w-full mt-2"
            value={sortDir}
            onChange={(v) => {
              setSortDir(v);
              setPage(1);
            }}
          >
            <Select.Option value="asc">Tăng dần</Select.Option>
            <Select.Option value="desc">Giảm dần</Select.Option>
          </Select>
        </div>
      </Space>
    </div>
  );

  // ================== PERMISSION ==================
  if (!canView)
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={<Button href="/dashboard">Về trang tổng quan</Button>}
      />
    );

  if (isError)
    return (
      <Result
        status="error"
        title="Không thể tải danh sách đại lý"
        subTitle={error?.message || "Vui lòng thử lại."}
        extra={<Button onClick={() => refetch()}>Thử lại</Button>}
      />
    );

  // ================== UI ==================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* SEARCH + FILTER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm đại lý..."
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
        </div>

        {canModify && (
          <EmobButton
            type="primary"
            icon={<PlusOutlined />}
            className="bg-green-700"
            onClick={() => {
              setEditDealer(undefined);
              setModalOpen(true);
            }}
          >
            Thêm đại lý mới
          </EmobButton>
        )}
      </div>

      {dealers.length > 0 ? (
        <DealerTable
          data={dealers}
          isLoading={isLoading}
          onEdit={(d) => {
            setEditDealer(d);
            setModalOpen(true);
          }}
          onDelete={(id) => setDeleteId(id)}
          canModify={canModify}
          pagination={{
            current: page,
            pageSize: pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s || pageSize);
            },
          }}
          sortField={sortField}
          sortDir={sortDir}
          onSortChange={(f, d) => {
            setSortField(f ?? "createdAt");
            setSortDir(d ?? "desc");
            setPage(1);
          }}
          countryOptions={countryOptions}
          activeCountry={country}
          onFilterCountry={(c) => {
            setCountry(c);
            setPage(1);
          }}
        />
      ) : (
        <Empty description="Không có dữ liệu" />
      )}

      {canModify && (
        <>
          <DealerModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSave}
            initialValues={editDealer}
          />

          <DeleteConfirm
            open={!!deleteId}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
            message="Bạn có chắc chắn muốn xoá đại lý này?"
          />
        </>
      )}
    </div>
  );
};
