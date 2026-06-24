// src/pages/MyFiles.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  FileText, Image as ImageIcon, Video, File, Trash2, AlertTriangle,
  Upload, X, Download, ExternalLink, Music, Code, Grid, List,
  MoreVertical, Share2, Link2, Copy, Check, UserPlus, Trash,
  Eye, CloudUpload, ChevronDown, Mail,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// SHARE MODAL
// ─────────────────────────────────────────────────────────────
function ShareModal({ file, onClose }) {
  const [share, setShare] = useState(null);        // existing share record
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkPermission, setLinkPermission] = useState("read");
  const [copied, setCopied] = useState(false);

  // Add collaborator form
  const [newEmail, setNewEmail] = useState("");
  const [newPerm, setNewPerm] = useState("read");
  const [addingCollab, setAddingCollab] = useState(false);
  const [emailError, setEmailError] = useState("");

  // ── Load existing share on mount ──────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/files/${file.id}/share/`);
        setShare(res.data);
        setLinkPermission(res.data.link_permission);
      } catch (err) {
        if (err.response?.status !== 404) console.error(err);
        // 404 = no share yet, that's fine
      } finally {
        setLoading(false);
      }
    })();
  }, [file.id]);

  // ── Create / update share ─────────────────────────────────
  const createOrUpdateShare = async (perm = linkPermission) => {
    setSaving(true);
    try {
      const res = await api.post(`/api/files/${file.id}/share/`, { link_permission: perm });
      setShare(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Revoke share ──────────────────────────────────────────
  const revokeShare = async () => {
    if (!window.confirm("Revoke this share link? Anyone with the link will lose access.")) return;
    try {
      await api.delete(`/api/files/${file.id}/share/`);
      setShare(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Copy link ─────────────────────────────────────────────
  const copyLink = () => {
    if (!share?.share_url) return;
    navigator.clipboard.writeText(share.share_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Add collaborator ──────────────────────────────────────
  const addCollaborator = async () => {
    setEmailError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) { setEmailError("Enter a valid email address."); return; }

    setAddingCollab(true);
    try {
      const res = await api.post(`/api/files/${file.id}/share/collaborators/`, {
        email: newEmail.trim().toLowerCase(),
        permission: newPerm,
      });
      // Update local collaborators list
      setShare((prev) => ({
        ...prev,
        collaborators: prev.collaborators.some((c) => c.id === res.data.id)
          ? prev.collaborators.map((c) => c.id === res.data.id ? res.data : c)
          : [...prev.collaborators, res.data],
      }));
      setNewEmail("");
    } catch (err) {
      setEmailError(err.response?.data?.detail || "Failed to add collaborator.");
    } finally {
      setAddingCollab(false);
    }
  };

  // ── Remove collaborator ───────────────────────────────────
  const removeCollaborator = async (collabId) => {
    try {
      await api.delete(`/api/files/${file.id}/share/collaborators/${collabId}/`);
      setShare((prev) => ({
        ...prev,
        collaborators: prev.collaborators.filter((c) => c.id !== collabId),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const PERM_LABELS = {
    read: { label: "View only", icon: <Eye size={13} />, color: "text-blue-500 bg-blue-50" },
    read_upload: { label: "View & Upload", icon: <CloudUpload size={13} />, color: "text-emerald-600 bg-emerald-50" },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <Share2 size={18} className="text-orange-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">Share File</h2>
              <p className="text-xs text-gray-400 truncate max-w-[240px]">{file.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ── Shareable Link Section ── */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Shareable Link
                </p>

                {share?.is_active ? (
                  <>
                    {/* Permission toggle */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500">Anyone with link can:</span>
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                        {["read", "read_upload"].map((p) => (
                          <button
                            key={p}
                            onClick={() => {
                              setLinkPermission(p);
                              createOrUpdateShare(p);
                            }}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition ${
                              linkPermission === p
                                ? "bg-white shadow text-gray-800"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {PERM_LABELS[p].icon}
                            {PERM_LABELS[p].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Link display */}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                      <Link2 size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="flex-1 text-xs text-gray-600 truncate font-mono">
                        {share.share_url}
                      </span>
                      <button
                        onClick={copyLink}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition flex-shrink-0 ${
                          copied
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-500 hover:bg-orange-600 text-white"
                        }`}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    {/* Revoke */}
                    <button
                      onClick={revokeShare}
                      className="mt-2 text-xs text-red-400 hover:text-red-500 transition flex items-center gap-1"
                    >
                      <Trash size={11} /> Revoke link
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Link2 size={22} className="text-gray-300" />
                    <p className="text-xs text-gray-400">No shareable link created yet</p>
                    <button
                      onClick={() => createOrUpdateShare()}
                      disabled={saving}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Link2 size={13} />
                      )}
                      Generate Share Link
                    </button>
                  </div>
                )}
              </div>

              {/* ── Collaborators Section (only when share exists) ── */}
              {share?.is_active && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Invite by Email
                  </p>

                  {/* Add form */}
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                        <Mail size={13} className="text-gray-400 flex-shrink-0" />
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && addCollaborator()}
                          placeholder="colleague@example.com"
                          className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-300"
                        />
                      </div>
                      {emailError && (
                        <p className="text-red-400 text-xs mt-1">{emailError}</p>
                      )}
                    </div>

                    {/* Permission picker */}
                    <div className="relative">
                      <select
                        value={newPerm}
                        onChange={(e) => setNewPerm(e.target.value)}
                        className="appearance-none bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 px-3 py-2.5 pr-7 outline-none cursor-pointer"
                      >
                        <option value="read">View only</option>
                        <option value="read_upload">View & Upload</option>
                      </select>
                      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                      onClick={addCollaborator}
                      disabled={addingCollab || !newEmail}
                      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs px-3 py-2.5 rounded-xl font-medium transition"
                    >
                      {addingCollab ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <UserPlus size={13} />
                      )}
                      Add
                    </button>
                  </div>

                  {/* Collaborator list */}
                  {share.collaborators?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {share.collaborators.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2"
                        >
                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-orange-500">
                              {c.email[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="flex-1 text-xs text-gray-700 truncate">{c.email}</span>
                          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${PERM_LABELS[c.permission]?.color}`}>
                            {PERM_LABELS[c.permission]?.icon}
                            {PERM_LABELS[c.permission]?.label}
                          </span>
                          <button
                            onClick={() => removeCollaborator(c.id)}
                            className="p-1 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-400 transition"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 transition px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// THREE-DOT CONTEXT MENU
// ─────────────────────────────────────────────────────────────
function FileContextMenu({ file, onPreview, onShare, onDelete, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    { icon: <Eye size={14} />, label: "Preview", action: onPreview },
    { icon: <Share2 size={14} />, label: "Share", action: onShare },
    { icon: <ExternalLink size={14} />, label: "Open in new tab", action: () => window.open(file.url, "_blank") },
    { icon: <Download size={14} />, label: "Download", action: () => { const a = document.createElement("a"); a.href = file.url; a.download = file.name; a.click(); } },
    null, // divider
    { icon: <Trash2 size={14} className="text-red-400" />, label: "Move to Trash", action: onDelete, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-30 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden"
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="my-1 border-t border-gray-100" />
        ) : (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onClose(); item.action(); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition hover:bg-gray-50 ${
              item.danger ? "text-red-500" : "text-gray-600"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function MyFiles() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [totalStorageGB, setTotalStorageGB] = useState(5);
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalUsedGB, setTotalUsedGB] = useState(0);
  const [isStorageFull, setIsStorageFull] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Preview modal
  const [previewFile, setPreviewFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [textLoading, setTextLoading] = useState(false);

  // Share modal
  const [shareFile, setShareFile] = useState(null);

  // Three-dot menu
  const [openMenuId, setOpenMenuId] = useState(null);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("username");

  useEffect(() => { initPage(); }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") { closePreview(); setShareFile(null); setOpenMenuId(null); }
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

  const fetchTextContent = async (url) => {
    setTextLoading(true);
    try { setTextContent(await (await fetch(url)).text()); }
    catch { setTextContent("Failed to load file content."); }
    finally { setTextLoading(false); }
  };

  const initPage = async () => { const gb = await fetchSubscription(); await fetchFiles(gb); };

  const fetchSubscription = async () => {
    if (!userEmail) return 5;
    try {
      const res = await api.get(`/api/subscriptions/user-subscriptions/${encodeURIComponent(userEmail)}/`);
      const gb = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.storage || 5;
      setTotalStorageGB(gb); return gb;
    } catch { setTotalStorageGB(5); return 5; }
  };

  const fetchFiles = async (storageGB = totalStorageGB) => {
    try {
      const res = await api.get("/api/files/");
      const data = res.data;
      setFiles(data);
      const usedGB = data.reduce((s, f) => s + (f.size || 0), 0) / 1024 / 1024 / 1024;
      setTotalUsedGB(Math.min(usedGB, storageGB).toFixed(2));
      setStorageUsed(Math.min(Math.round((usedGB / storageGB) * 100), 100));
      setIsStorageFull(usedGB >= storageGB * 0.99);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      else alert("Failed to fetch files.");
    }
  };

  const checkStorageLimit = (file) => {
    const MAX = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX) return { allowed: false, message: "File is too large. Maximum single file size is 2GB." };
    const planBytes = totalStorageGB * 1024 * 1024 * 1024;
    const usedBytes = files.reduce((s, f) => s + (f.size || 0), 0);
    const remaining = planBytes - usedBytes;
    if (remaining <= 0) return { allowed: false, message: `Your storage is full (${totalStorageGB}GB used). Please upgrade your plan.` };
    if (file.size > remaining) {
      return { allowed: false, message: `Not enough space! File needs ${(file.size / 1024 / 1024).toFixed(1)} MB but only ${(remaining / 1024 / 1024).toFixed(1)} MB remaining.` };
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
      const fd = new FormData(); fd.append("file", selectedFile);
      await api.post("/api/files/upload/", fd);
      setSelectedFile(null);
      const el = document.getElementById("file-input"); if (el) el.value = "";
      const gb = await fetchSubscription(); await fetchFiles(gb);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      else setUploadError(err.response?.data?.detail || err.response?.data?.error || "Upload failed. Please try again.");
    } finally { setUploading(false); }
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Move this file to Trash?")) return;
    try {
      await api.delete(`/api/files/${id}/trash/`);
      const gb = await fetchSubscription(); await fetchFiles(gb);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      else alert("Delete failed.");
    }
  };

  // ── File type helpers ──
  const getFileType = (n) => {
    const e = n.split(".").pop().toLowerCase();
    if (["png","jpg","jpeg","gif","webp","svg","bmp","ico"].includes(e)) return "image";
    if (["mp4","mov","avi","mkv","webm","ogg"].includes(e)) return "video";
    if (["mp3","wav","aac","flac","m4a"].includes(e)) return "audio";
    if (e === "pdf") return "pdf";
    if (["html","htm"].includes(e)) return "html";
    if (["txt","md","log","csv","xml","yaml","yml","ini","env"].includes(e)) return "text";
    if (["js","jsx","ts","tsx","py","java","cpp","c","cs","php","rb","go","rs","swift","kt","json","css","scss","sh","sql"].includes(e)) return "code";
    if (["doc","docx"].includes(e)) return "word";
    if (["xls","xlsx"].includes(e)) return "excel";
    if (["zip","rar","tar","gz","7z"].includes(e)) return "archive";
    return "other";
  };

  const FILE_TYPE_CONFIG = {
    image:   { bg: "bg-blue-50",    accent: "#3b82f6", label: "IMAGE",  icon: <ImageIcon size={28} className="text-blue-400" /> },
    video:   { bg: "bg-purple-50",  accent: "#8b5cf6", label: "VIDEO",  icon: <Video size={28} className="text-purple-400" /> },
    audio:   { bg: "bg-pink-50",    accent: "#ec4899", label: "AUDIO",  icon: <Music size={28} className="text-pink-400" /> },
    pdf:     { bg: "bg-red-50",     accent: "#ef4444", label: "PDF",    icon: <FileText size={28} className="text-red-400" /> },
    html:    { bg: "bg-orange-50",  accent: "#f97316", label: "HTML",   icon: <Code size={28} className="text-orange-400" /> },
    text:    { bg: "bg-gray-50",    accent: "#6b7280", label: "TXT",    icon: <FileText size={28} className="text-gray-400" /> },
    code:    { bg: "bg-green-50",   accent: "#22c55e", label: "CODE",   icon: <Code size={28} className="text-green-400" /> },
    word:    { bg: "bg-blue-50",    accent: "#1d4ed8", label: "WORD",   icon: <FileText size={28} className="text-blue-700" /> },
    excel:   { bg: "bg-emerald-50", accent: "#059669", label: "EXCEL",  icon: <FileText size={28} className="text-emerald-600" /> },
    archive: { bg: "bg-yellow-50",  accent: "#eab308", label: "ZIP",    icon: <File size={28} className="text-yellow-500" /> },
    other:   { bg: "bg-gray-50",    accent: "#9ca3af", label: "FILE",   icon: <File size={28} className="text-gray-400" /> },
  };

  const getConfig = (n) => FILE_TYPE_CONFIG[getFileType(n)] || FILE_TYPE_CONFIG.other;
  const formatSize = (b) => b < 1024 ? `${b} B` : b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/1024/1024).toFixed(1)} MB`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  // ─────────────────────────────────────────────────────────
  // THUMBNAIL
  // ─────────────────────────────────────────────────────────
  const FileThumbnail = ({ file }) => {
    const type = getFileType(file.name);
    const config = getConfig(file.name);

    if (type === "image") return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
        <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
    if (type === "video") return (
      <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative">
        <video src={file.url} muted preload="metadata" className="w-full h-full object-cover"
          onLoadedMetadata={(e) => { e.target.currentTime = 1; }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>
    );
    if (type === "pdf") return (
      <div className="w-full h-full bg-red-50 relative overflow-hidden">
        <iframe src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} title={file.name}
          className="w-full h-full border-0 pointer-events-none"
          style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }} />
        <div className="absolute inset-0" />
        <div className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PDF</div>
      </div>
    );
    if (type === "audio") return (
      <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex flex-col items-center justify-center gap-2">
        <Music size={32} className="text-pink-400" />
        <div className="flex items-end gap-0.5 h-6">
          {[4,7,5,9,6,8,4,7,5,6,8,5].map((h,i) => (
            <div key={i} className="w-1 bg-pink-300 rounded-full" style={{ height: `${h*3}px`, opacity: 0.7+(i%3)*0.1 }} />
          ))}
        </div>
      </div>
    );
    if (type === "code" || type === "html") {
      const accentClass = type === "code" ? "bg-green-200" : "bg-orange-200";
      const lineClass = type === "code" ? "bg-green-100" : "bg-orange-100";
      return (
        <div className={`w-full h-full ${type === "code" ? "bg-green-50" : "bg-orange-50"} p-3 flex flex-col gap-1.5 overflow-hidden`}>
          <div className="flex gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-300" />
            <div className="w-2 h-2 rounded-full bg-yellow-300" />
            <div className="w-2 h-2 rounded-full bg-green-300" />
          </div>
          {[70,45,85,30,60,50,75,35].map((w,i) => (
            <div key={i} className="flex gap-1 items-center">
              <div className="text-[8px] text-gray-300 w-3 text-right">{i+1}</div>
              <div className={`h-1.5 rounded-sm ${i%3===0 ? accentClass : lineClass}`} style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      );
    }
    if (type === "text") return (
      <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 overflow-hidden border-l-4 border-gray-200">
        {[80,65,90,55,75,40,85,60].map((w,i) => (
          <div key={i} className="h-1.5 bg-gray-200 rounded-sm" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
    if (type === "word") return (
      <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 overflow-hidden border-t-4 border-blue-600">
        <div className="h-2 bg-blue-600 rounded-sm w-1/2 mb-1" />
        {[90,70,85,60,75,50,80].map((w,i) => (
          <div key={i} className="h-1.5 bg-gray-200 rounded-sm" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
    if (type === "excel") return (
      <div className="w-full h-full bg-white p-2 flex flex-col gap-0.5 overflow-hidden border-t-4 border-emerald-500">
        <div className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 18 }).map((_,i) => (
            <div key={i} className={`h-3 rounded-sm ${i%4===0 ? "bg-emerald-200" : "bg-gray-100"} border border-gray-200`} />
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
            {[100,80,90].map((w,i) => <div key={i} className="h-1 bg-yellow-400 rounded-sm opacity-60" style={{ width: `${w}%` }} />)}
          </div>
        </div>
        <span className="text-[9px] font-bold text-yellow-600 tracking-widest mt-1">
          {file.name.split(".").pop().toUpperCase()}
        </span>
      </div>
    );
    return (
      <div className={`w-full h-full ${config.bg} flex flex-col items-center justify-center gap-2`}>
        {config.icon}
        <span className="text-[10px] font-bold tracking-widest" style={{ color: config.accent }}>
          {file.name.split(".").pop().toUpperCase()}
        </span>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────
  // GRID CARD  (with three-dot menu)
  // ─────────────────────────────────────────────────────────
  const FileCard = ({ file }) => {
    const [hovered, setHovered] = useState(false);
    const isMenuOpen = openMenuId === file.id;

    return (
      <div
        className="group bg-white rounded-xl border border-gray-200 overflow-visible hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setPreviewFile(file)}
      >
        {/* Three-dot button — always on top */}
        <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setOpenMenuId(isMenuOpen ? null : file.id)}
            className={`p-1.5 rounded-lg transition ${isMenuOpen ? "bg-white/90 shadow text-gray-700" : "bg-black/30 text-white opacity-0 group-hover:opacity-100"}`}
          >
            <MoreVertical size={14} />
          </button>
          {isMenuOpen && (
            <FileContextMenu
              file={file}
              onPreview={() => setPreviewFile(file)}
              onShare={() => setShareFile(file)}
              onDelete={() => deleteFile(file.id)}
              onClose={() => setOpenMenuId(null)}
            />
          )}
        </div>

        {/* Thumbnail */}
        <div className="relative w-full overflow-hidden rounded-t-xl" style={{ height: 140 }}>
          <FileThumbnail file={file} />
          <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-150 ${hovered && !isMenuOpen ? "opacity-100" : "opacity-0"}`}>
            <span className="bg-white/90 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow">Preview</span>
          </div>
        </div>

        {/* Info */}
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

  // ─────────────────────────────────────────────────────────
  // LIST ROW  (with three-dot menu)
  // ─────────────────────────────────────────────────────────
  const FileRow = ({ file }) => {
    const config = getConfig(file.name);
    const type = getFileType(file.name);
    const isMenuOpen = openMenuId === file.id;

    return (
      <div
        className="group flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors relative"
        onClick={() => setPreviewFile(file)}
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
          {type === "image"
            ? <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
            : <div className={`w-full h-full ${config.bg} flex items-center justify-center`}>
                <span className="text-[9px] font-bold" style={{ color: config.accent }}>
                  {file.name.split(".").pop().toUpperCase()}
                </span>
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">{formatDate(file.uploaded_at)}</p>
        </div>
        <div className="text-xs text-gray-400 w-20 text-right hidden sm:block">{formatSize(file.size)}</div>

        {/* Three-dot */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setOpenMenuId(isMenuOpen ? null : file.id)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={14} />
          </button>
          {isMenuOpen && (
            <FileContextMenu
              file={file}
              onPreview={() => setPreviewFile(file)}
              onShare={() => setShareFile(file)}
              onDelete={() => deleteFile(file.id)}
              onClose={() => setOpenMenuId(null)}
            />
          )}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────
  // PREVIEW MODAL
  // ─────────────────────────────────────────────────────────
  const renderPreview = (file) => {
    const type = getFileType(file.name);
    if (type === "image") return (
      <div className="flex items-center justify-center min-h-[300px]">
        <img src={file.url} alt={file.name} className="max-w-full max-h-[65vh] object-contain rounded-lg shadow" />
      </div>
    );
    if (type === "video") return (
      <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden">
        <video controls autoPlay className="max-w-full max-h-[65vh] rounded-lg"><source src={file.url} /></video>
      </div>
    );
    if (type === "audio") return (
      <div className="flex flex-col items-center gap-8 py-12">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shadow-inner">
          <Music size={48} className="text-pink-500" />
        </div>
        <audio controls autoPlay className="w-full max-w-lg"><source src={file.url} /></audio>
      </div>
    );
    if (type === "pdf") return (
      <iframe src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1`} title={file.name}
        className="w-full rounded-lg border-0" style={{ height: "68vh" }} />
    );
    if (type === "html") return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-600">
          <Code size={13} /> Rendered HTML preview — sandboxed
        </div>
        <iframe src={file.url} title={file.name} sandbox="allow-scripts allow-same-origin"
          className="w-full rounded-lg border border-gray-200" style={{ height: "60vh" }} />
      </div>
    );
    if (type === "text" || type === "code") {
      const ext = file.name.split(".").pop().toLowerCase();
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-2">
            <span className="text-xs text-gray-400 font-mono">{file.name}</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">.{ext}</span>
          </div>
          <div className="bg-gray-900 rounded-b-lg overflow-auto" style={{ maxHeight: "60vh" }}>
            {textLoading
              ? <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
              : <pre className="text-sm text-gray-100 font-mono p-4 whitespace-pre-wrap break-words leading-relaxed">{textContent || "File is empty."}</pre>
            }
          </div>
        </div>
      );
    }
    if (type === "word" || type === "excel") {
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-600">
            <FileText size={13} /> Powered by Microsoft Office Online
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
          <p className="text-gray-400 text-sm mt-1">Preview not available for this file type.</p>
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

      {/* SHARE MODAL */}
      {shareFile && <ShareModal file={shareFile} onClose={() => setShareFile(null)} />}

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
                  {getFileType(previewFile.name) === "image"
                    ? <img src={previewFile.url} alt="" className="w-full h-full object-cover" />
                    : <div className={`w-full h-full ${getConfig(previewFile.name).bg} flex items-center justify-center`}>
                        <span className="text-[8px] font-bold" style={{ color: getConfig(previewFile.name).accent }}>
                          {previewFile.name.split(".").pop().toUpperCase()}
                        </span>
                      </div>
                  }
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
                <button
                  onClick={() => { closePreview(); setShareFile(previewFile); }}
                  className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
                >
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

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Files</h1>
          <p className="text-gray-500">Manage, organize, and share your stored files</p>
        </div>
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <input id="file-input" type="file"
              onChange={(e) => { setUploadError(""); setSelectedFile(e.target.files[0]); }}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 w-full sm:w-auto"
              disabled={isStorageFull} />
            <button onClick={uploadFile} disabled={uploading || isStorageFull || !selectedFile}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition
                ${uploading || isStorageFull || !selectedFile ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}>
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          {uploadError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-600 rounded-lg px-3 py-2 text-xs max-w-sm w-full">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{uploadError}</span>
              {isStorageError && (
                <Link to="/dashboard/subscription" className="ml-1 underline font-semibold whitespace-nowrap text-orange-500">Upgrade →</Link>
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
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white shadow text-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
                <Grid size={14} />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white shadow text-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
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
          <span className="text-xs text-gray-400">{remainingGB > 0 ? `${remainingGB} GB free` : "Storage full"}</span>
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
                <div className="w-8" />
              </div>
              <div className="divide-y divide-gray-50 p-2">
                {files.map((file) => <FileRow key={file.id} file={file} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}