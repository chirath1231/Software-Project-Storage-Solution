import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

export default function ProfileSettings() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const { user: authUser } = useAuth();

  const [profilePic, setProfilePic] = useState(null); // Actual File object for upload
  const [profilePicURL, setProfilePicURL] = useState(""); // URL for preview
=======
  const { user, setUser } = useAuth();

  const [profilePic, setProfilePic] = useState(null); // actual File object
  const [profilePicURL, setProfilePicURL] = useState(""); // preview Displaying image
>>>>>>> origin/main
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
<<<<<<< HEAD
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
=======
  const [showMenu, setShowMenu] = useState(false);

  // contact validation state
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    api.get("/api/accounts/profile/")
      .then(res => {
        const user = res.data;
        setUsername(user.username || "");
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
        setEmail(user.email || "");
        setAddress(user.address || "");
        setContact(user.contact_number || "");
        setCity(user.city || "");
        setState(user.state || "");
        setProfilePicURL(user.profile_picture || "");
        setProfilePic(null); // important: no file yet
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  const handleSave = async () => {

    // validation BEFORE API call
    const phoneRegex = /^(?:\+94|0)?7\d{8}$/;
    if (!phoneRegex.test(contact)) {
      setContactError("Invalid phone number format");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("username", username);
      formData.append("address", address);
      formData.append("contact_number", contact);
      formData.append("city", city);
      formData.append("state", state);

      if (profilePic) {
        formData.append("profile_picture", profilePic) // attach selected file
      }else if (profilePicURL === "") {
        formData.append("profile_picture", ""); // tell backend to remove
      };  

      const res = await api.put("/api/accounts/profile-update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Update preview with saved URL
      if (res.data.profile_picture) setProfilePicURL(res.data.profile_picture);

      alert("Profile updated successfully!");
      // Navigate back to profile page
      navigate("/dashboard/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };
>>>>>>> origin/main

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
<<<<<<< HEAD
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
=======
      setProfilePic(file); // store file for upload
      setProfilePicURL(URL.createObjectURL(file)); // show preview
      setShowMenu(false);
>>>>>>> origin/main
    }
  };

  return (
    <div className="min-h-screen p-12"> 
      {/* Profile Title + Avatar Row */}
      <div className="flex items-center mb-6 -ml-2 justify-between">
<<<<<<< HEAD
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
=======
        <div className="flex items-center mb-6 ml-4"> {/* shift the whole row a bit right */}
        <div className="w-1 h-10 bg-orange-500 rounded-md mr-3"></div> {/* orange vertical line */}
        <h2 className="text-3xl font-bold text-gray-800">Edit Profile</h2>
      </div>

      {/* Profile Picture */}
      <div className="relative w-24 h-24"> 
        {/* Circle Image Container */}
        <div className="w-24 h-24 rounded-full overflow-hidden cursor-pointer border-4 border-orange-400"> 
          <img
            src={profilePicURL || "/default-profile.png"}
            alt="profile"
            className="w-full h-full object-cover"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
>>>>>>> origin/main
          />
        </div>
        {/* Hidden Input */}
        <input
          id="profileInput"
          type="file"
          accept="image/*"
          onChange={handleProfileChange}
          className="hidden"
        />
        {/* Popup Menu */}
        {showMenu && (
          <div
            className="absolute w-40 h-15 overflow-visible p-2 top-full mt-2 left-0 bg-white shadow-lg rounded-md border z-[99999]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="block w-full h-7 text-left hover:bg-gray-100"
              onClick={() => document.getElementById("profileInput").click()}
            >
              Upload a photo
            </button>

<<<<<<< HEAD
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
=======
            {profilePicURL && (
              <button
                className="block w-full h-7 text-left hover:bg-gray-100"
                onClick={() => {
                  setProfilePic(null);
                  setProfilePicURL("");
                  setShowMenu(false);
                }}
              >
                Remove photo
              </button>
            )}
          </div>
        )}
>>>>>>> origin/main
      </div>
    </div>

    {/* Form Card */}
    <div className="grid grid-cols-2 gap-6">
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
      <div>
        <label className="text-gray-700 font-semibold text-base">Username</label>
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <label className="text-gray-700 font-semibold text-base">Email</label>
        <input
          className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
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
          type="tel"
          className="w-full border rounded-lg p-2"
          placeholder="Contact Number"
          value={contact}
          onChange={(e) => {
              setContact(e.target.value);
              setContactError(""); // clear error on typing
          }}
        />
        {contactError && (
            <p className="text-red-500 text-sm mt-1">{contactError}</p>
        )}
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
          <option value="Gampaha">Gampaha</option>
          <option value="Matara">Matara</option>
          <option value="Galle">Galle</option>
          <option value="Kandy">Kandy</option>
        </select>
      </div>

      <div>
        <label className="text-gray-700 font-semibold text-base">Country</label>
        <select
          className="w-full border rounded-lg p-2"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">Select Country</option>
          <option value="SriLanka">Sri Lanka</option>
          <option value="India">India</option>
        </select>
      </div>

      <div className="col-span-2 flex justify-end gap-4 mt-4">
        <button className="border border-orange-400 text-orange-400 px-5 py-2 rounded-xl"
        onClick={() => navigate("/dashboard/profile")}>
          Cancel
        </button>
        <button className="bg-orange-400 text-white px-5 py-2 rounded-xl"
        onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  </div>
  );
}