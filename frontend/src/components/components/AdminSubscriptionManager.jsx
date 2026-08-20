import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Settings, Save, Pencil } from "lucide-react";

export default function AdminSubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState([]); //Stores all subscription plans from backend
  const [editingId, setEditingId] = useState(null); //Tracks which subscription is currently being edited.
  const [formData, setFormData] = useState({}); //Stores edited form values temporarily.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get("/api/subscriptions/"); //Fetches all subscription plans.
      setSubscriptions(res.data); //Stores API response into state.
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  //Runs when admin clicks
  const handleEdit = (sub) => {
    setEditingId(sub.id);

    setFormData({
      name: sub.name || "",
      description: sub.description || "",
      storage: sub.storage || 0,
      price: sub.price || "",
      features: sub.features
        ? sub.features.join("\n")
        : "",
    });
  };

  //Save Changes button calls this function, which sends updated data to backend and refreshes list.
  const handleSave = async (id) => {
    try {
      await api.put(
        `/api/subscriptions/admin/update-subscription/${id}/`,
        {
          ...formData,
          features: formData.features
            .split("\n")
            .filter((f) => f.trim() !== ""),
        }
      );

      alert("Subscription updated successfully!");

      setEditingId(null);
      fetchSubscriptions();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update subscription");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading subscription plans...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 mb-8">
      <h2 className="text-2xl font-black text-gray-800 mb-2 flex items-center gap-3">
        <Settings size={24} className="text-orange-500" />
        Subscription Plan Management
      </h2>

      <p className="text-gray-500 mb-8">
        Edit pricing, storage, descriptions and features.
      </p>

      <div className="space-y-6">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            //Is this plan currently editing?
            {editingId === sub.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Plan Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="number"
                  placeholder="Storage"
                  value={formData.storage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storage: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3"
                  rows={3}
                />

                <textarea
                  placeholder="Features (one per line)"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3"
                  rows={5}
                />

                <button
                  onClick={() => handleSave(sub.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-gray-800">
                    {sub.name}
                  </h3>

                  <p className="text-gray-500 mt-2">
                    {sub.description}
                  </p>

                  <div className="mt-4 flex gap-6 text-sm font-bold text-gray-700">
                    <span>
                      Price: Rs. {Number(sub.price).toFixed(2)}
                    </span>

                    <span>
                      Storage: {sub.storage} GB
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleEdit(sub)}
                  className="bg-orange-100 text-orange-600 hover:bg-orange-200 px-5 py-3 rounded-xl font-bold flex items-center gap-2"
                >
                  <Pencil size={18} />
                  Edit Plan
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}