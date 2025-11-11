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
    const aiReportUrl = `https://financialanalyticalchatbot-9osk.onrender.com/ai/file-explore?file_url=${encodeURIComponent(
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

    const newReport = await FileUploadAndReportModel.create({
      userId: data.userId,
      fileExplore: fileExplore,
      fileUrl: uploaded.secure_url,
      fileName: data.file.originalname,
      fileType: data.file.mimetype,
      fileSize: data.file.size,
    });

    return {
      data: newReport,
    };
  },

  getReportAndSummry: async (data: {
    userId: string;
    fileId?: string;
    file: Express.Multer.File;
  }) => {
    const uploaded = await FileReportService.uploadToCloudinary(data.file.path);
    console.log("cloudnary uploaded link : ", uploaded.secure_url);

    const summaryUrl = `https://financialanalyticalchatbot-9osk.onrender.com/ai/summary?file_url=${encodeURIComponent(
      uploaded.secure_url
    )}`;

    const response2 = await fetch(summaryUrl, {
      method: "POST", // keep POST if API expects it
      headers: {
        "Content-Type": "application/json",
      },
    });

    const summaryData = await response2.json();
    // console.log("🤖 Summary AI API response:", summaryData);

    // 3️⃣ Call the AI report API
    const aiReportUrl = `https://financialanalyticalchatbot-9osk.onrender.com/ai/generate-report`;

    const response1 = await fetch(aiReportUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_url: uploaded.secure_url }),
    });

    const report = await response1.json();
    // console.log("🤖 Report AI API response:", report);

    const DashboardDataUrl = `https://financialanalyticalchatbot-9osk.onrender.com/ai/generate-dashboard?file_url=${encodeURIComponent(
      uploaded.secure_url
    )}`;

    const response3 = await fetch(DashboardDataUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_url: uploaded.secure_url }),
    });

    const DashboardData = await response3.json();
    console.log("🤖 Dashboard data API response:", DashboardData);

    let newFileReport;
    if (data.fileId) {
      newFileReport = await FileUploadAndReportModel.findByIdAndUpdate(
        data.fileId,
        {
          summary: summaryData,
          report: report,
          dashboardData: DashboardData,
        },
        { new: true }
      );
    } else {
      newFileReport = await FileUploadAndReportModel.create({
        userId: data.userId,
        fileUrl: uploaded.secure_url,
        summary: summaryData,
        report: report,
        dashboardData: DashboardData,
        fileName: data.file.originalname,
        fileType: data.file.mimetype,
        fileSize: data.file.size,
      });
    }

    return {
      _id: newFileReport?._id || null,
      fileName: newFileReport?.fileName,
      summary: summaryData,
      report: report,
      dashboardData: DashboardData,
    };
  },

  getAllReports: async () => {
    return await FileUploadAndReportModel.find()
      .sort({
        createdAt: -1,
      })
      .select("fileName  createdAt")
      .populate("userId", "name email");
  },
  getAllReportsByUser: async (userId: string) => {
    const res = await FileUploadAndReportModel.find({ userId: userId }).sort({
      createdAt: -1,
    });
    return res;
  },

  getSummaryReportAndDashboardDataByUser: async (fileId: string) => {
    // console.log('file id ', fileId);
    return await FileUploadAndReportModel.findOne({ _id: fileId }).select(
      "summary report dashboardData fileName _id"
    );
  },
  deleteFile: async (fileId: string) => {
    // console.log('file id ', fileId);

    const res = await FileUploadAndReportModel.deleteOne({ _id: fileId });
    console.log(res);
    return res;
  },

  async getAnalytics(query: any) {
    const { userId, year } = query;

    const match: any = {};

    if (userId) match.userId = userId;

    if (year) {
      match.createdAt = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    // ✅ Monthly
    const monthly = await FileUploadAndReportModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalUploads: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // ✅ Quarterly
    const quarterly = await FileUploadAndReportModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
          },
          totalUploads: { $sum: 1 },
        },
      },
      { $sort: { "_id.quarter": 1 } },
    ]);

    // ✅ Yearly
    const yearly = await FileUploadAndReportModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: "$createdAt" } },
          totalUploads: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1 } },
    ]);

    return {
      monthly,
      quarterly,
      yearly,
    };
  },

  
};
