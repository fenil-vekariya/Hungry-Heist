import { useState, useEffect } from "react";
import API from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";

function Profile() {
  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'info', 'address'
  
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: {}
  });

  const [infoForm, setInfoForm] = useState({
    name: "", email: "", phone: "", oldPassword: "", newPassword: "", confirmPassword: ""
  });

  const [addressForm, setAddressForm] = useState({
    flat: "", building: "", area: "", town: "", city: "", state: "", country: "", pin: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setUser(res.data);
      setInfoForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      if (res.data.address) setAddressForm({
          flat: res.data.address.flat || "",
          building: res.data.address.building || "",
          area: res.data.address.area || "",
          town: res.data.address.town || "",
          city: res.data.address.city || "",
          state: res.data.address.state || "",
          country: res.data.address.country || "",
          pin: res.data.address.pin || ""
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (infoForm.newPassword && infoForm.newPassword !== infoForm.confirmPassword) {
      return setMessage("Passwords do not match");
    }
    if (infoForm.phone && infoForm.phone.length !== 10) {
      return setMessage("Phone number must be exactly 10 digits");
    }
    setLoading(true);
    try {
      await API.put("/auth/profile", infoForm);
      setMessage("Profile updated");
      fetchProfile();
      setActiveTab("profile");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put("/auth/address", addressForm);
      setMessage("Address updated");
      fetchProfile();
      setActiveTab("profile");
    } catch (err) {
      setMessage("Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  const getAddressString = () => {
    if (!user.address || !user.address.city) return "please enter your address";
    const parts = [
      user.address.flat, user.address.building, user.address.area, 
      user.address.town, user.address.city, user.address.state, user.address.pin
    ].filter(Boolean);
    return parts.join(", ") || "please enter your address";
  };

  return (
    <div className="pt-8 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">My Account</h1>
        <p className="text-gray-500">Manage your profile, account settings, and delivery addresses.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
            {[
              { id: "profile", label: "Overview", icon: "fa-user" },
              { id: "info", label: "Update Info", icon: "fa-pen-to-square" },
              { id: "address", label: "Delivery Address", icon: "fa-location-dot" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMessage(""); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global Feedback Message */}
        {message && (
          <div className={`p-4 rounded-xl text-center font-medium border flex items-center justify-center gap-3 animate-in fade-in duration-300 ${
            message.toLowerCase().includes("fail") || message.toLowerCase().includes("not match")
              ? "bg-red-50 text-red-600 border-red-100" 
              : "bg-green-50 text-green-700 border-green-100"
          }`}>
            <i className={`fa-solid ${message.toLowerCase().includes("fail") ? 'fa-circle-xmark' : 'fa-circle-check'}`}></i>
            {message}
          </div>
        )}

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "profile" && (
            <Card className="p-8 md:p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner border border-orange-100">
                  <i className="fa-solid fa-circle-user"></i>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{user.name}</h3>
                <p className="text-gray-500 font-medium mb-8">{user.email}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mx-auto">
                    <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left hover:border-orange-200 transition-colors group">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm transition-transform group-hover:scale-110">
                            <i className="fa-solid fa-phone"></i>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Phone Number</p>
                            <p className="font-bold text-gray-900">{user.phone || "Not provided"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left hover:border-orange-200 transition-colors group">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm transition-transform group-hover:scale-110">
                            <i className="fa-solid fa-location-dot"></i>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Primary Address</p>
                            <p className="font-bold text-gray-900 truncate">{getAddressString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-10">
                    <Button variant="secondary" className="px-8" onClick={() => setActiveTab("info")}>Edit Details</Button>
                    <Button className="px-8 shadow-lg shadow-orange-500/20" onClick={() => setActiveTab("address")}>Manage Address</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "info" && (
            <Card className="p-8 md:p-10 max-w-xl mx-auto">
              <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">Update Personal Details</h3>
              <form onSubmit={handleInfoSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input className="w-full h-12" type="text" placeholder="Your full name" value={infoForm.name} onChange={e => setInfoForm({...infoForm, name: e.target.value})} required />
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input className="w-full h-12" type="email" placeholder="example@mail.com" value={infoForm.email} onChange={e => setInfoForm({...infoForm, email: e.target.value})} required />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input className="w-full h-12" type="text" placeholder="10-digit number" value={infoForm.phone} onChange={e => setInfoForm({...infoForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} maxLength={10} />
                </div>

                <div className="pt-6 border-t border-gray-100 mt-8">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Security & Password</p>
                  
                  <div className="space-y-4">
                    <input className="w-full h-12 bg-gray-50 border-gray-100" type="password" placeholder="Current Password" value={infoForm.oldPassword} onChange={e => setInfoForm({...infoForm, oldPassword: e.target.value})} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="w-full h-12 bg-gray-50 border-gray-100" type="password" placeholder="New Password" value={infoForm.newPassword} onChange={e => setInfoForm({...infoForm, newPassword: e.target.value})} />
                        <input className="w-full h-12 bg-gray-50 border-gray-100" type="password" placeholder="Confirm Password" value={infoForm.confirmPassword} onChange={e => setInfoForm({...infoForm, confirmPassword: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10 pt-4">
                  <Button fullWidth type="submit" disabled={loading} className="h-12 shadow-lg shadow-orange-500/20">{loading ? "Saving..." : "Save Changes"}</Button>
                  <Button fullWidth type="button" variant="secondary" className="h-12" onClick={() => setActiveTab("profile")}>Back to Overview</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "address" && (
            <Card className="p-8 md:p-10 max-w-2xl mx-auto">
              <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">Delivery Address</h3>
              <p className="text-gray-500 text-sm text-center mb-10">Ensure your address is accurate for lightning fast delivery.</p>
              
              <form onSubmit={handleAddressSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {["flat", "building", "area", "town", "city", "state", "country", "pin"].map(field => (
                    <div key={field} className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field}</label>
                        <input 
                            className="w-full h-11 text-sm bg-gray-50 border-gray-100" 
                            type="text" 
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)} 
                            value={addressForm[field]} 
                            onChange={e => setAddressForm({...addressForm, [field]: e.target.value})} 
                        />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-12 pt-8 border-t border-gray-100">
                  <Button fullWidth type="submit" disabled={loading} className="h-12 shadow-lg shadow-orange-500/20">Update Address</Button>
                  <Button fullWidth type="button" variant="secondary" className="h-12" onClick={() => setActiveTab("profile")}>Back to Overview</Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
