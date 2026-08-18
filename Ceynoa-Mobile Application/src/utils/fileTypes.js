// Mirrors the web app's getFileType + FILE_TYPE_CONFIG
export function getFileType(name = "") {
  const ext = name.split(".").pop().toLowerCase();
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
}

// Maps file type → Ionicons icon name + background colour
export const FILE_TYPE_META = {
  image:   { icon: "image-outline",          color: "#3b82f6" },
  video:   { icon: "videocam-outline",        color: "#8b5cf6" },
  audio:   { icon: "musical-notes-outline",   color: "#ec4899" },
  pdf:     { icon: "document-text-outline",   color: "#ef4444" },
  html:    { icon: "code-slash-outline",      color: "#f97316" },
  text:    { icon: "document-outline",        color: "#6b7280" },
  code:    { icon: "code-slash-outline",      color: "#22c55e" },
  word:    { icon: "document-text-outline",   color: "#1d4ed8" },
  excel:   { icon: "grid-outline",            color: "#059669" },
  archive: { icon: "archive-outline",         color: "#eab308" },
  other:   { icon: "document-outline",        color: "#9ca3af" },
};

export function getFileMeta(name) {
  return FILE_TYPE_META[getFileType(name)] || FILE_TYPE_META.other;
}

export function formatSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
