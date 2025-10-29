import mongoose, { Schema, Document } from "mongoose";
import { TFileUploadAndReport } from "./fileUploadAndReport.interface";

const FileUploadAndReportSchema = new Schema<TFileUploadAndReport>(
  {
    userId: { type: String, required: true },
    fileExplore: { type: Object, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
  },
  { timestamps: true }
);

export const FileUploadAndReportModel = mongoose.model<TFileUploadAndReport>(
  "FileUploadAndReport",
  FileUploadAndReportSchema
);
