import { useState, useMemo } from "react";
import { Result, Button, Empty } from "antd";
import type { IDealer } from "../../../model/Dealer";
import { SearchBar } from "../../molecules/SearchBar";
import { DealerModal } from "./DealerModal";
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

export const DealerList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<IDealer | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";
  const canView = role === "ADMIN" || role === "EVM_STAFF";
  const canModify = role === "ADMIN";
  const params = useMemo(
    () => ({
      page: current - 1,
      size: pageSize,
      keyword: debouncedSearch || undefined,
      sortField: "createdAt",
      sortDir: "desc",
    }),
    [current, pageSize, debouncedSearch]
  );

  const { data, refetch, isLoading, isError, error } = useDealersQuery(
    { enabled: canView },
    params
  );
  const dealers: IDealer[] = useMemo(() => {
    const raw: DealerApiModel[] = data?.result?.data ?? [];
    return raw.map((d) => ({
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
    toast.success("Đã xóa đại lý");
    setDeleteId(null);
    refetch();
  };

  if (!canView)
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" href="/dashboard">
            Về trang tổng quan
          </Button>
        }
      />
    );

  if (isError)
    return (
      <Result
        status="error"
        title="Không thể tải danh sách đại lý"
        subTitle={
          (error as { message?: string })?.message || "Vui lòng thử lại."
        }
        extra={
          <Button type="primary" onClick={() => refetch()}>
            Thử lại
          </Button>
        }
      />
    );

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <div className="w-full max-w-xs sm:max-w-sm">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm đại lý..."
          />
        </div>

        {canModify && (
          <Button
            type="primary"
            className="!bg-[#627254] hover:!bg-[#525e46]"
            onClick={() => {
              setEditDealer(undefined);
              setModalOpen(true);
            }}
          >
            Thêm đại lý mới
          </Button>
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
          onDelete={setDeleteId}
          canModify={canModify}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setCurrent(p);
              setPageSize(s || pageSize);
            },
            showTotal: (t) => `Tổng ${t} đại lý`,
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
            message="Bạn có chắc chắn muốn xóa đại lý này?"
          />
        </>
      )}
    </>
  );
};
