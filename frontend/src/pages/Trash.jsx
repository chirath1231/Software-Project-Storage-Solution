// src/pages/Trash.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

export default function Trash() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      const res = await api.get("/api/files/trash/");
      setFiles(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        alert("Failed to load trash.");
      }
    }
  };

  const restoreFile = async (id) => {
    try {
      await api.post(`/api/files/trash/${id}/restore/`);
      await fetchTrash();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        alert("Restore failed.");
      }
    }
  };

  const permanentDelete = async (id) => {
    if (
      !window.confirm(
        "This will permanently delete the file and cannot be undone. Continue?"
      )
    )
      return;
    try {
      await api.delete(`/api/files/trash/${id}/`);
      await fetchTrash();
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

  const emptyTrash = async () => {
    if (
      !window.confirm(
        `Permanently delete all ${files.length} files? This cannot be undone.`
      )
    )
      return;
    try {
      await Promise.all(
        files.map((f) => api.delete(`/api/files/trash/${f.id}/`))
      );
      await fetchTrash();
    } catch (err) {
      console.error(err);
      alert("Failed to empty trash.");
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
      return <ImageIcon size={48} className="text-blue-400" />;
    if (["mp4", "mov", "avi", "mkv"].includes(ext))
      return <Video size={48} className="text-purple-400" />;
    if (["pdf", "doc", "docx"].includes(ext))
      return <FileText size={48} className="text-red-400" />;
    return <File size={48} className="text-gray-400" />;
  };

  const totalSizeGB = (
    files.reduce((sum, f) => sum + (f.size || 0), 0) /
    1024 /
    1024 /
    1024
  ).toFixed(2);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trash</h1>
          <p className="text-gray-500">
            Files here are not counted toward your storage quota
          </p>
        </div>

        {files.length > 0 && (
          <button
            onClick={emptyTrash}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition"
          >
            <Trash2 size={16} />
            Empty Trash
          </button>
        )}
      </div>

      {/* INFO BANNER */}
      {files.length > 0 && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl px-4 py-3 text-sm mb-6">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            {files.length} file{files.length !== 1 ? "s" : ""} in trash ·{" "}
            {totalSizeGB} GB recoverable storage
          </span>
        </div>
      )}

      {/* LOADING */}
      {loading && <p className="text-gray-400">Loading trash...</p>}

      {/* EMPTY STATE */}
      {!loading && files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Trash2 size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg font-medium">Trash is empty</p>
          <p className="text-gray-300 text-sm mt-1">
            Deleted files will appear here
          </p>
        </div>
      )}

      {/* FILE GRID */}
      {!loading && files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center opacity-80 hover:opacity-100 transition"
            >
              <div className="mb-4 grayscale">{getFileIcon(file.name)}</div>

              <p
                className="font-medium truncate w-full text-gray-700"
                title={file.name}
              >
                {file.name}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>

              {file.deleted_at && (
                <p className="text-xs text-red-300 mt-0.5">
                  Deleted{" "}
                  {new Date(file.deleted_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}

              <div className="flex gap-2 mt-4 w-full">
                <button
                  onClick={() => restoreFile(file.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-sm bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded-lg transition"
                >
                  <RotateCcw size={13} />
                  Restore
                </button>
                <button
                  onClick={() => permanentDelete(file.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 rounded-lg transition"
                >
                  <Trash2 size={13} />
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