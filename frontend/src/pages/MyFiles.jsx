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
  X,
  Download,
  ExternalLink,
  Music,
  Code,
  Grid,
  List,
} from "lucide-react";

// --- 1. IMPORT GLOBAL NOTIFICATIONS ---
import { useNotifications } from '../context/NotificationContext';

export default function MyFiles() {
  // --- 2. HOOK INTO THE GLOBAL BRAIN ---
  const { fetchGlobalNotifications } = useNotifications();

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [totalStorageGB, setTotalStorageGB] = useState(5);
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalUsedGB, setTotalUsedGB] = useState(0);
  const [isStorageFull, setIsStorageFull] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

<<<<<<< HEAD
  const [openMenuId, setOpenMenuId] = useState(null); // tracks which file's menu is open
  const [shareExpiry, setShareExpiry] = useState("");
=======
  // Preview modal
  const [previewFile, setPreviewFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [textLoading, setTextLoading] = useState(false);
>>>>>>> 033a4415673509957acf845880283bc658bc5224

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("username");

  useEffect(() => { initPage(); }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") closePreview(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!previewFile) return;
    const type = getFileType(previewFile.name);
    if (type === "text" || type === "code" || type === "html") {
      fetchTextContent(previewFile.url);
    }
  }, [previewFile]);

  const closePreview = () => {
    setPreviewFile(null);
    setTextContent("");
  };

  const fetchTextContent = async (url) => {
    setTextLoading(true);
    try {
      const res = await fetch(url);
      const text = await res.text();
      setTextContent(text);
    } catch {
      setTextContent("Failed to load file content.");
    } finally {
      setTextLoading(false);
    }
  };

  const initPage = async () => {
    const planGB = await fetchSubscription();
    await fetchFiles(planGB);
  };

  const fetchSubscription = async () => {
    if (!userEmail) return 5;
    try {
      const res = await api.get(
        `/api/subscriptions/user-subscriptions/${encodeURIComponent(userEmail)}/`
      );
      const payments = res.data;
      const latest = payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const gb = latest?.storage || 5;
      setTotalStorageGB(gb);
      return gb;
    } catch {
      setTotalStorageGB(5);
      return 5;
    }
  };

  const fetchFiles = async (storageGB = totalStorageGB) => {
    try {
      const res = await api.get("/api/?user_id=${userId}");
      const data = res.data;
      setFiles(data);
      const totalBytes = data.reduce((sum, f) => sum + (f.size || 0), 0);
      const usedGB = totalBytes / 1024 / 1024 / 1024;
      setTotalUsedGB(Math.min(usedGB, storageGB).toFixed(2));
      const percentage = Math.min(Math.round((usedGB / storageGB) * 100), 100);
      setStorageUsed(percentage);
      setIsStorageFull(usedGB >= storageGB * 0.99);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      else alert("Failed to fetch files.");
    }
  };

  const checkStorageLimit = (file) => {
    const MAX_SINGLE_FILE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SINGLE_FILE)
      return { allowed: false, message: "File is too large. Maximum single file size is 2GB." };
    const planBytes = totalStorageGB * 1024 * 1024 * 1024;
    const usedBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    const remainingBytes = planBytes - usedBytes;
    if (remainingBytes <= 0)
      return { allowed: false, message: `Your storage is full (${totalStorageGB}GB used). Please upgrade your plan.` };
    if (file.size > remainingBytes) {
      const remainingMB = (remainingBytes / 1024 / 1024).toFixed(1);
      const fileMB = (file.size / 1024 / 1024).toFixed(1);
      return { allowed: false, message: `Not enough space! File needs ${fileMB} MB but only ${remainingMB} MB remaining.` };
    }
    return { allowed: true };
  };

  const uploadFile = async () => {
    if (!selectedFile) { alert("Please select a file first"); return; }
    setUploadError("");
    const check = checkStorageLimit(selectedFile);
    if (!check.allowed) { setUploadError(check.message); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await api.post("/api/upload/", formData);
      setSelectedFile(null);
      const input = document.getElementById("file-input");
      if (input) input.value = "";
      const planGB = await fetchSubscription();
      await fetchFiles(planGB);

      // --- 3. TRIGGER REFRESH AFTER UPLOAD ---
      fetchGlobalNotifications();

    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      else {
        const serverMsg = err.response?.data?.detail || err.response?.data?.error;
        setUploadError(serverMsg || "Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Move this file to Trash?")) return;
    try {
      await api.delete(`/api/${id}/trash/`);
      const planGB = await fetchSubscription();
      await fetchFiles(planGB);

      // --- 4. TRIGGER REFRESH AFTER DELETE ---
      fetchGlobalNotifications();

    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      else alert("Delete failed.");
    }
  };

  // ==========================
  // FILE TYPE DETECTION
  // ==========================
  const getFileType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) return "image";
    if (["mp4", "mov", "avi", "mkv", "webm", "ogg"].includes(ext)) return "video";
    if (["mp3", "wav", "aac", "flac", "m4a"].includes(ext)) return "audio";
    if (ext === "pdf") return "pdf";
    if (["html", "htm"].includes(ext)) return "html";
    if (["txt", "md", "log", "csv", "xml", "yaml", "yml", "ini", "env"].includes(ext)) return "text";
    if (["js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "cs", "php",
         "rb", "go", "rs", "swift", "kt", "json", "css", "scss", "sh", "sql"].includes(ext)) return "code";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["xls", "xlsx"].includes(ext)) return "excel";
    if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) return "archive";
    return "other";
  };

  // ==========================
  // THUMBNAIL CONFIG
  // ==========================
  const FILE_TYPE_CONFIG = {
    image:   { bg: "bg-blue-50",   accent: "#3b82f6", label: "IMAGE",   icon: <ImageIcon size={28} className="text-blue-400" /> },
    video:   { bg: "bg-purple-50", accent: "#8b5cf6", label: "VIDEO",   icon: <Video size={28} className="text-purple-400" /> },
    audio:   { bg: "bg-pink-50",   accent: "#ec4899", label: "AUDIO",   icon: <Music size={28} className="text-pink-400" /> },
    pdf:     { bg: "bg-red-50",    accent: "#ef4444", label: "PDF",     icon: <FileText size={28} className="text-red-400" /> },
    html:    { bg: "bg-orange-50", accent: "#f97316", label: "HTML",    icon: <Code size={28} className="text-orange-400" /> },
    text:    { bg: "bg-gray-50",   accent: "#6b7280", label: "TXT",     icon: <FileText size={28} className="text-gray-400" /> },
    code:    { bg: "bg-green-50",  accent: "#22c55e", label: "CODE",    icon: <Code size={28} className="text-green-400" /> },
    word:    { bg: "bg-blue-50",   accent: "#1d4ed8", label: "WORD",    icon: <FileText size={28} className="text-blue-700" /> },
    excel:   { bg: "bg-emerald-50",accent: "#059669", label: "EXCEL",   icon: <FileText size={28} className="text-emerald-600" /> },
    archive: { bg: "bg-yellow-50", accent: "#eab308", label: "ZIP",     icon: <File size={28} className="text-yellow-500" /> },
    other:   { bg: "bg-gray-50",   accent: "#9ca3af", label: "FILE",    icon: <File size={28} className="text-gray-400" /> },
  };

  const getConfig = (fileName) => FILE_TYPE_CONFIG[getFileType(fileName)] || FILE_TYPE_CONFIG.other;

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "";

  // ==========================
  // THUMBNAIL RENDERER
  // ==========================
  const FileThumbnail = ({ file }) => {
    const type = getFileType(file.name);
    const config = getConfig(file.name);

    // Image — actual preview
    if (type === "image") {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentNode.classList.add("fallback-thumb");
            }}
          />
        </div>
      );
    }

    // Video — video element (shows first frame, muted)
    if (type === "video") {
      return (
        <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative">
          <video
            src={file.url}
            muted
            preload="metadata"
            className="w-full h-full object-cover"
            onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    // PDF — mini iframe preview
    if (type === "pdf") {
      return (
        <div className="w-full h-full bg-red-50 relative overflow-hidden">
          <iframe
            src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            title={file.name}
            className="w-full h-full border-0 pointer-events-none"
            style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
          />
          {/* overlay to block iframe interaction on thumbnail */}
          <div className="absolute inset-0" />
          <div className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            PDF
          </div>
        </div>
      );
    }

    // Audio — waveform-style visual
    if (type === "audio") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex flex-col items-center justify-center gap-2">
          <Music size={32} className="text-pink-400" />
          <div className="flex items-end gap-0.5 h-6">
            {[4, 7, 5, 9, 6, 8, 4, 7, 5, 6, 8, 5].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-pink-300 rounded-full"
                style={{ height: `${h * 3}px`, opacity: 0.7 + (i % 3) * 0.1 }}
              />
            ))}
          </div>
        </div>
      );
    }

    // Code — mini code lines visual
    if (type === "code" || type === "html") {
      const accentClass = type === "code" ? "bg-green-200" : "bg-orange-200";
      const lineClass  = type === "code" ? "bg-green-100" : "bg-orange-100";
      return (
        <div className={`w-full h-full ${type === "code" ? "bg-green-50" : "bg-orange-50"} p-3 flex flex-col gap-1.5 overflow-hidden`}>
          <div className="flex gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-300" />
            <div className="w-2 h-2 rounded-full bg-yellow-300" />
            <div className="w-2 h-2 rounded-full bg-green-300" />
          </div>
          {[70, 45, 85, 30, 60, 50, 75, 35].map((w, i) => (
            <div key={i} className="flex gap-1 items-center">
              <div className="text-[8px] text-gray-300 w-3 text-right">{i + 1}</div>
              <div
                className={`h-1.5 rounded-sm ${i % 3 === 0 ? accentClass : lineClass}`}
                style={{ width: `${w}%` }}
              />
            </div>
          ))}
        </div>
      );
    }

    // Text / CSV / Markdown — lined paper effect
    if (type === "text") {
      return (
        <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 overflow-hidden border-l-4 border-gray-200">
          {[80, 65, 90, 55, 75, 40, 85, 60].map((w, i) => (
            <div key={i} className="h-1.5 bg-gray-200 rounded-sm" style={{ width: `${w}%` }} />
          ))}
        </div>
      );
    }

    // Word doc
    if (type === "word") {
      return (
        <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 overflow-hidden border-t-4 border-blue-600">
          <div className="h-2 bg-blue-600 rounded-sm w-1/2 mb-1" />
          {[90, 70, 85, 60, 75, 50, 80].map((w, i) => (
            <div key={i} className="h-1.5 bg-gray-200 rounded-sm" style={{ width: `${w}%` }} />
          ))}
        </div>
      );
    }

    // Excel
    if (type === "excel") {
      return (
        <div className="w-full h-full bg-white p-2 flex flex-col gap-0.5 overflow-hidden border-t-4 border-emerald-500">
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 rounded-sm ${i % 4 === 0 ? "bg-emerald-200" : "bg-gray-100"} border border-gray-200`}
              />
            ))}
          </div>
        </div>
      );
    }

    // Archive
    if (type === "archive") {
      return (
        <div className="w-full h-full bg-yellow-50 flex flex-col items-center justify-center gap-1">
          <div className="relative">
            <div className="w-12 h-10 bg-yellow-200 rounded-sm" />
            <div className="absolute -top-1 left-2 w-5 h-2 bg-yellow-300 rounded-t-sm" />
            <div className="absolute top-2 left-0 right-0 flex flex-col gap-1 px-2">
              {[100, 80, 90].map((w, i) => (
                <div key={i} className="h-1 bg-yellow-400 rounded-sm opacity-60" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          <span className="text-[9px] font-bold text-yellow-600 tracking-widest mt-1">
            {file.name.split(".").pop().toUpperCase()}
          </span>
        </div>
      );
    }

    // Fallback generic icon card
    return (
      <div className={`w-full h-full ${config.bg} flex flex-col items-center justify-center gap-2`}>
        {config.icon}
        <span className="text-[10px] font-bold tracking-widest" style={{ color: config.accent }}>
          {file.name.split(".").pop().toUpperCase()}
        </span>
      </div>
    );
  };

  // ==========================
  // GRID CARD
  // ==========================
  const FileCard = ({ file }) => {
    const [hovered, setHovered] = useState(false);

    return (
      <div
        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setPreviewFile(file)}
      >
        {/* Thumbnail area */}
        <div className="relative w-full" style={{ height: 140 }}>
          <FileThumbnail file={file} />
          {/* Hover overlay with quick actions */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-150 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <button
              onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow transition"
            >
              Preview
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
              className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-lg shadow transition"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Info row */}
        <div className="px-3 py-2.5 flex items-center gap-2 border-t border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatSize(file.size)}
              {file.uploaded_at && <span> · {formatDate(file.uploaded_at)}</span>}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ==========================
  // LIST ROW
  // ==========================
  const FileRow = ({ file }) => {
    const config = getConfig(file.name);
    const type = getFileType(file.name);

    return (
      <div
        className="group flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        onClick={() => setPreviewFile(file)}
      >
        {/* Mini thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
          {type === "image" ? (
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className={`w-full h-full ${config.bg} flex items-center justify-center`}>
              <span className="text-[9px] font-bold" style={{ color: config.accent }}>
                {file.name.split(".").pop().toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">{formatDate(file.uploaded_at)}</p>
        </div>

        <div className="text-xs text-gray-400 w-20 text-right hidden sm:block">
          {formatSize(file.size)}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); window.open(file.url, "_blank"); }}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
            className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  // ==========================
  // PREVIEW MODAL RENDERER
  // ==========================
  const renderPreview = (file) => {
    const type = getFileType(file.name);

    if (type === "image") {
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <img src={file.url} alt={file.name} className="max-w-full max-h-[65vh] object-contain rounded-lg shadow" />
        </div>
      );
    }
    if (type === "video") {
      return (
        <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden">
          <video controls autoPlay className="max-w-full max-h-[65vh] rounded-lg">
            <source src={file.url} />
          </video>
        </div>
      );
    }
    if (type === "audio") {
      return (
        <div className="flex flex-col items-center gap-8 py-12">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shadow-inner">
            <Music size={48} className="text-pink-500" />
          </div>
          <audio controls autoPlay className="w-full max-w-lg">
            <source src={file.url} />
          </audio>
        </div>
      );
    }
    if (type === "pdf") {
      return (
        <iframe
          src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1`}
          title={file.name}
          className="w-full rounded-lg border-0"
          style={{ height: "68vh" }}
        />
      );
    }
    if (type === "html") {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-600">
            <Code size={13} /> Rendered HTML preview — sandboxed for safety
          </div>
          <iframe src={file.url} title={file.name} sandbox="allow-scripts allow-same-origin"
            className="w-full rounded-lg border border-gray-200" style={{ height: "60vh" }} />
        </div>
      );
    }
    if (type === "text" || type === "code") {
      const ext = file.name.split(".").pop().toLowerCase();
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-2">
            <span className="text-xs text-gray-400 font-mono">{file.name}</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">.{ext}</span>
          </div>
          <div className="bg-gray-900 rounded-b-lg overflow-auto" style={{ maxHeight: "60vh" }}>
            {textLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <pre className="text-sm text-gray-100 font-mono p-4 whitespace-pre-wrap break-words leading-relaxed">
                {textContent || "File is empty."}
              </pre>
            )}
          </div>
        </div>
      );
    }
    if (type === "word" || type === "excel") {
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-600">
            <FileText size={13} /> Powered by Microsoft Office Online viewer
          </div>
          <iframe src={officeUrl} title={file.name} className="w-full rounded-lg border border-gray-200" style={{ height: "65vh" }} />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <File size={44} className="text-gray-300" />
        <div className="text-center">
          <p className="text-gray-700 font-semibold text-lg">{file.name}</p>
          <p className="text-gray-400 text-sm mt-1">Preview is not available for this file type.</p>
        </div>
        <a href={file.url} download className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
          <Download size={16} /> Download File
        </a>
      </div>
    );
  };

  const remainingGB = Math.max(0, totalStorageGB - Number(totalUsedGB)).toFixed(2);
  const isStorageError =
    uploadError.toLowerCase().includes("full") ||
    uploadError.toLowerCase().includes("space") ||
    uploadError.toLowerCase().includes("storage");

  return (
    <div className="p-6">

      {/* PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={closePreview}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
            style={{ maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  {getFileType(previewFile.name) === "image" ? (
                    <img src={previewFile.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full ${getConfig(previewFile.name).bg} flex items-center justify-center`}>
                      <span className="text-[8px] font-bold" style={{ color: getConfig(previewFile.name).accent }}>
                        {previewFile.name.split(".").pop().toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-sm">{previewFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatSize(previewFile.size)}
                    {previewFile.uploaded_at && <span> · {formatDate(previewFile.uploaded_at)}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <a href={previewFile.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
                  <ExternalLink size={13} /> Open tab
                </a>
                <a href={previewFile.url} download
                  className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition">
                  <Download size={13} /> Download
                </a>
                <button onClick={closePreview} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition ml-1">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5 bg-gray-50">
              {renderPreview(previewFile)}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Files</h1>
          <p className="text-gray-500">Manage, organize, and share your stored files</p>
        </div>
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <input
              id="file-input"
              type="file"
              onChange={(e) => { setUploadError(""); setSelectedFile(e.target.files[0]); }}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 w-full sm:w-auto"
              disabled={isStorageFull}
            />
            <button
              onClick={uploadFile}
              disabled={uploading || isStorageFull || !selectedFile}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition
                ${uploading || isStorageFull || !selectedFile ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
            >
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          {uploadError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-600 rounded-lg px-3 py-2 text-xs max-w-sm w-full">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{uploadError}</span>
              {isStorageError && (
                <Link to="/dashboard/subscription" className="ml-1 underline font-semibold whitespace-nowrap text-orange-500">
                  Upgrade →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STORAGE BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Storage Used</span>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white shadow text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white shadow text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List size={14} />
              </button>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {totalUsedGB} GB / {totalStorageGB} GB ({storageUsed}%)
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${storageUsed}%` }} />
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
            <p className="text-red-500 text-xs mt-0.5">Delete files to free space or upgrade your plan.</p>
          </div>
          <Link to="/dashboard/subscription">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-medium transition">
              Upgrade Now
            </button>
          </Link>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex items-center gap-3 text-gray-400 py-8">
          <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Loading files...
        </div>
      )}

      {/* FILE GRID / LIST */}
      {!loading && (
<<<<<<< HEAD
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {files.length === 0 && (
            <p className="text-gray-400 col-span-full">No files uploaded yet</p>
          )}

          {files.map((file) => {
            return (
            <div
              key={file.id}
              className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center relative"
            >
              {/* File Icon */}
              <div className="mb-4">{getFileIcon(file.name)}</div>

              {/* File Name */}
              <p className="font-medium truncate w-full" title={file.name}>
                {file.name}
              </p>

              {/* File Size */}
              <p className="text-xs text-gray-400 mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>

              {/* Uploaded Date */}
              {file.uploaded_at && (
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(file.uploaded_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 relative">
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

                {/* 3 Dots Menu */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === file.id ? null : file.id)
                    }
                    className="text-gray-500 hover:text-gray-700 px-2 py-1 text-lg font-bold"
                  >
                    ⋮
                  </button>

                  {openMenuId === file.id && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-10 p-2">
                      {/* Expiry Input */}
                      <label className="text-xs text-gray-500 mb-1 block">Expiry Date:</label>
                      <input
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded px-2 py-1 mb-2 text-sm"
                        value={shareExpiry}
                        onChange={(e) => setShareExpiry(e.target.value)}
                      />
                      <button
                        onClick={async () => {
                          if (!shareExpiry) {
                            alert("Please select expiry date");
                            return;
                          }

                          try {
                            const res = await api.post(`/api/files/${file.id}/share/`, {
                              expiry_date: shareExpiry,
                            });

                            navigator.clipboard.writeText(res.data.url);
                            alert(
                              "Sharable URL copied! It will expire at " +
                                new Date(res.data.expiry).toLocaleString()
                            );

                            setOpenMenuId(null);
                            setShareExpiry("");

                            // --- 5. TRIGGER REFRESH AFTER SHARE ---
                            fetchGlobalNotifications();

                          } catch (err) {
                            console.error(err);
                            alert(err.response?.data?.error || "Failed to generate link");
                          }
                        }}
                        className="block w-full text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded"
                      >
                        Generate & Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
=======
        <>
          {files.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <File size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">No files uploaded yet</p>
              <p className="text-gray-300 text-sm mt-1">Upload a file to get started</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {files.map((file) => <FileCard key={file.id} file={file} />)}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50">
                <div className="w-10 flex-shrink-0" />
                <span className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-right hidden sm:block">Size</span>
                <div className="w-16" />
              </div>
              <div className="divide-y divide-gray-50 p-2">
                {files.map((file) => <FileRow key={file.id} file={file} />)}
              </div>
            </div>
          )}
        </>
>>>>>>> 033a4415673509957acf845880283bc658bc5224
      )}
    </div>
  );
}