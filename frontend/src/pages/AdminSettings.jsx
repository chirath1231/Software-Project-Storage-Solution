import React, { useState } from 'react';
import { Eye, EyeOff, Camera, User } from 'lucide-react';

const AdminSettings = () => {
  // Mock Data - Read Only
  const adminData = {
    name: "System Administrator",
    email: "admin@storage-solution.com",
    role: "Admin"
  };

  const [profilePic, setProfilePic] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [successMessage, setSuccessMessage] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    
    // Action: Change Password
    setSuccessMessage(true);
    setPasswords({ current: '', new: '', confirm: '' });
    
    // Hide success popup after 4 seconds
    setTimeout(() => setSuccessMessage(false), 4000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  return (
    <div className="p-10 max-w-6xl mx-auto min-h-screen">
      {/* Page Title */}
      <div className="flex items-center gap-4 mb-12">
        <div className="w-2 h-10 bg-orange-500 rounded-md"></div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Profile Settings</h1>
      </div>

      {/* Success Notification Popup */}
      {successMessage && (
        <div className="fixed bottom-10 right-10 p-4 bg-orange-500 text-white font-bold rounded-xl shadow-2xl animate-bounce z-50">
          🚀 successfully changed password!
        </div>
      )}

      <div className="space-y-16">
        {/* Profile Details Section */}
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Photo Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-orange-400 p-1 bg-white overflow-hidden flex items-center justify-center shadow-lg">
                {profilePic ? (
                  <img src={profilePic} alt="Admin" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User size={80} className="text-gray-300" />
                )}
              </div>
              <label 
                htmlFor="photo-upload" 
                className="absolute bottom-2 right-2 p-3 bg-orange-500 text-white rounded-full cursor-pointer hover:bg-orange-600 transition-transform active:scale-90 shadow-md"
              >
                <Camera size={20} />
                <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Update Profile Image</p>
          </div>

          {/* Read Only Info Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Full Name</label>
              <input 
                type="text" 
                value={adminData.name} 
                readOnly 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 font-medium cursor-not-allowed outline-none shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">User Role</label>
              <input 
                type="text" 
                value={adminData.role} 
                readOnly 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 font-medium cursor-not-allowed outline-none shadow-inner"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Email Address</label>
              <input 
                type="email" 
                value={adminData.email} 
                readOnly 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 font-medium cursor-not-allowed outline-none shadow-inner"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Password Change Section */}
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Security Settings</h2>
          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2 relative">
              <label className="text-sm font-bold text-gray-600 block mb-2 ml-1">Current Password</label>
              <input 
                type={showCurrent ? "text" : "password"} 
                className="w-full p-4 pr-14 border-2 border-gray-100 rounded-2xl bg-white focus:border-orange-500 outline-none transition-all font-mono"
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                required
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-5 top-[46px] text-gray-400 hover:text-orange-500">
                {showCurrent ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            <div className="relative">
              <label className="text-sm font-bold text-gray-600 block mb-2 ml-1">New Password</label>
              <input 
                type={showNew ? "text" : "password"} 
                className="w-full p-4 pr-14 border-2 border-gray-100 rounded-2xl bg-white focus:border-orange-500 outline-none transition-all font-mono"
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                required
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-5 top-[46px] text-gray-400 hover:text-orange-500">
                {showNew ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            <div className="relative">
              <label className="text-sm font-bold text-gray-600 block mb-2 ml-1">Confirm New Password</label>
              <input 
                type={showConfirm ? "text" : "password"} 
                className="w-full p-4 pr-14 border-2 border-gray-100 rounded-2xl bg-white focus:border-orange-500 outline-none transition-all font-mono"
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-[46px] text-gray-400 hover:text-orange-500">
                {showConfirm ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs text-gray-400 mt-1 ml-1 italic leading-relaxed">
                * To ensure account security, your password should be at least 8 characters long and 
                contain an uppercase letter, a lowercase letter, a number, and a special character.
              </p>
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                className="w-full md:w-auto px-10 py-4 bg-orange-500 text-white font-bold text-lg rounded-2xl hover:bg-orange-600 transform transition-all active:scale-95 shadow-lg shadow-orange-200"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;