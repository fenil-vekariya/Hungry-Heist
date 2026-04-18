import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function DeliveryAgentProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
    isApproved: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/auth/profile");
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile", error);
      setMessage({ type: "error", text: "Failed to load profile details." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // 1. Mandatory Field Verification
    if (!profile.name.trim() || !profile.phone.trim() || !profile.vehicleType || !profile.vehicleNumber.trim()) {
      setMessage({ type: "error", text: "Please fill up all required fields" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await API.put("/auth/profile", profile);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error updating profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><i className="fa-solid fa-spinner fa-spin text-4xl text-brand-orange"></i></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 pt-4 pb-10 flex items-center justify-between">
          <div>
            <button 
              onClick={() => navigate("/delivery-agent-dashboard")}
              className="text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2"
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
            </button>
            <h1 className="text-3xl font-black text-gray-900">Partner <span className="text-brand-orange">Profile</span></h1>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${profile.isApproved ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-brand-orange border-orange-100'}`}>
              {profile.isApproved ? 'Approved Partner' : 'Pending Approval'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">


          <form onSubmit={handleUpdate} className="p-8 space-y-8">
            {message.text && (
              <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-700 focus:border-brand-orange focus:bg-white outline-none transition-all shadow-inner"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-400 cursor-not-allowed outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 font-bold italic">* Contact support to change email</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-700 focus:border-brand-orange focus:bg-white outline-none transition-all shadow-inner"
                    placeholder="91XXXXXXXX"
                    required
                  />
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vehicle Type</label>
                  <select 
                    name="vehicleType"
                    value={profile.vehicleType}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-700 focus:border-brand-orange focus:bg-white outline-none transition-all shadow-inner"
                    required
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Electric">Electric</option>
                    <option value="Cycle">Cycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vehicle Number</label>
                  <input 
                    type="text" 
                    name="vehicleNumber"
                    value={profile.vehicleNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-700 focus:border-brand-orange focus:bg-white outline-none transition-all shadow-inner"
                    placeholder="MH-12-XX-XXXX"
                    required
                  />
                </div>
                <div className="pt-6">
                   <div className="bg-brand-orange/5 p-6 rounded-2xl border border-brand-orange/10 flex items-center gap-4">
                      <div className="bg-brand-orange text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
                        <i className="fa-solid fa-shield-halved"></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Verification</p>
                        <p className="text-xs font-bold text-gray-700 leading-tight">Your vehicle details are used for order verification.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>


            <div className="pt-8 border-t border-gray-50 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="bg-brand-orange text-white px-12 py-4 rounded-2xl font-black hover:bg-brand-orange/90 active:scale-95 transition-all shadow-xl shadow-brand-orange/20 uppercase tracking-widest text-xs flex items-center gap-3 disabled:opacity-50"
              >
                {saving ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                ) : (
                  <><i className="fa-solid fa-floppy-disk"></i> Save Profile Details</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DeliveryAgentProfile;
