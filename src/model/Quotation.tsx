export interface IQuotationItem {
  id?: string | null;
  vehicleId?: string;
  promotionId?: string | null;
  vehicleStatus: string;
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
  dealerId?: string;
  accountId?: string;
  totalPrice: number;
  totalQuantity: number;
  validUntil: number;
  status: string;
  createdAt: string;
  vatAmount: number;
}
