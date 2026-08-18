// src/pages/MyFiles.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  FileText, Image as ImageIcon, Video, File, Trash2, AlertTriangle,
  Upload, X, Download, ExternalLink, Music, Code, Grid, List, Share2,
  Copy, Check, Lock, UserMinus, Link as LinkIcon, FolderPlus, Folder,
  ChevronRight,
} from "lucide-react";
import { useNotifications } from '../context/NotificationContext';

export default function MyFiles() {
  const { fetchGlobalNotifications } = useNotifications();

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "My Files" }]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [totalStorageGB, setTotalStorageGB] = useState(5);
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalUsedGB, setTotalUsedGB] = useState(0);
  const [isStorageFull, setIsStorageFull] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // New folder modal
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderError, setFolderError] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Preview modal
  const [previewFile, setPreviewFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [textLoading, setTextLoading] = useState(false);

  // Share modal — works for both files and folders
  // shareModal: { type: 'file'|'folder', id, name }
  const [shareModal, setShareModal] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState("");
  const [newCollabEmail, setNewCollabEmail] = useState("");
  const [collabError, setCollabError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("username");

  useEffect(() => { initPage(); }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") { closePreview(); closeShareModal(); setNewFolderModal(false); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!previewFile) return;
    const type = getFileType(previewFile.name);
    if (type === "text" || type === "code" || type === "html") fetchTextContent(previewFile.url);
  }, [previewFile]);

  const closePreview = () => { setPreviewFile(null); setTextContent(""); };

  const closeShareModal = () => {
    setShareModal(null); setShareData(null); setShareError("");
    setNewCollabEmail(""); setCollabError(""); setLinkCopied(false);
  };

  const fetchTextContent = async (url) => {
    setTextLoading(true);
    try { const res = await fetch(url); setTextContent(await res.text()); }
    catch { setTextContent("Failed to load file content."); }
    finally { setTextLoading(false); }
  };

  const initPage = async () => {
    const planGB = await fetchSubscription();
    await Promise.all([fetchFiles(planGB, null), fetchFolders(null)]);
    setLoading(false);
  };

  const fetchSubscription = async () => {
    if (!userEmail) return 5;
    try {
      const res = await api.get(`/api/subscriptions/user-subscriptions/${encodeURIComponent(userEmail)}/`);
      const latest = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const gb = latest?.storage || 5;
      setTotalStorageGB(gb);
      return gb;
    } catch { setTotalStorageGB(5); return 5; }
  };

  const fetchFiles = async (storageGB = totalStorageGB, folderId = currentFolderId) => {
    try {
      const params = folderId ? `?folder=${folderId}` : "";
      const res = await api.get(`/api/${params}`);
      const data = res.data;
      setFiles(data);
      const totalBytes = data.reduce((sum, f) => sum + (f.size || 0), 0);
      const usedGB = totalBytes / 1024 / 1024 / 1024;
      setTotalUsedGB(Math.min(usedGB, storageGB).toFixed(2));
      setStorageUsed(Math.min(Math.round((usedGB / storageGB) * 100), 100));
      setIsStorageFull(usedGB >= storageGB * 0.99);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      else alert("Failed to fetch files.");
    }
  };

  const fetchFolders = async (folderId = currentFolderId) => {
    try {
      const params = folderId ? `?parent=${folderId}` : "";
      const res = await api.get(`/api/folders/${params}`);
      setFolders(res.data);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
    }
  };

  const navigateToFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setLoading(true);
    Promise.all([fetchFiles(totalStorageGB, folder.id), fetchFolders(folder.id)])
      .finally(() => setLoading(false));
  };

  const navigateToCrumb = (crumb, index) => {
    if (crumb.id === currentFolderId) return;
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newCrumbs);
    setCurrentFolderId(crumb.id);
    setLoading(true);
    Promise.all([fetchFiles(totalStorageGB, crumb.id), fetchFolders(crumb.id)])
      .finally(() => setLoading(false));
  };

  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name) { setFolderError("Folder name is required."); return; }
    setCreatingFolder(true);
    setFolderError("");
    try {
      const body = { name };
      if (currentFolderId) body.parent = currentFolderId;
      await api.post("/api/folders/", body);
      setNewFolderModal(false);
      setNewFolderName("");
      await fetchFolders(currentFolderId);
    } catch (err) {
      setFolderError(err.response?.data?.error || "Failed to create folder.");
    } finally {
      setCreatingFolder(false);
    }
  };

  const deleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this folder? Files inside won't be deleted.")) return;
    try {
      await api.delete(`/api/folders/${id}/`);
      await fetchFolders(currentFolderId);
    } catch { alert("Failed to delete folder."); }
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
      if (currentFolderId) formData.append("folder_id", currentFolderId);
      await api.post("/api/upload/", formData);
      setSelectedFile(null);
      const input = document.getElementById("file-input");
      if (input) input.value = "";
      const planGB = await fetchSubscription();
      await fetchFiles(planGB, currentFolderId);
      if (fetchGlobalNotifications) fetchGlobalNotifications();
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
      await fetchFiles(planGB, currentFolderId);
      if (fetchGlobalNotifications) fetchGlobalNotifications();
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      else alert("Delete failed.");
    }
  };

  // ── Share logic ──────────────────────────────────────────────────────────────

  const shareBase = (modal) =>
    modal.type === "folder"
      ? `/api/folders/${modal.id}/share/`
      : `/api/files/${modal.id}/share/`;

  const collabBase = (modal) =>
    modal.type === "folder"
      ? `/api/folders/${modal.id}/share/collaborators/`
      : `/api/files/${modal.id}/share/collaborators/`;

  const openShareModal = async (item, type, e) => {
    e.stopPropagation();
    const modal = { type, id: item.id, name: item.name };
    setShareModal(modal);
    setShareData(null); setShareError(""); setShareLoading(true);
    try {
      const res = await api.get(shareBase(modal));
      setShareData(res.data);
    } catch (err) {
      if (err.response?.status !== 404) setShareError("Failed to load share info.");
    } finally {
      setShareLoading(false);
    }
  };

  const generateLink = async () => {
    setShareLoading(true); setShareError("");
    try {
      const res = await api.post(shareBase(shareModal), { link_permission: "read" });
      setShareData(res.data);
    } catch { setShareError("Failed to generate share link."); }
    finally { setShareLoading(false); }
  };

  const revokeLink = async () => {
    if (!window.confirm("Revoke this share link? Anyone with the link will lose access.")) return;
    setShareLoading(true);
    try {
      await api.delete(shareBase(shareModal));
      setShareData(null);
    } catch { setShareError("Failed to revoke link."); }
    finally { setShareLoading(false); }
  };

  const copyLink = () => {
    if (!shareData?.share_url) return;
    navigator.clipboard.writeText(shareData.share_url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const addCollaborator = async () => {
    const email = newCollabEmail.trim().toLowerCase();
    if (!email) return;
    setCollabError("");
    try {
      const res = await api.post(collabBase(shareModal), { email, permission: "read" });
      setShareData((prev) => ({ ...prev, collaborators: [...(prev.collaborators || []), res.data] }));
      setNewCollabEmail("");
    } catch (err) {
      setCollabError(err.response?.data?.detail || "Failed to add collaborator.");
    }
  };

  const removeCollaborator = async (collabId) => {
    try {
      await api.delete(`${collabBase(shareModal)}${collabId}/`);
      setShareData((prev) => ({ ...prev, collaborators: prev.collaborators.filter((c) => c.id !== collabId) }));
    } catch { setShareError("Failed to remove collaborator."); }
  };

  // ── File type helpers ────────────────────────────────────────────────────────

  const getFileType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["png","jpg","jpeg","gif","webp","svg","bmp","ico"].includes(ext)) return "image";
    if (["mp4","mov","avi","mkv","webm","ogg"].includes(ext)) return "video";
    if (["mp3","wav","aac","flac","m4a"].includes(ext)) return "audio";
    if (ext === "pdf") return "pdf";
    if (["html","htm"].includes(ext)) return "html";
    if (["txt","md","log","csv","xml","yaml","yml","ini","env"].includes(ext)) return "text";
    if (["js","jsx","ts","tsx","py","java","cpp","c","cs","php","rb","go","rs","swift","kt","json","css","scss","sh","sql"].includes(ext)) return "code";
    if (["doc","docx"].includes(ext)) return "word";
    if (["xls","xlsx"].includes(ext)) return "excel";
    if (["zip","rar","tar","gz","7z"].includes(ext)) return "archive";
    return "other";
  };

  const FILE_TYPE_CONFIG = {
    image:   { bg:"bg-blue-50",    accent:"#3b82f6", label:"IMAGE",  icon:<ImageIcon size={28} className="text-blue-400" /> },
    video:   { bg:"bg-purple-50",  accent:"#8b5cf6", label:"VIDEO",  icon:<Video size={28} className="text-purple-400" /> },
    audio:   { bg:"bg-pink-50",    accent:"#ec4899", label:"AUDIO",  icon:<Music size={28} className="text-pink-400" /> },
    pdf:     { bg:"bg-red-50",     accent:"#ef4444", label:"PDF",    icon:<FileText size={28} className="text-red-400" /> },
    html:    { bg:"bg-orange-50",  accent:"#f97316", label:"HTML",   icon:<Code size={28} className="text-orange-400" /> },
    text:    { bg:"bg-gray-50",    accent:"#6b7280", label:"TXT",    icon:<FileText size={28} className="text-gray-400" /> },
    code:    { bg:"bg-green-50",   accent:"#22c55e", label:"CODE",   icon:<Code size={28} className="text-green-400" /> },
    word:    { bg:"bg-blue-50",    accent:"#1d4ed8", label:"WORD",   icon:<FileText size={28} className="text-blue-700" /> },
    excel:   { bg:"bg-emerald-50", accent:"#059669", label:"EXCEL",  icon:<FileText size={28} className="text-emerald-600" /> },
    archive: { bg:"bg-yellow-50",  accent:"#eab308", label:"ZIP",    icon:<File size={28} className="text-yellow-500" /> },
    other:   { bg:"bg-gray-50",    accent:"#9ca3af", label:"FILE",   icon:<File size={28} className="text-gray-400" /> },
  };

  const getConfig = (fileName) => FILE_TYPE_CONFIG[getFileType(fileName)] || FILE_TYPE_CONFIG.other;

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "";

  // ── Thumbnail ────────────────────────────────────────────────────────────────

  const FileThumbnail = ({ file }) => {
    const type = getFileType(file.name);
    const config = getConfig(file.name);

    if (type === "image") return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
        <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy"
          onError={(e) => { e.target.style.display="none"; }} />
      </div>
    );
    if (type === "video") return (
      <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative">
        <video src={file.url} muted preload="metadata" className="w-full h-full object-cover"
          onLoadedMetadata={(e) => { e.target.currentTime=1; }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
    );
    if (type === "pdf") return (
      <div className="w-full h-full bg-red-50 relative overflow-hidden">
        <iframe src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} title={file.name}
          className="w-full h-full border-0 pointer-events-none"
          style={{ transform:"scale(0.5)", transformOrigin:"top left", width:"200%", height:"200%" }} />
        <div className="absolute inset-0" />
        <div className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PDF</div>
      </div>
    );
    if (type === "audio") return (
      <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex flex-col items-center justify-center gap-2">
        <Music size={32} className="text-pink-400" />
        <div className="flex items-end gap-0.5 h-6">
          {[4,7,5,9,6,8,4,7,5,6,8,5].map((h,i) => (
            <div key={i} className="w-1 bg-pink-300 rounded-full" style={{ height:`${h*3}px`, opacity:0.7+(i%3)*0.1 }} />
          ))}
        </div>
      </div>
    );
    if (type === "code" || type === "html") {
      const accentClass = type==="code" ? "bg-green-200" : "bg-orange-200";
      const lineClass   = type==="code" ? "bg-green-100" : "bg-orange-100";
      return (
        <div className={`w-full h-full ${type==="code"?"bg-green-50":"bg-orange-50"} p-3 flex flex-col gap-1.5 overflow-hidden`}>
          <div className="flex gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-300"/><div className="w-2 h-2 rounded-full bg-yellow-300"/><div className="w-2 h-2 rounded-full bg-green-300"/>
          </div>
          {[70,45,85,30,60,50,75,35].map((w,i) => (
            <div key={i} className="flex gap-1 items-center">
              <div className="text-[8px] text-gray-300 w-3 text-right">{i+1}</div>
              <div className={`h-1.5 rounded-sm ${i%3===0?accentClass:lineClass}`} style={{ width:`${w}%` }} />
            </div>
          ))}
        </div>
      );
    }
    if (type === "text") return (
      <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 overflow-hidden border-l-4 border-gray-200">
        {[80,65,90,55,75,40,85,60].map((w,i) => (
          <div key={i} className="h-1.5 bg-gray-200 rounded-sm" style={{ width:`${w}%` }} />
        ))}
      </div>
    );
    if (type === "word") return (
      <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 overflow-hidden border-t-4 border-blue-600">
        <div className="h-2 bg-blue-600 rounded-sm w-1/2 mb-1" />
        {[90,70,85,60,75,50,80].map((w,i) => (
          <div key={i} className="h-1.5 bg-gray-200 rounded-sm" style={{ width:`${w}%` }} />
        ))}
      </div>
    );
    if (type === "excel") return (
      <div className="w-full h-full bg-white p-2 flex flex-col gap-0.5 overflow-hidden border-t-4 border-emerald-500">
        <div className="grid grid-cols-3 gap-0.5">
          {Array.from({length:18}).map((_,i) => (
            <div key={i} className={`h-3 rounded-sm ${i%4===0?"bg-emerald-200":"bg-gray-100"} border border-gray-200`} />
          ))}
        </div>
      </div>
    );
    if (type === "archive") return (
      <div className="w-full h-full bg-yellow-50 flex flex-col items-center justify-center gap-1">
        <div className="relative">
          <div className="w-12 h-10 bg-yellow-200 rounded-sm" />
          <div className="absolute -top-1 left-2 w-5 h-2 bg-yellow-300 rounded-t-sm" />
          <div className="absolute top-2 left-0 right-0 flex flex-col gap-1 px-2">
            {[100,80,90].map((w,i) => (
              <div key={i} className="h-1 bg-yellow-400 rounded-sm opacity-60" style={{ width:`${w}%` }} />
            ))}
          </div>
        </div>
        <span className="text-[9px] font-bold text-yellow-600 tracking-widest mt-1">{file.name.split(".").pop().toUpperCase()}</span>
      </div>
    );
    return (
      <div className={`w-full h-full ${config.bg} flex flex-col items-center justify-center gap-2`}>
        {config.icon}
        <span className="text-[10px] font-bold tracking-widest" style={{ color:config.accent }}>
          {file.name.split(".").pop().toUpperCase()}
        </span>
      </div>
    );
  };

  // ── Folder card / row ────────────────────────────────────────────────────────

  const FolderCard = ({ folder }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-amber-300 transition-all duration-200 cursor-pointer flex flex-col"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => navigateToFolder(folder)}
      >
        <div className="relative w-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100" style={{ height:140 }}>
          <Folder size={52} className="text-amber-400" />
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-150 ${hovered?"opacity-100":"opacity-0"}`}>
            <button onClick={(e) => openShareModal(folder, "folder", e)}
              className="bg-orange-500/90 hover:bg-orange-500 text-white p-1.5 rounded-lg shadow transition" title="Share">
              <Share2 size={14} />
            </button>
            <button onClick={(e) => deleteFolder(folder.id, e)}
              className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-lg shadow transition">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="px-3 py-2.5 flex items-center gap-2 border-t border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{folder.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(folder.created_at)}</p>
          </div>
        </div>
      </div>
    );
  };

  const FolderRow = ({ folder }) => (
    <div
      className="group flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
      onClick={() => navigateToFolder(folder)}
    >
      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 border border-amber-200">
        <Folder size={20} className="text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{folder.name}</p>
        <p className="text-xs text-gray-400">{formatDate(folder.created_at)}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => openShareModal(folder, "folder", e)}
          className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-500 transition" title="Share">
          <Share2 size={14} />
        </button>
        <button onClick={(e) => deleteFolder(folder.id, e)}
          className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  // ── File card / row ──────────────────────────────────────────────────────────

  const FileCard = ({ file }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setPreviewFile(file)}
      >
        <div className="relative w-full" style={{ height:140 }}>
          <FileThumbnail file={file} />
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-150 ${hovered?"opacity-100":"opacity-0"}`}>
            <button onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow transition">
              Preview
            </button>
            <button onClick={(e) => openShareModal(file, "file", e)}
              className="bg-orange-500/90 hover:bg-orange-500 text-white p-1.5 rounded-lg shadow transition" title="Share">
              <Share2 size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
              className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-lg shadow transition">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="px-3 py-2.5 flex items-center gap-2 border-t border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate" title={file.name}>{file.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatSize(file.size)}
              {file.uploaded_at && <span> · {formatDate(file.uploaded_at)}</span>}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const FileRow = ({ file }) => {
    const config = getConfig(file.name);
    const type = getFileType(file.name);
    return (
      <div
        className="group flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        onClick={() => setPreviewFile(file)}
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
          {type==="image" ? (
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className={`w-full h-full ${config.bg} flex items-center justify-center`}>
              <span className="text-[9px] font-bold" style={{ color:config.accent }}>{file.name.split(".").pop().toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">{formatDate(file.uploaded_at)}</p>
        </div>
        <div className="text-xs text-gray-400 w-20 text-right hidden sm:block">{formatSize(file.size)}</div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => openShareModal(file, "file", e)}
            className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-500 transition" title="Share">
            <Share2 size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); window.open(file.url,"_blank"); }}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition">
            <ExternalLink size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
            className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  // ── Preview modal ────────────────────────────────────────────────────────────

  const renderPreview = (file) => {
    const type = getFileType(file.name);
    if (type==="image") return (
      <div className="flex items-center justify-center min-h-[300px]">
        <img src={file.url} alt={file.name} className="max-w-full max-h-[65vh] object-contain rounded-lg shadow" />
      </div>
    );
    if (type==="video") return (
      <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden">
        <video controls autoPlay className="max-w-full max-h-[65vh] rounded-lg"><source src={file.url} /></video>
      </div>
    );
    if (type==="audio") return (
      <div className="flex flex-col items-center gap-8 py-12">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shadow-inner">
          <Music size={48} className="text-pink-500" />
        </div>
        <audio controls autoPlay className="w-full max-w-lg"><source src={file.url} /></audio>
      </div>
    );
    if (type==="pdf") return (
      <iframe src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1`} title={file.name}
        className="w-full rounded-lg border-0" style={{ height:"68vh" }} />
    );
    if (type==="html") return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-600">
          <Code size={13} /> Rendered HTML preview — sandboxed for safety
        </div>
        <iframe src={file.url} title={file.name} sandbox="allow-scripts allow-same-origin"
          className="w-full rounded-lg border border-gray-200" style={{ height:"60vh" }} />
      </div>
    );
    if (type==="text" || type==="code") {
      const ext = file.name.split(".").pop().toLowerCase();
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-2">
            <span className="text-xs text-gray-400 font-mono">{file.name}</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">.{ext}</span>
          </div>
          <div className="bg-gray-900 rounded-b-lg overflow-auto" style={{ maxHeight:"60vh" }}>
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
    if (type==="word" || type==="excel") {
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-600">
            <FileText size={13} /> Powered by Microsoft Office Online viewer
          </div>
          <iframe src={officeUrl} title={file.name} className="w-full rounded-lg border border-gray-200" style={{ height:"65vh" }} />
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

  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="p-6">

      {/* ── New Folder Modal ── */}
      {newFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => { setNewFolderModal(false); setNewFolderName(""); setFolderError(""); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                <FolderPlus size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">New Folder</p>
                {currentFolderId && (
                  <p className="text-xs text-gray-400">Inside {breadcrumbs[breadcrumbs.length-1]?.name}</p>
                )}
              </div>
            </div>
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={(e) => { setNewFolderName(e.target.value); setFolderError(""); }}
              onKeyDown={(e) => { if (e.key==="Enter") createFolder(); }}
              placeholder="Folder name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 mb-3"
            />
            {folderError && <p className="text-xs text-red-500 mb-3">{folderError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setNewFolderModal(false); setNewFolderName(""); setFolderError(""); }}
                className="flex-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={createFolder} disabled={creatingFolder || !newFolderName.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                {creatingFolder ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={closePreview}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
            style={{ maxHeight:"92vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  {getFileType(previewFile.name)==="image" ? (
                    <img src={previewFile.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full ${getConfig(previewFile.name).bg} flex items-center justify-center`}>
                      <span className="text-[8px] font-bold" style={{ color:getConfig(previewFile.name).accent }}>
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
                <button onClick={(e) => openShareModal(previewFile, "file", e)}
                  className="flex items-center gap-1.5 text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg transition border border-orange-200">
                  <Share2 size={13} /> Share
                </button>
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
            <div className="flex-1 overflow-auto p-5 bg-gray-50">{renderPreview(previewFile)}</div>
          </div>
        </div>
      )}

      {/* ── Share Modal ── */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={closeShareModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${shareModal.type==="folder"?"bg-amber-100":"bg-orange-100"} rounded-lg flex items-center justify-center`}>
                  {shareModal.type==="folder"
                    ? <Folder size={16} className="text-amber-500" />
                    : <Share2 size={16} className="text-orange-500" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    Share {shareModal.type==="folder" ? "Folder" : "File"}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[220px]">{shareModal.name}</p>
                </div>
              </div>
              <button onClick={closeShareModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {shareLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : shareError ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                  <AlertTriangle size={15} /> {shareError}
                </div>
              ) : !shareData ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">No share link yet</p>
                  <p className="text-gray-400 text-sm mb-6">
                    Generate a secure link. Recipients must be <strong>logged in</strong> to access.
                  </p>
                  <button onClick={generateLink}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition w-full">
                    Generate Secure Link
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-100 rounded-lg px-3.5 py-3">
                    <Lock size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-orange-700">
                      Anyone with this link <strong>must be logged in</strong> to access.
                      Unauthenticated visitors will be redirected to login.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Share Link</label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-0">
                        <LinkIcon size={13} className="text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600 truncate">{shareData.share_url}</span>
                      </div>
                      <button onClick={copyLink}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition flex-shrink-0
                          ${linkCopied ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
                        {linkCopied ? <><Check size={13}/> Copied</> : <><Copy size={13}/> Copy</>}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Restrict Access by Email
                      <span className="ml-1 text-gray-400 normal-case font-normal">(optional)</span>
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      If you add emails here, only those specific logged-in users can open the link.
                    </p>
                    <div className="flex gap-2 mb-2">
                      <input type="email" value={newCollabEmail}
                        onChange={(e) => { setNewCollabEmail(e.target.value); setCollabError(""); }}
                        onKeyDown={(e) => { if (e.key==="Enter") addCollaborator(); }}
                        placeholder="user@example.com"
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                      <button onClick={addCollaborator}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition flex-shrink-0">
                        Add
                      </button>
                    </div>
                    {collabError && <p className="text-xs text-red-500 mb-2">{collabError}</p>}
                    {shareData.collaborators?.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        {shareData.collaborators.map((c) => (
                          <div key={c.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700">{c.email}</span>
                            <button onClick={() => removeCollaborator(c.id)}
                              className="text-gray-400 hover:text-red-500 transition p-0.5 rounded">
                              <UserMinus size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <button onClick={revokeLink} className="text-xs text-red-500 hover:text-red-700 transition font-medium">
                      Revoke Link — disable access for everyone
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Files</h1>
          <p className="text-gray-500">Manage, organize, and share your stored files</p>
        </div>
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <button
              onClick={() => { setNewFolderModal(true); setNewFolderName(""); setFolderError(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium transition"
            >
              <FolderPlus size={16} /> New Folder
            </button>
            <input id="file-input" type="file"
              onChange={(e) => { setUploadError(""); setSelectedFile(e.target.files[0]); }}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 w-full sm:w-auto"
              disabled={isStorageFull}
            />
            <button onClick={uploadFile}
              disabled={uploading || isStorageFull || !selectedFile}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition
                ${uploading||isStorageFull||!selectedFile ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}>
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

      {/* ── Breadcrumbs ── */}
      {breadcrumbs.length > 1 && (
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.id ?? "root"} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="text-gray-400" />}
              <button
                onClick={() => navigateToCrumb(crumb, i)}
                className={`text-sm px-2 py-1 rounded-lg transition ${
                  i === breadcrumbs.length - 1
                    ? "text-gray-800 font-semibold bg-gray-100 cursor-default"
                    : "text-orange-500 hover:bg-orange-50"
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Storage bar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Storage Used</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${viewMode==="grid"?"bg-white shadow text-gray-800":"text-gray-400 hover:text-gray-600"}`}>
                <Grid size={14} />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${viewMode==="list"?"bg-white shadow text-gray-800":"text-gray-400 hover:text-gray-600"}`}>
                <List size={14} />
              </button>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {totalUsedGB} GB / {totalStorageGB} GB ({storageUsed}%)
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width:`${storageUsed}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{folders.length} folders · {files.length} files</span>
          <span className="text-xs text-gray-400">{remainingGB > 0 ? `${remainingGB} GB free` : "Storage full"}</span>
        </div>
      </div>

      {/* ── Storage full banner ── */}
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

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center gap-3 text-gray-400 py-8">
          <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      )}

      {/* ── Content ── */}
      {!loading && (
        <>
          {isEmpty ? (
            <div className="flex flex-col items-center py-20 text-center">
              <Folder size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">
                {currentFolderId ? "This folder is empty" : "No files or folders yet"}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                {currentFolderId ? "Upload a file or create a sub-folder" : "Upload a file or create a folder to get started"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="space-y-4">
              {folders.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Folders</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {folders.map((f) => <FolderCard key={f.id} folder={f} />)}
                  </div>
                </div>
              )}
              {files.length > 0 && (
                <div>
                  {folders.length > 0 && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Files</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {files.map((f) => <FileCard key={f.id} file={f} />)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50">
                <div className="w-10 flex-shrink-0" />
                <span className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-right hidden sm:block">Size</span>
                <div className="w-24" />
              </div>
              <div className="divide-y divide-gray-50 p-2">
                {folders.map((f) => <FolderRow key={f.id} folder={f} />)}
                {files.map((f) => <FileRow key={f.id} file={f} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
