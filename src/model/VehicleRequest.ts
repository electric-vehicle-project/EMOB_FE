export interface IVehicleRequestItem {
  id: string;
  vehicleId: string;
  vehicleStatus: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IVehicleRequest {
  id: string;
  dealerId: string;
  totalPrice: number;
  totalQuantity: number;
  status: string;
  createdAt: string;
  items: IVehicleRequestItem[];
}
