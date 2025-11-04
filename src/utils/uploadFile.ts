import { supabase } from "../config/supabase";

const uploadFile = async (file: File) => {
  if (!file) return null;

  const filePath = `${Date.now()}_${file.name}`; // unique filename

  const { error } = await supabase.storage
    .from("image_url")
    .upload(filePath, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("image_url")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

export default uploadFile;
