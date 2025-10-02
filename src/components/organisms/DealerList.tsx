import { useEffect, useState } from "react";
import { dealerService } from "../../service/dealerService";
import type { IDealer } from "../../model/Dealer";
import { DealerTable } from "../molecules/DealerTable";
import { SearchBar } from "../molecules/SearchBar";
import { DealerModal } from "./DealerModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { Button } from "../atoms/Button";
import { useDebounce } from "../../hook/useDebounce";

export const DealerList = () => {
  const [dealers, setDealers] = useState<IDealer[]>([]);
  const [filtered, setFiltered] = useState<IDealer[]>([]);
  const [search, setSearch] = useState(""); // raw input
  const debouncedSearch = useDebounce(search, 300); // ✅ debounce
  const [modalOpen, setModalOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<IDealer | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = async () => {
    const data = await dealerService.getDealers();
    setDealers(data);
    setFiltered(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Filter khi debouncedSearch thay đổi
  useEffect(() => {
    const keyword = debouncedSearch.toLowerCase();
    setFiltered(dealers.filter((d) => d.name.toLowerCase().includes(keyword)));
  }, [debouncedSearch, dealers]);

  const handleSave = async (values: IDealer) => {
    if (editDealer) {
      await dealerService.updateDealer({ ...editDealer, ...values });
    } else {
      await dealerService.createDealer(values);
    }
    setModalOpen(false);
    setEditDealer(undefined);
    loadData();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dealerService.deleteDealer(deleteId);
      setDeleteId(null);
      loadData();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm đại lý..."
          className="hover-lift"
        />

        <Button
          type="primary"
          onClick={() => setModalOpen(true)}
          className="ml-4 px-6 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          Thêm đại lý mới
        </Button>
      </div>

      <DealerTable
        data={filtered}
        onEdit={(d) => {
          setEditDealer(d);
          setModalOpen(true);
        }}
        onDelete={setDeleteId}
      />

      <DealerModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditDealer(undefined);
        }}
        onSubmit={handleSave}
        initialValues={editDealer}
      />

      <DeleteConfirm
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
