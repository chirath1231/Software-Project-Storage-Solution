// src/pages/DashboardHome.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Upload, CheckCircle, XCircle, Loader, AlertTriangle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import UpcomingMeetingsWidget from "../components/UpcomingMeetingsWidget";

export default function DashboardHome() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalUsedGB, setTotalUsedGB] = useState(0);
  const [totalStorageGB, setTotalStorageGB] = useState(5);
  const [loading, setLoading] = useState(true);
  const [isStorageFull, setIsStorageFull] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      initDashboard();
    }
  }, [user]);

  const initDashboard = async () => {
    setLoading(true);
    const storageGB = await fetchUserSubscription();
    await fetchFiles(storageGB);
    await fetchNotifications();
    setLoading(false);
  };

  const fetchUserSubscription = async () => {
    try {
      const res = await api.get(`/api/subscriptions/user-subscriptions/${user.id}/`);
      const payments = res.data;
      const latest = payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const gb = latest?.storage || 5;
      setTotalStorageGB(gb);
      return gb;
    } catch (err) {
      console.error("Error fetching subscription:", err);
      return 5;
    }
  };

  const fetchFiles = async (storageGB = totalStorageGB) => {
    try {
      const res = await api.get(`/api/files/?user_id=${user.id}`);
      const data = res.data;
      const sorted = [...data].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
      setFiles(sorted);
      const totalBytes = data.reduce((sum, file) => sum + (file.size || 0), 0);
      const usedGB = totalBytes / (1024 ** 3);
      setTotalUsedGB(Math.min(usedGB, storageGB).toFixed(2));
      setStorageUsed(Math.min(Math.round((usedGB / storageGB) * 100), 100));
      setIsStorageFull(usedGB >= storageGB * 0.99);
    } catch (error) {
      console.error("Failed to fetch files", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/accounts/notifications/");
      setNotifications(res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    try {
      setUploadStatus("uploading");
      setUploadMessage("Uploading...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/files/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadStatus("success");
      setUploadMessage("File uploaded successfully");
      await fetchFiles();
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error.response?.data?.error || "Upload failed");
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  // Helper to get simple file icons based on extension
  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    const icons = {
      pdf: "📄", jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️",
      mp4: "🎬", mov: "🎬",
      zip: "🗜️", rar: "🗜️",
      doc: "📝", docx: "📝",
      xls: "📊", xlsx: "📊",
    };
    return icons[ext] || "📁";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, <span className="text-orange-500">{user?.username || "User"}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's a quick look at your storage and recent activity</p>
      </div>

      {isStorageFull && (
        <div className="mb-6 bg-red-50 border border-red-300 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={22} />
          <p className="text-red-700 text-sm font-medium">Storage full. Please upgrade your plan to upload more files.</p>
        </div>
      )}

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* --- CARD 1: STORAGE OVERVIEW --- */}
        <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-orange-500 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Storage Overview</h2>
          <div className="flex items-center gap-8">
            {/* Circular Progress */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path stroke="#F3F4F6" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path
                  stroke="#F97316"
                  strokeWidth="4"
                  strokeDasharray={`${storageUsed}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
                {loading ? "..." : `${storageUsed}%`}
              </div>
            </div>

            {/* Storage Text & Upgrade Button */}
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {totalUsedGB} / {totalStorageGB} GB used
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {files.length} files stored
              </p>
              <Link to="/dashboard/subscription">
                <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors">
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${isStorageFull ? "bg-red-500" : "bg-orange-500"}`}
                style={{ width: `${storageUsed}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">
              {isStorageFull ? "Storage full" : `${(totalStorageGB - totalUsedGB).toFixed(2)} GB free`}
            </p>
          </div>
        </div>

        {/* --- CARD 2: QUICK UPLOAD --- */}
        <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-orange-500 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Upload</h2>
          <div
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging ? "border-orange-500 bg-orange-50 scale-[1.02]" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploadStatus === "uploading" ? (
              <Loader className="mx-auto mb-3 text-orange-500 animate-spin" size={40} />
            ) : uploadStatus === "success" ? (
              <CheckCircle className="mx-auto mb-3 text-green-500" size={40} />
            ) : uploadStatus === "error" ? (
              <XCircle className="mx-auto mb-3 text-red-500" size={40} />
            ) : (
              <Upload className={`mx-auto mb-3 ${isDragging ? "text-orange-500" : "text-gray-400"}`} size={40} />
            )}

            <p className="text-gray-800 font-bold text-base">
              {isDragging ? "Drop file to upload" : "Drag & drop your file here"}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              or <span className="text-orange-500 font-medium underline">browse to upload</span> (Max 2GB)
            </p>

            {uploadStatus && (
              <p className={`mt-3 text-sm font-semibold ${
                uploadStatus === "success" ? "text-green-600" : uploadStatus === "error" ? "text-red-500" : "text-orange-500"
              }`}>
                {uploadMessage}
              </p>
            )}
          </div>
        </div>

        {/* --- CARD 3: RECENT FILES --- */}
        <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-orange-500 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Files</h2>
            <Link to="/dashboard/files" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader size={30} className="animate-spin text-orange-500" />
            </div>
          ) : files.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="divide-y divide-gray-100">
                {files.slice(0, 5).map((file) => (
                  <div key={file.id} className="py-4 flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.file_name)}</span>
                      <div>
                        <p className="font-bold text-gray-800 truncate max-w-[200px]">{file.file_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Link
                      to={`/file/${file.id}`}
                      className="text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <span className="text-5xl mb-3">📂</span>
              <p className="text-gray-500 font-medium">No files uploaded yet.</p>
            </div>
          )}
        </div>

       {/* --- CARD 4: UPCOMING MEETINGS --- */}
        <div className="flex flex-col min-h-[350px]">
          <UpcomingMeetingsWidget />
        </div>

      </div>
    </div>
  );
}