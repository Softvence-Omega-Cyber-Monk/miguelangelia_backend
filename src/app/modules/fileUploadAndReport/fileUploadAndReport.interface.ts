import { Types } from "mongoose";

export type TFileUploadAndReport = {
  userId: Types.ObjectId | string;
  fileExplore?: object;
  summary?: object; 
  report?: object;
  dashboardData?: object;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
};
