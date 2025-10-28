import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { FileUploadAndReportModel } from "./fileUploadAndReport.model";
import axios from "axios";

// 🔧 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const FileReportService = {
  uploadToCloudinary: async (filePath: string) => {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw", // ⚡ important for non-image files
      folder: "reports",
    });

    // Remove local temp file
    fs.unlinkSync(filePath);

    return uploadResult;
  },

  create: async (data: { userId: string; file: Express.Multer.File }) => {
    console.log(data.file, data.userId);

    const uploaded = await FileReportService.uploadToCloudinary(data.file.path);
    console.log("cloudnary uploaded link : ", uploaded.secure_url);

    //deleted the local file after upload
    // fs.unlink(data.file.path, (err) => {
    //   if (err) {
    //     console.error("Error deleting temp file:", err);
    //   } else {
    //     console.log("Temp file deleted:", data.file.path);
    //   }
    // });

    const reportResponse = await axios.post(
      "https://financialanalyticalchatbot-5.onrender.com/ai/file-explore",
      {
        fileUrl: uploaded.secure_url, // sending the Cloudinary URL
        userId: data.userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("AI API response:", reportResponse.data);

    const summaryResponse = await axios.post(
      "https://financialanalyticalchatbot-5.onrender.com/ai/summary",
      {
        fileUrl: uploaded.secure_url, // sending the Cloudinary URL
        userId: data.userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("AI API response:", summaryResponse.data);

    // const newReport = await FileUploadAndReportModel.create({
    //   userId: data.userId,
    //   report: reportResponse.data,
    //   summary : summaryResponse.data
    //   fileUrl: uploaded.secure_url,
    //   fileName: data.file.originalname,
    //   fileType: data.file.mimetype,
    //   fileSize: data.file.size,
    // });

    // return {
    //   report: reportResponse.data,
    //   summary: summaryResponse.data,
    // };
  },

  getAll: async () => {
    return await FileUploadAndReportModel.find().sort({ createdAt: -1 });
  },

  getByUser: async (userId: string) => {
    return await FileUploadAndReportModel.find({ userId });
  },
};
