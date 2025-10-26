export interface IQuotationItem {
  id?: string;
  vehicleId?: string;
  promotionId?: string;
  vehicleStatus?: string;
  color?: string;
  quantity?: number;
  unitPrice?: number;
  discountPrice?: number;
  totalPrice?: number;
  totalQuantity?: number;
}

export interface IQuotation {
  id: string;
  items: IQuotationItem[];
  customerId: string;
  dealerId?: string; // 🔥 dealerId ở đây, không phải trong items
  accountId?: string;
  totalPrice: number;
  totalQuantity: number;
  validUntil: number;
  status: string;
  createdAt: string;
}
