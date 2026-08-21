import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Download, Folder, File, Lock, FileText, Image as ImageIcon, Music, Video } from "lucide-react";
import api from "../api/axios";

export default function SharedFolder() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/shared/folder/${token}/`)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login", { state: { from: location.pathname } });
        } else if (err.response?.status === 403) setError("You don't have permission to access this folder.");
        else if (err.response?.status === 404) setError("This share link is invalid or has been revoked.");
        else if (err.response) setError(err.response.data?.error || "Unable to load this folder.");
      });
  }, [token, navigate, location.pathname]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const getIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    if (["png","jpg","jpeg","gif","webp","svg"].includes(ext)) return <ImageIcon size={18} className="text-blue-400" />;
    if (["mp4","mov","avi","mkv","webm"].includes(ext)) return <Video size={18} className="text-purple-400" />;
    if (["mp3","wav","aac","flac","m4a"].includes(ext)) return <Music size={18} className="text-pink-400" />;
    if (["pdf","doc","docx","txt","md"].includes(ext)) return <FileText size={18} className="text-red-400" />;
    return <File size={18} className="text-gray-400" />;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <button onClick={() => navigate("/login", { state: { from: location.pathname } })}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Folder size={26} className="text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{data.folder_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{data.files.length} file{data.files.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* File list */}
        <div className="divide-y divide-gray-100">
          {data.files.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-6">
              <Folder size={44} className="text-gray-200 mb-3" />
              <p className="text-gray-400 font-medium">This folder is empty</p>
            </div>
          ) : (
            data.files.map((file) => (
              <div key={file.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getIcon(file.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatSize(file.size)}
                    {file.uploaded_at && <span> · {formatDate(file.uploaded_at)}</span>}
                  </p>
                </div>
                <a href={file.url} download
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}>
                  <Download size={13} /> Download
                </a>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2">
          <Lock size={12} className="text-gray-400" />
          <span className="text-xs text-gray-400">This folder is protected — login is required to access it.</span>
        </div>
      </div>
    </div>
  );
}
