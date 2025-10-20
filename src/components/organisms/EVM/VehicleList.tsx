import { useState, useMemo } from "react";
import { Spin, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../molecules/SearchBar";
import { Button } from "../../atoms/Button";
import { useDebounce } from "../../../hook/useDebounce";
import { useGetVehicles } from "../../../service/vehicleService";
import type { IVehicle } from "../../../model/Vehicle";
import { VehicleCard } from "../../molecules/VehicleCard";

export const VehicleList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();

  const { data: vehiclesData, isLoading } = useGetVehicles();
  const vehicles = useMemo(() => {
    const all = vehiclesData?.result?.data ?? [];
    if (!Array.isArray(all)) return [];
    // ✅ Hợp nhất các trường có thể có từ backend
    return all.filter((v) => {
      const deleted =
        v.isDeleted === true || v.is_deleted === 1 || v.is_Deleted === 1; // ✅ thêm trường đúng với DB
      return !deleted; // chỉ lấy xe chưa bị xóa
    });
  }, [vehiclesData]);

  const filtered = useMemo(() => {
    if (!Array.isArray(vehicles)) return [];
    return vehicles.filter(
      (v: IVehicle) =>
        v.brand?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        v.model?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [vehicles, debouncedSearch]);

  return (
    <Spin spinning={isLoading} tip="Đang tải xe...">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm theo hãng hoặc mẫu xe..."
            className="w-full sm:max-w-[420px]"
          />
          <Button
            type="primary"
            onClick={() => navigate("/dashboard/evm/vehicle/new")}
            className="w-full sm:w-auto sm:ml-4 px-6"
          >
            Thêm xe mới
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {filtered.map((v) => (
            <Col xs={24} sm={12} lg={8} key={v.id}>
              <VehicleCard
                vehicle={v}
                onViewDetail={() => navigate(`/dashboard/evm/vehicle/${v.id}`)}
              />
            </Col>
          ))}
        </Row>
      </div>
    </Spin>
  );
};
