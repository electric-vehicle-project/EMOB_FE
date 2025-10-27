export interface ICustomerBasic {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
}

export interface ISalePerson {
  id: string;
  fullName: string;
}

export interface ITestDriveSchedule {
  testDriveId: string;
  customer: ICustomerBasic;
  salePerson?: ISalePerson;
  scheduledAt: string;
  duration: number;
  location: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

export interface ITestDriveMetadata {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ITestDriveResponse {
  code: number;
  message: string;
  result: {
    data: ITestDriveSchedule[];
    metadata: ITestDriveMetadata;
  };
}
