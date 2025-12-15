import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Dashboard (Protected)</h1>
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
