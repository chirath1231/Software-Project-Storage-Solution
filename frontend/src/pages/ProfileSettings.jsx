import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [profilePic, setProfilePic] = useState(null); // Actual File object for upload
  const [profilePicURL, setProfilePicURL] = useState(""); // URL for preview
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  // Fetch current user data on component mount
  useEffect(() => {
    api.get("/api/accounts/profile/")
      .then(res => {
        const u = res.data;
        setUsername(u.username || "");
        setFirstName(u.first_name || "");
        setLastName(u.last_name || "");
        setEmail(u.email || "");
        setAddress(u.address || "");
        setContact(u.contact_number || "");
        setCity(u.city || "");
        setState(u.state || "");
        setCountry(u.country || "");
        setProfilePicURL(u.profile_picture || "");
      })
      .catch(err => console.error("Error fetching profile:", err));
  }, []);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicURL(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("username", username);
      formData.append("address", address);
      formData.append("contact_number", contact);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("country", country);

      if (profilePic) {
        formData.append("profile_picture", profilePic);
      }

      await api.put("/api/accounts/profile-update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="w-full pr-12"> {/* More space on right-hand side */}
      {/* Profile Title + Avatar Row */}
      <div className="flex items-center mb-6 -ml-2 justify-between">
      <div className="flex items-center mb-6 ml-4"> {/* shift the whole row a bit right */}
  <div className="w-1 h-10 bg-orange-500 rounded-md mr-3"></div> {/* orange vertical line */}
  <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
</div>
<div className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer border-4 border-orange-400">
  <img
    src={profilePicURL || "https://via.placeholder.com/140?text=+"}
    alt="profile"
    className="w-full h-full object-cover"
    onClick={() => document.getElementById("profileInput").click()}
  />
  <input
    id="profileInput"
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) setProfilePic(URL.createObjectURL(file));
    }}
    className="hidden"
  />
</div>


      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-2xl shadow-md grid grid-cols-2 gap-6">
        <div>
          <label className="text-gray-700 font-semibold text-base">First Name</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-gray-700 font-semibold text-base">Last Name</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-gray-700 font-semibold text-base">Email</label>
          <input
            className="w-full border rounded-lg p-2 bg-gray-50 cursor-not-allowed"
            value={email}
            readOnly
          />
        </div>

        <div className="col-span-2">
          <label className="text-gray-700 font-semibold text-base">Address</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-gray-700 font-semibold text-base">Contact Number</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-base">City</label>
          <select 
            className="w-full border rounded-lg p-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">Select City</option>
            <option value="Colombo">Colombo</option>
            <option value="Kandy">Kandy</option>
          </select>
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-base">State</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-gray-700 font-semibold text-base">Country</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-gray-700 font-semibold text-base">Password</label>
          <input
            type="password"
            className="w-full border rounded-lg p-2"
            placeholder="********"
          />
        </div>

        <div className="col-span-2 flex justify-end gap-4 mt-4">
          <button 
            className="border border-orange-400 text-orange-400 px-5 py-2 rounded-xl"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
          <button 
            className="bg-orange-400 text-white px-5 py-2 rounded-xl"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
