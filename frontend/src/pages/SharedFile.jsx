import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Download, FileText, Music, File, Lock } from "lucide-react";
import api from "../api/axios";

export default function SharedFile() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/shared/${token}/`)
      .then((res) => setFileData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          // Not logged in (or session expired) — send to login and come straight back here after.
          navigate("/login", { state: { from: location.pathname } });
        } else if (err.response?.status === 403) {
          setError("You don't have permission to access this file.");
        } else if (err.response?.status === 404) {
          setError("This share link is invalid or has been revoked.");
        } else if (err.response) {
          setError(err.response.data?.error || "Unable to load this file.");
        }
      });
  }, [token, navigate, location.pathname]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => navigate("/login", { state: { from: location.pathname } })}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ext = fileData.file_name.split(".").pop().toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
  const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(ext);
  const isAudio = ["mp3", "wav", "aac", "flac", "m4a"].includes(ext);
  const isPdf = ext === "pdf";

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">{fileData.file_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatSize(fileData.file_size)}</p>
          </div>
          <a
            href={fileData.file_url}
            download
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex-shrink-0 ml-4"
          >
            <Download size={15} />
            Download
          </a>
        </div>

        {/* Preview */}
        <div className="p-6">
          {isImage && (
            <img
              src={fileData.file_url}
              alt={fileData.file_name}
              className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
            />
          )}
          {isVideo && (
            <video controls autoPlay className="w-full max-h-[70vh] rounded-lg">
              <source src={fileData.file_url} />
            </video>
          )}
          {isAudio && (
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                <Music size={40} className="text-pink-500" />
              </div>
              <audio controls autoPlay className="w-full max-w-lg">
                <source src={fileData.file_url} />
              </audio>
            </div>
          )}
          {isPdf && (
            <iframe
              src={fileData.file_url}
              className="w-full border-0 rounded-lg"
              style={{ height: "75vh" }}
              title={fileData.file_name}
            />
          )}
          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="text-center py-16 text-gray-400">
              <File size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium mb-1">{fileData.file_name}</p>
              <p className="text-sm mb-6">Preview not available for this file type.</p>
              <a
                href={fileData.file_url}
                download
                className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
              >
                Download File
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2">
          <Lock size={12} className="text-gray-400" />
          <span className="text-xs text-gray-400">This file is protected — login is required to access it.</span>
        </div>
      </div>
    </div>
  );
}
