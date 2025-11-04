// src/utils/uploadFile.ts
import { supabase } from "../config/supabase";

/**
 * Upload 1 file lên Supabase Storage bucket "image_url"
 * Trả về public URL để gán vào field images của xe
 */
export const uploadFile = async (file: File): Promise<string> => {
  if (!file) throw new Error("No file to upload");

  // Đặt folder riêng theo ngày cho gọn
  const folder = new Date().toISOString().slice(0, 10).replace(/-/g, "/"); // yyyy/mm/dd
  const safeName = file.name.replace(/\s+/g, "_");
  const path = `vehicles/${folder}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage
    .from("image_url")
    .upload(path, file, { upsert: false, contentType: file.type || "image/*" });

  if (error) throw error;

  const { data } = supabase.storage.from("image_url").getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Upload nhiều file một lượt.
 * Bỏ qua file null/undefined, lọc trùng & đảm bảo chỉ lấy File thật.
 */
export const uploadFiles = async (files: (File | null | undefined)[]) => {
  const realFiles = files.filter((f): f is File => f instanceof File);
  if (!realFiles.length) return [] as string[];
  const urls = await Promise.all(realFiles.map(uploadFile));
  return urls;
};
