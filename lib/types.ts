// src/lib/types.ts
export interface Tag {
  tag_id: number;
  tag_name: string;
}

export interface AssetCategory {
  category_id: number;
  category_name: string;
}

export interface Asset {
  asset_id: string;
  asset_name: string;
  description: string;
  file_type: string;
  file_extension: string;
  storage_path: string;
  file_size_bytes: number;
  upload_date: string;
  uploader_id: number;
  category: AssetCategory | null;
  tags: Tag[];
  is_deleted: boolean;
}
