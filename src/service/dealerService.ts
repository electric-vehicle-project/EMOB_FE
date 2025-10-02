import type { IDealer } from "../model/Dealer";

let dealers: IDealer[] = [
  {
    id: 1,
    name: "Dealer A",
    email: "a@mail.com",
    phone: "0123456789",
    address: "Hà Nội",
    status: "Active",
  },
  {
    id: 2,
    name: "Dealer B",
    email: "b@mail.com",
    phone: "0987654321",
    address: "TP.HCM",
    status: "Active",
  },
];

export const dealerService = {
  getDealers: async (): Promise<IDealer[]> => {
    return Promise.resolve(dealers);
  },
  createDealer: async (dealer: IDealer): Promise<void> => {
    dealers.push({ ...dealer, id: Date.now() });
    return Promise.resolve();
  },
  updateDealer: async (dealer: IDealer): Promise<void> => {
    dealers = dealers.map((d) => (d.id === dealer.id ? dealer : d));
    return Promise.resolve();
  },
  deleteDealer: async (id: number): Promise<void> => {
    dealers = dealers.filter((d) => d.id !== id);
    return Promise.resolve();
  },
};
