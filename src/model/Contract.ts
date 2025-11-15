/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IContract {
  vatAmount: number;
  createdAt: string | number | Date;
  contractId: any;
  id?: string;
  contractNumber: string;
  totalPrice: number;
  totalQuantity: number;
  status?: string;
  contractId?: string;
}
