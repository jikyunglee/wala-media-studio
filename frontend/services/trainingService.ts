export interface TrainingResponse {
  status: string;
  message: string;
  file_count: number;
  job_id: string;
}

export const startTraining = async (modelName: string, files: File[]): Promise<TrainingResponse> => {
  const formData = new FormData();
  formData.append("model_name", modelName);
  
  // 모든 파일을 FormData에 추가
  files.forEach((file) => {
    formData.append("files", file); // 중요: backend에서 List[UploadFile]로 받음
  });

  try {
    const response = await fetch("http://localhost:8002/training/start", {
      method: "POST",
      body: formData,
      // Content-Type을 설정하지 않아야 브라우저가 boundary를 자동으로 추가함
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Training failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Training API Error:", error);
    throw error;
  }
};
