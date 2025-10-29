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

  fileExplore: async (data: { userId: string; file: Express.Multer.File }) => {
    console.log(data.file, data.userId);

    const uploaded = await FileReportService.uploadToCloudinary(data.file.path);
    console.log("cloudnary uploaded link : ", uploaded.secure_url);

    // 3️⃣ Call the AI report API
    const aiReportUrl = `https://financialanalyticalchatbot-5.onrender.com/ai/file-explore?file_url=${encodeURIComponent(
      uploaded.secure_url
    )}`;

    const response1 = await fetch(aiReportUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const fileExplore = await response1.json();
    console.log("🤖 Report AI API response:", fileExplore);

    // const summaryUrl = `https://financialanalyticalchatbot-5.onrender.com/ai/summary?file_url=${encodeURIComponent(
    //   uploaded.secure_url
    // )}`;

    // const response2 = await fetch(summaryUrl, {
    //   method: "POST", // keep POST if API expects it
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // const summaryData = await response2.json();
    // console.log("🤖 Summary AI API response:", summaryData);

    const newReport = await FileUploadAndReportModel.create({
      userId: data.userId,
      fileExplore: fileExplore,
      // summary: summaryData,
      fileUrl: uploaded.secure_url,
      fileName: data.file.originalname,
      fileType: data.file.mimetype,
      fileSize: data.file.size,
    });

    return {
      fileExplore: fileExplore,
      // summary: summaryData,
    };
  },

  getReportAndSummry: async (data: {
    userId: string;
    file: Express.Multer.File;
  }) => {
    console.log(data.file, data.userId);

    const uploaded = await FileReportService.uploadToCloudinary(data.file.path);
    console.log("cloudnary uploaded link : ", uploaded.secure_url);

    // 3️⃣ Call the AI report API
    // const aiReportUrl = `https://financialanalyticalchatbot-5.onrender.com/ai/report-url?file_url=${encodeURIComponent(
    //   uploaded.secure_url
    // )}`;

    // const response1 = await fetch(aiReportUrl, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // const fileExplore = await response1.json();
    // console.log("🤖 Report AI API response:", fileExplore);

    const summaryUrl = `https://financialanalyticalchatbot-5.onrender.com/ai/summary?file_url=${encodeURIComponent(
      uploaded.secure_url
    )}`;

    const response2 = await fetch(summaryUrl, {
      method: "POST", // keep POST if API expects it
      headers: {
        "Content-Type": "application/json",
      },
    });

    const summaryData = await response2.json();
    console.log("🤖 Summary AI API response:", summaryData);

    const newReport = await FileUploadAndReportModel.create({
      userId: data.userId,
      summary: summaryData,
      // summary: summaryData,
      fileUrl: uploaded.secure_url,
      fileName: data.file.originalname,
      fileType: data.file.mimetype,
      fileSize: data.file.size,
    });

    return {
      summary: summaryData,
      // summary: summaryData,
    };
  },

  getAll: async () => {
    return await FileUploadAndReportModel.find().sort({ createdAt: -1 });
  },

  getByUser: async (userId: string) => {
    return await FileUploadAndReportModel.find({ userId });
  },
};
