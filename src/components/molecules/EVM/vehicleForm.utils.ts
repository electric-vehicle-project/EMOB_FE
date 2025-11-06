// src/components/molecules/EVM/vehicleForm.utils.ts
import type { UploadFile } from "antd";

/** Chuyển mảng URL string -> UploadFile[] để Upload hiển thị ảnh sẵn có */
export const normalizeInitialFileList = (images?: string[]): UploadFile[] => {
  if (!Array.isArray(images)) return [];
  return images
    .filter((u) => typeof u === "string" && !!u)
    .map((url, idx) => ({
      uid: `${idx}`,
      name: url.split("/").pop() || `image_${idx}.png`,
      status: "done",
      url,
    })) as UploadFile[];
};
