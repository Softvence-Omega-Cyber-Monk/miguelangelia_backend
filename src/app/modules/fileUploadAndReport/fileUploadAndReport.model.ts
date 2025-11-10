import mongoose, { Schema, Document, Types } from "mongoose";
import { TFileUploadAndReport } from "./fileUploadAndReport.interface";

const FileUploadAndReportSchema = new Schema<TFileUploadAndReport>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    fileExplore: { type: Object },
    summary: { type: Object },
    report: { type: Object },
    dashboardData: { type: Object },
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
