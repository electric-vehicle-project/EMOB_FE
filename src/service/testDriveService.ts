// src/service/testDriveService.ts
import type { ITestDrive } from "../model/TestDrive";

// fake data ban đầu
let testDrives: ITestDrive[] = [
  {
    id: 1,
    customer: "Nguyễn Văn A",
    car: "VinFast VF8",
    date: "2025-10-05",
    duration: 30,
    status: "Pending",
  },
  {
    id: 2,
    customer: "Trần Thị B",
    car: "Toyota Vios",
    date: "2025-10-06",
    duration: 25,
    status: "Completed",
  },
  {
    id: 3,
    customer: "Lê Văn C",
    car: "Honda City",
    date: "2025-10-07",
    duration: 15,
    status: "Cancelled",
  },
];

export const testDriveService = {
  getTestDrives: async () => testDrives,

  createTestDrive: async (testDrive: ITestDrive) => {
    testDrives.push({ ...testDrive, id: testDrives.length + 1 });
  },

  updateTestDrive: async (testDrive: ITestDrive) => {
    testDrives = testDrives.map((d) => (d.id === testDrive.id ? testDrive : d));
  },

  deleteTestDrive: async (id: number) => {
    testDrives = testDrives.filter((d) => d.id !== id);
  },
};
