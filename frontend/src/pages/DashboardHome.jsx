// src/pages/DashboardHome.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Upload, CheckCircle, XCircle, Loader, AlertTriangle, Bell } from "lucide-react";

export default function DashboardHome() {
  const [files, setFiles] = useState([]);
  const [notifications, setNotifications] = useState([]); // <-- NEW STATE
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalUsedGB, setTotalUsedGB] = useState(0);
  const [totalStorageGB, setTotalStorageGB] = useState(5);
  const [loading, setLoading] = useState(true);
  const [isStorageFull, setIsStorageFull] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef(null);

  const userEmail = localStorage.getItem("username");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    setLoading(true);
    const storageGB = await fetchUserSubscription();
    await fetchFiles(storageGB);
    await fetchNotifications(); // <-- ADDED TO INIT
    setLoading(false);
  };

  // ==========================
  // FETCH SUBSCRIPTION
  // ==========================
  const fetchUserSubscription = async () => {
    if (!userEmail) return 5;
    try {
      const res = await api.get(
        `/api/subscriptions/user-subscriptions/${encodeURIComponent(userEmail)}/`
      );
      const payments = res.data;
      const latest = payments.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )[0];
      const gb = latest?.storage || 5;
      setTotalStorageGB(gb);
      return gb;
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setTotalStorageGB(5);
      return 5;
    }
  };

  // ==========================
  // FETCH FILES
  // ==========================
  const fetchFiles = async (storageGB = totalStorageGB) => {
    console.log(userId);
    if(!userId){
      setFiles([]);
      setStorageUsed(0);
      setTotalStorageGB(0);
      setIsStorageFull(false);
      return;
    }
    
    try {
      const res = await api.get(`/api/files/?user_id=${userId}`);
      const data = res.data;

      const sorted = [...data].sort(
        (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
      );
      setFiles(sorted);

      const totalBytes = data.reduce((sum, file) => sum + (file.size || 0), 0);
      const usedGB = totalBytes / 1024 / 1024 / 1024;

      setTotalUsedGB(Math.min(usedGB, storageGB).toFixed(2));

      const percentage = Math.min(
        Math.round((usedGB / storageGB) * 100),
        100
      );
      setStorageUsed(percentage);

      setIsStorageFull(usedGB >= storageGB * 0.99);
    } catch (error) {
      console.error("Failed to fetch files", error);
    }
  };

  // ==========================
  // FETCH NOTIFICATIONS (NEW)
  // ==========================
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/accounts/notifications/");
      // Sort newest first
      const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(sorted);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  // ==========================
  // STORAGE LIMIT CHECK
  // ==========================
  const checkStorageLimit = (file, currentFiles, planGB) => {
    const MAX_SINGLE_FILE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SINGLE_FILE) {
      return { allowed: false, message: `File is too large. Maximum single file size is 2GB.` };
    }

    const planBytes = planGB * 1024 * 1024 * 1024;
    const usedBytes = currentFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    const remainingBytes = planBytes - usedBytes;

    if (remainingBytes <= 0) {
      return { allowed: false, message: `Your storage is full (${planGB}GB used). Please upgrade your plan to upload more files.` };
    }

    if (file.size > remainingBytes) {
      const remainingMB = (remainingBytes / 1024 / 1024).toFixed(1);
      const fileMB = (file.size / 1024 / 1024).toFixed(1);
      return { allowed: false, message: `Not enough space! File needs ${fileMB} MB but only ${remainingMB} MB remaining. Upgrade your plan for more storage.` };
    }

    return { allowed: true };
  };

  // ==========================
  // UPLOAD LOGIC
  // ==========================
  const uploadFile = async (file) => {
    if (!file) return;

    const check = checkStorageLimit(file, files, totalStorageGB);
    if (!check.allowed) {
      setUploadStatus("limit");
      setUploadMessage(check.message);
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage(`Uploading "${file.name}"...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/api/files/upload/", formData);

      setUploadStatus("success");
      setUploadMessage(`"${file.name}" uploaded successfully!`);

      const storageGB = await fetchUserSubscription();
      await fetchFiles(storageGB);

      setTimeout(() => {
        setUploadStatus(null);
        setUploadMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.detail || err.response?.data?.error;
      if (err.response?.status === 413 || serverMsg?.toLowerCase().includes("storage")) {
        setUploadStatus("limit");
        setUploadMessage(serverMsg || "Storage limit exceeded. Please upgrade your plan.");
      } else {
        setUploadStatus("error");
        setUploadMessage(serverMsg || "Upload failed. Please try again.");
      }
    }
  };

  // ==========================
  // DRAG & DROP HANDLERS
  // ==========================
  const handleDragOver = (e) => {
    e.preventDefault();
    if (uploadStatus !== "uploading" && !isStorageFull) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) uploadFile(dropped);
  };

  const handleBrowse = (e) => {
    const selected = e.target.files[0];
    if (selected) uploadFile(selected);
    e.target.value = "";
  };

  const handleZoneClick = () => {
    if (uploadStatus === "uploading") return;
    setUploadStatus(null);
    setUploadMessage("");
    fileInputRef.current.click();
  };

  // ==========================
  // HELPERS
  // ==========================
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    const icons = {
      pdf: "📄", jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️",
      mp4: "🎬", mov: "🎬", avi: "🎬",
      mp3: "🎵", wav: "🎵",
      zip: "🗜️", rar: "🗜️",
      doc: "📝", docx: "📝",
      xls: "📊", xlsx: "📊",
      txt: "📃",
    };
    return icons[ext] || "📁";
  };

  const recentFiles = files.slice(0, 5);
  // Grab top 4 notifications for the dashboard widget
  const recentNotifications = notifications.slice(0, 4); 

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, <span className="text-orange-500">User</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's a quick look at your storage and recent activity
        </p>
      </div>

      {/* Storage Full Banner */}
      {isStorageFull && (
        <div className="mb-6 bg-red-50 border border-red-300 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={22} />
          <div className="flex-1">
            <p className="text-red-700 font-semibold text-sm">Storage Full</p>
            <p className="text-red-500 text-xs mt-0.5">
              You've used all {totalStorageGB}GB of your storage. Delete files or upgrade your plan to continue uploading.
            </p>
          </div>
          <Link to="/dashboard/subscription">
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-medium transition">
              Upgrade Now
            </button>
          </Link>
        </div>
      )}

      {/* Storage Overview + Quick Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* ── Storage Overview ── */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <h2 className="text-lg font-semibold mb-6">Storage Overview</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path stroke="#E5E7EB" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path stroke="#F97316" strokeWidth="3" strokeDasharray={`${storageUsed}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {loading ? "..." : `${storageUsed}%`}
              </div>
            </div>

            <div>
              <p className="text-xl font-semibold">
                {totalUsedGB} / {totalStorageGB} GB used
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {files.length} file{files.length !== 1 ? "s" : ""} stored
              </p>
              <Link to="/dashboard/subscription">
                <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm transition">
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${storageUsed}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {totalStorageGB - totalUsedGB > 0
                ? `${(totalStorageGB - totalUsedGB).toFixed(2)} GB free`
                : "Storage full"}
            </p>
          </div>
        </div>

        {/* ── Quick Upload ── */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <h2 className="text-lg font-semibold mb-4">Quick Upload</h2>
          {isStorageFull && uploadStatus !== "uploading" ? (
            <div className="border-2 border-dashed border-red-300 bg-red-50 rounded-xl p-10 text-center">
              <div className="flex justify-center mb-3">
                <AlertTriangle size={40} className="text-red-400" />
              </div>
              <p className="text-base font-semibold text-red-600">Storage Full</p>
              <p className="text-sm text-red-400 mt-1">
                You've reached your {totalStorageGB}GB limit.
              </p>
              <Link to="/dashboard/subscription">
                <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm transition">
                  Upgrade Plan
                </button>
              </Link>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleZoneClick}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all select-none
                ${uploadStatus === "uploading" ? "cursor-not-allowed opacity-70 border-gray-300"
                  : uploadStatus === "limit" ? "border-red-400 bg-red-50 cursor-pointer"
                  : isDragging ? "border-orange-500 bg-orange-50 scale-[1.02] cursor-copy"
                  : "border-gray-300 hover:border-orange-400 hover:bg-gray-50 cursor-pointer"
                }
              `}
            >
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleBrowse} />

              <div className="flex justify-center mb-3">
                {uploadStatus === "uploading" ? <Loader size={40} className="text-orange-500 animate-spin" />
                  : uploadStatus === "success" ? <CheckCircle size={40} className="text-green-500" />
                  : uploadStatus === "limit" ? <AlertTriangle size={40} className="text-red-500" />
                  : uploadStatus === "error" ? <XCircle size={40} className="text-red-500" />
                  : <Upload size={40} className={isDragging ? "text-orange-500" : "text-gray-400"} />
                }
              </div>

              {uploadStatus === null && (
                <>
                  <p className="text-base font-semibold text-gray-700">
                    {isDragging ? "Release to upload!" : "Drag & drop your file here"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    or <span className="text-orange-500 font-medium underline">browse to upload</span> (Max 2GB)
                  </p>
                </>
              )}

              {uploadStatus === "uploading" && (
                <p className="text-sm font-medium text-orange-500 mt-1">
                  {uploadMessage}
                </p>
              )}

              {uploadStatus === "success" && (
                <p className="text-sm font-medium text-green-600 mt-1">
                  {uploadMessage}
                </p>
              )}

              {uploadStatus === "uploading" && <p className="text-sm font-medium text-orange-500 mt-1">{uploadMessage}</p>}
              {uploadStatus === "success" && <p className="text-sm font-medium text-green-600 mt-1">{uploadMessage}</p>}
              {uploadStatus === "limit" && (
                <>
                  <p className="text-sm font-medium text-red-600 mt-1">{uploadMessage}</p>
                  <Link to="/dashboard/subscription" onClick={(e) => e.stopPropagation()}>
                    <button className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-5 py-1.5 rounded-full text-xs transition">
                      Upgrade Plan
                    </button>
                  </Link>
                </>
              )}
              {uploadStatus === "error" && (
                <>
                  <p className="text-sm font-medium text-red-500 mt-1">{uploadMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">Click to try again</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid for Notifications & Recent Files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ── Notifications Widget ── */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Notifications</h2>
            <Link to="/dashboard/notifications">
              <button className="bg-orange-500 hover:bg-orange-600 transition text-white px-4 py-1.5 rounded-full text-sm font-medium">
                See All
              </button>
            </Link>
          </div>
          
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
          ) : recentNotifications.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center py-6 text-gray-400">
              <Bell size={40} className="text-gray-300 mb-3" />
              <p>You're all caught up!</p>
              <p className="text-xs mt-1">No new notifications.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              {recentNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 rounded-xl border transition-colors ${
                    !notif.is_read ? 'bg-orange-50/50 border-orange-200' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-gray-800 pr-2">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5 shadow-sm"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Files ── */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Files</h2>
            <Link
              to="/dashboard/files"
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm text-center py-6">Loading files...</p>
          ) : recentFiles.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center py-6 text-gray-400">
              <p className="text-4xl mb-2">📂</p>
              <p>No files uploaded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-400 border-b">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Size</th>
                    <th className="pb-3 font-medium">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getFileIcon(file.name)}</span>
                          <span className="truncate max-w-[150px] sm:max-w-xs font-medium text-gray-700">
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-2 text-gray-500 whitespace-nowrap">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="py-3 text-gray-500 whitespace-nowrap">
                        {file.uploaded_at
                          ? new Date(file.uploaded_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}