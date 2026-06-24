import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SharedFile() {
  const { token } = useParams();
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token_auth = localStorage.getItem("access_token"); // your JWT key name

    fetch(`http://localhost:8000/api/shared/${token}/`, {
      headers: token_auth
        ? { Authorization: `Bearer ${token_auth}` }
        : {},
    })
      .then((res) => {
        if (res.status === 401) throw new Error("login");
        if (res.status === 403) throw new Error("permission");
        if (!res.ok) throw new Error("invalid");
        return res.json();
      })
      .then(setFileData)
      .catch((err) => {
        if (err.message === "login")
          setError("You must be logged in to access this file.");
        else if (err.message === "permission")
          setError("You don't have permission to access this file.");
        else
          setError("This link is invalid or has been revoked.");
      });
  }, [token]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  if (!fileData) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const ext = fileData.file_name.split(".").pop().toLowerCase();
  const isImage = ["png","jpg","jpeg","gif","webp","svg"].includes(ext);
  const isVideo = ["mp4","mov","avi","mkv","webm"].includes(ext);
  const isAudio = ["mp3","wav","aac","flac","m4a"].includes(ext);
  const isPdf   = ext === "pdf";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">{fileData.file_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{(fileData.file_size / 1024).toFixed(1)} KB</p>
          </div>
          <a href={fileData.file_url} download
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Download
          </a>
        </div>

        {/* Preview */}
        <div className="p-6">
          {isImage && (
            <img src={fileData.file_url} alt={fileData.file_name}
              className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg" />
          )}
          {isVideo && (
            <video controls autoPlay className="w-full max-h-[70vh] rounded-lg">
              <source src={fileData.file_url} />
            </video>
          )}
          {isAudio && (
            <audio controls autoPlay className="w-full mt-8">
              <source src={fileData.file_url} />
            </audio>
          )}
          {isPdf && (
            <iframe src={fileData.file_url} className="w-full border-0 rounded-lg" style={{ height: "75vh" }} />
          )}
          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="text-center py-16 text-gray-400">
              <p className="mb-4">Preview not available for this file type.</p>
              <a href={fileData.file_url} download
                className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}