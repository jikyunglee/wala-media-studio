export interface Asset {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

const API_BASE_URL = "http://localhost:8002";

export const fetchAssets = async (): Promise<Asset[]> => {
  const response = await fetch(`${API_BASE_URL}/assets/`);
  if (!response.ok) throw new Error("에셋 목록을 불러오지 못했습니다.");
  return response.json();
};

export const uploadAsset = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/assets/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("에셋 업로드에 실패했습니다.");
  return response.json();
};
