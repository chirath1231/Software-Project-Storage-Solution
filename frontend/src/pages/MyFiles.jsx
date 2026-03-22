// src/pages/MyFiles.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Trash2,
  AlertTriangle,
  Upload,
} from "lucide-react";

export default function MyFiles() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [totalStorageGB, setTotalStorageGB] = useState(5);
  const [storageUsed, setStorageUsed] = useState(0);   // percentage
  const [totalUsedGB, setTotalUsedGB] = useState(0);   // number in GB
  const [isStorageFull, setIsStorageFull] = useState(false);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("username");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    initPage();
  }, []);

  // ==========================
  // INIT
  // ==========================
  const initPage = async () => {
    const planGB = await fetchSubscription();
    await fetchFiles(planGB);
  };

  // ==========================
  // FETCH SUBSCRIPTION — same as dashboard
  // ==========================
  const fetchSubscription = async () => {
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
  // FETCH FILES — same as dashboard (api + user_id filter)
  // ==========================
  const fetchFiles = async (storageGB = totalStorageGB) => {
    try {
      const res = await api.get(`/api/files/?user_id=${userId}`);
      const data = res.data;
      setFiles(data);

      // Calculate usage — same as dashboard
      const totalBytes = data.reduce((sum, f) => sum + (f.size || 0), 0);
      const usedGB = totalBytes / 1024 / 1024 / 1024;

      setTotalUsedGB(Math.min(usedGB, storageGB).toFixed(2));

      const percentage = Math.min(
        Math.round((usedGB / storageGB) * 100),
        100
      );
      setStorageUsed(percentage);
      setIsStorageFull(usedGB >= storageGB * 0.99);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        alert("Failed to fetch files.");
      }
    }
  };

  // ==========================
  // STORAGE LIMIT CHECK — same as dashboard
  // ==========================
  const checkStorageLimit = (file) => {
    const MAX_SINGLE_FILE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SINGLE_FILE) {
      return {
        allowed: false,
        message: "File is too large. Maximum single file size is 2GB.",
      };
    }

    const planBytes = totalStorageGB * 1024 * 1024 * 1024;
    const usedBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    const remainingBytes = planBytes - usedBytes;

    if (remainingBytes <= 0) {
      return {
        allowed: false,
        message: `Your storage is full (${totalStorageGB}GB used). Please upgrade your plan to upload more files.`,
      };
    }

    if (file.size > remainingBytes) {
      const remainingMB = (remainingBytes / 1024 / 1024).toFixed(1);
      const fileMB = (file.size / 1024 / 1024).toFixed(1);
      return {
        allowed: false,
        message: `Not enough space! File needs ${fileMB} MB but only ${remainingMB} MB remaining. Upgrade your plan for more storage.`,
      };
    }

    return { allowed: true };
  };

  // ==========================
  // UPLOAD FILE — api instance, no manual token
  // ==========================
  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setUploadError("");

    const check = checkStorageLimit(selectedFile);
    if (!check.allowed) {
      setUploadError(check.message);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await api.post("/api/files/upload/", formData);

      setSelectedFile(null);
      const input = document.getElementById("file-input");
      if (input) input.value = "";

      const planGB = await fetchSubscription();
      await fetchFiles(planGB);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        const serverMsg =
          err.response?.data?.detail || err.response?.data?.error;
        if (
          err.response?.status === 413 ||
          serverMsg?.toLowerCase().includes("storage")
        ) {
          setUploadError(
            serverMsg || "Storage limit exceeded. Please upgrade your plan."
          );
        } else {
          setUploadError(serverMsg || "Upload failed. Please try again.");
        }
      }
    } finally {
      setUploading(false);
    }
  };

  // ==========================
  // DELETE FILE — api instance, no manual token
  // ==========================
  const deleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await api.delete(`/api/files/${id}/`);
      const planGB = await fetchSubscription();
      await fetchFiles(planGB);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        alert("Delete failed.");
      }
    }
  };

  // ==========================
  // FILE ICON
  // ==========================
  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
      return <ImageIcon size={48} className="text-blue-500" />;
    if (["mp4", "mov", "avi", "mkv"].includes(ext))
      return <Video size={48} className="text-purple-500" />;
    if (["pdf", "doc", "docx"].includes(ext))
      return <FileText size={48} className="text-red-500" />;
    return <File size={48} className="text-gray-500" />;
  };

  // ==========================
  // COMPUTED VALUES
  // ==========================
  const remainingGB = Math.max(0, totalStorageGB - Number(totalUsedGB)).toFixed(2);

  const isStorageError =
    uploadError.toLowerCase().includes("full") ||
    uploadError.toLowerCase().includes("space") ||
    uploadError.toLowerCase().includes("storage");

  // ==========================
  // UI
  // ==========================
  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Files</h1>
          <p className="text-gray-500">
            Manage, organize, and share your stored files
          </p>
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <input
              id="file-input"
              type="file"
              onChange={(e) => {
                setUploadError("");
                setSelectedFile(e.target.files[0]);
              }}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 w-full sm:w-auto"
              disabled={isStorageFull}
            />
            <button
              onClick={uploadFile}
              disabled={uploading || isStorageFull || !selectedFile}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition
                ${
                  uploading || isStorageFull || !selectedFile
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
            >
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Upload Error */}
          {uploadError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-600 rounded-lg px-3 py-2 text-xs max-w-sm w-full">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{uploadError}</span>
              {isStorageError && (
                <Link
                  to="/dashboard/subscription"
                  className="ml-1 underline font-semibold whitespace-nowrap text-orange-500"
                >
                  Upgrade →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STORAGE BAR — dashboard method: totalUsedGB / totalStorageGB */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Storage Used</span>
          <span className="text-sm font-semibold text-gray-700">
            {totalUsedGB} GB / {totalStorageGB} GB ({storageUsed}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${storageUsed}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{files.length} files</span>
          <span className="text-xs text-gray-400">
            {remainingGB > 0 ? `${remainingGB} GB free` : "Storage full"}
          </span>
        </div>
      </div>

      {/* STORAGE FULL BANNER */}
      {isStorageFull && (
        <div className="mb-6 bg-red-50 border border-red-300 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={22} />
          <div className="flex-1">
            <p className="text-red-700 font-semibold text-sm">Storage Full</p>
            <p className="text-red-500 text-xs mt-0.5">
              Delete files to free space or upgrade your plan to continue uploading.
            </p>
          </div>
          <Link to="/dashboard/subscription">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-medium transition">
              Upgrade Now
            </button>
          </Link>
        </div>
      )}

      {/* LOADING */}
      {loading && <p className="text-gray-400">Loading files...</p>}

      {/* FILE GRID — original layout from screenshot */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {files.length === 0 && (
            <p className="text-gray-400 col-span-full">No files uploaded yet</p>
          )}

          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="mb-4">{getFileIcon(file.name)}</div>

              <p className="font-medium truncate w-full" title={file.name}>
                {file.name}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>

              {file.uploaded_at && (
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(file.uploaded_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg"
                >
                  Open
                </a>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}