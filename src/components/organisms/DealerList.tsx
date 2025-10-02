import { useEffect, useState, useMemo } from "react";
import { dealerService } from "../../service/dealerService";
import type { IDealer } from "../../model/Dealer";
import { DealerTable } from "../molecules/DealerTable";
import { SearchBar } from "../molecules/SearchBar";
import { DealerModal } from "./DealerModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { Button } from "../atoms/Button";
import debounce from "lodash/debounce";

export const DealerList = () => {
  const [dealers, setDealers] = useState<IDealer[]>([]);
  const [filtered, setFiltered] = useState<IDealer[]>([]);
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

  // ✅ debounce search 300ms
  const handleSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFiltered(
          dealers.filter((d) =>
            d.name.toLowerCase().includes(value.toLowerCase())
          )
        );
      }, 300),
    [dealers]
  );

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
        <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm đại lý..." />

        <Button
          type="primary"
          onClick={() => setModalOpen(true)}
          className="ml-4 px-6"
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
