export interface DealerApiItem {
  year: number;
  month: number;
  region: string;
  country: string;
  dealerId: string;
  totalRevenue: number;
  totalContracts: number;
  totalVehiclesSold: number;
}

export interface DealerApiResponse {
  data: DealerApiItem[];
  metadata: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

export interface KpiItem {
  title: string;
  value: string;
  sub: string;
  icon: string;
  color: string;
}

export interface EmployeeRevenue {
  accountId: string;
  orderCount: number;
  amount: number;
}

export interface EmployeeRevenueResponse {
  data: EmployeeRevenue[];
}

export interface CustomerRevenue {
  year?: number;
  month?: number;
  customerId: string;
  totalVehiclesSold: number;
  totalRevenue: number;
  totalContracts: number;
}

export interface CustomerRevenueResponse {
  data: CustomerRevenue[];
  metadata?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
