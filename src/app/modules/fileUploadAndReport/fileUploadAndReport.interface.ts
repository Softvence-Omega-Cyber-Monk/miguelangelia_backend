export type TFileUploadAndReport = {
  userId: string;
  fileExplore?: object;
  summary?: object; 
  report?: object;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
};
