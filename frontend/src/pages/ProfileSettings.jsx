import React, { useState } from "react";

export default function ProfileSettings() {
  const [profilePic, setProfilePic] = useState(null);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
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
    src={profilePic || "https://via.placeholder.com/140?text=+"}
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
            placeholder="Mehrab"
          />
        </div>
        <div>
          <label className="text-gray-700 font-semibold text-base">Last Name</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Bozorgi"
          />
        </div>

        <div className="col-span-2">
          <label className="text-gray-700 font-semibold text-base">Email</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="mehrabbozorgi.business@gmail.com"
          />
        </div>

        <div className="col-span-2">
          <label className="text-gray-700 font-semibold text-base">Address</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="33062 Zboncak Isle"
          />
        </div>

        <div className="col-span-2">
          <label className="text-gray-700 font-semibold text-base">Contact Number</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="58077.79"
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-base">City</label>
          <select className="w-full border rounded-lg p-2">
            <option>Mehrab</option>
          </select>
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-base">State</label>
          <select className="w-full border rounded-lg p-2">
            <option>Bozorgi</option>
          </select>
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
          <button className="border border-orange-400 text-orange-400 px-5 py-2 rounded-xl">
            Cancel
          </button>
          <button className="bg-orange-400 text-white px-5 py-2 rounded-xl">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
