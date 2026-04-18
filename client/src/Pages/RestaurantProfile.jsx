import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Button from "../components/Button";

function RestaurantProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    category: "Both",
    cuisine: "",
    openingTime: "09:00",
    closingTime: "22:00",
    description: "",
    averagePrice: "",
    deliveryTime: "",
    deliveryCharge: ""
  });

  const [profileImg, setProfileImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchExistingProfile();
  }, []);

  const fetchExistingProfile = async () => {
    try {
      const res = await API.get("/restaurant/my");
      if (res.data) {
        setIsEdit(true);
        const p = res.data;
        // Attempt to split address back into components if possible
        const addressParts = p.address ? p.address.split(", ") : ["", "", ""];
        const lastPart = addressParts[addressParts.length - 1] || "";
        const pincodeMatch = lastPart.match(/\d{6}/);
        const city = pincodeMatch ? lastPart.replace(` - ${pincodeMatch[0]}`, "") : lastPart;
        
        setFormData({
          restaurantName: p.name || "",
          ownerName: p.owner?.name || "", 
          email: p.email || "",
          phone: p.phone || "",
          address: addressParts[0] || "",
          city: city || "",
          pincode: pincodeMatch ? pincodeMatch[0] : "",
          category: p.category || "Both",
          cuisine: p.cuisine || "",
          openingTime: p.openingTime || "09:00",
          closingTime: p.closingTime || "22:00",
          description: p.description || "",
          averagePrice: p.averagePrice || "",
          deliveryTime: p.deliveryTime || "",
          deliveryCharge: p.deliveryCharge || ""
        });
        setPreviewUrl(p.image);
      }
    } catch (err) {
      console.log("No existing profile found or error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Mandatory Field Verification ("Fill up the blank")
    const requiredFields = [
      'restaurantName', 'ownerName', 'email', 'phone', 
      'address', 'city', 'pincode', 'description'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        setError(`Please fill up the blank: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      // Required Backend Mapping
      data.append("name", formData.restaurantName);
      data.append("description", formData.description);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      // Concatenate detailed address for the main 'address' field
      const fullAddress = `${formData.address}, ${formData.city} - ${formData.pincode}`;
      data.append("address", fullAddress);
      data.append("category", formData.category);
      data.append("cuisine", formData.cuisine);
      data.append("openingTime", formData.openingTime);
      data.append("closingTime", formData.closingTime);
      data.append("averagePrice", formData.averagePrice);
      data.append("deliveryTime", formData.deliveryTime);
      data.append("deliveryCharge", formData.deliveryCharge);
      
      if (profileImg) {
        data.append("image", profileImg);
      }

      if (isEdit) {
        await API.put("/restaurant/update", data);
        setSuccess("Restaurant profile updated successfully!");
      } else {
        await API.post("/restaurant/create", data);
        setSuccess("Restaurant profile created successfully!");
      }

      setTimeout(() => navigate("/restaurant-dashboard"), 2000);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-4 pb-10 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {isEdit ? "Update Your" : "Create Your"} <span className="text-brand-orange">Restaurant Profile</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">Complete your profile to start receiving orders.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-lg"></i>
            <span className="font-bold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100 flex items-center gap-3 animate-bounce">
            <i className="fa-solid fa-circle-check text-lg"></i>
            <span className="font-bold">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Basic Details */}
            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Restaurant Name</label>
              <input 
                type="text" 
                name="restaurantName"
                required
                placeholder="e.g. The Grand Heist"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.restaurantName || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Owner Name</label>
              <input 
                type="text" 
                name="ownerName"
                required
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.ownerName || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Official Email</label>
              <input 
                type="email" 
                name="email"
                required
                placeholder="restaurant@example.com"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.email || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Contact Number</label>
              <input 
                type="text" 
                name="phone"
                required
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.phone || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* 2. Address Details */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Local Address</label>
              <input 
                type="text" 
                name="address"
                required
                placeholder="Street name, Landmark..."
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.address || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">City</label>
              <input 
                type="text" 
                name="city"
                required
                placeholder="Your City"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.city || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Pincode</label>
              <input 
                type="text" 
                name="pincode"
                required
                placeholder="6 digits"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.pincode || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* 3. Specialty & Timing */}
            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Category</label>
              <select 
                name="category"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800 cursor-pointer"
                value={formData?.category || "Both"}
                onChange={handleInputChange}
              >
                <option value="Veg">Pure Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Primary Cuisine</label>
              <input 
                type="text" 
                name="cuisine"
                placeholder="e.g. Mughlai, Chinese"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.cuisine || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Opening Time</label>
              <input 
                type="time" 
                name="openingTime"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800 cursor-pointer"
                value={formData?.openingTime || "09:00"}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Closing Time</label>
              <input 
                type="time" 
                name="closingTime"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800 cursor-pointer"
                value={formData?.closingTime || "22:00"}
                onChange={handleInputChange}
              />
            </div>

            {/* 4. Description */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">About Your Restaurant</label>
              <textarea 
                name="description"
                required
                rows="3"
                placeholder="Tell your story to the foodies..."
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.description || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* 5. Pricing & Delivery */}
            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Avg. Price for Two (₹)</label>
              <input 
                type="number" 
                name="averagePrice"
                placeholder="e.g. 500"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.averagePrice || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium mb-1 text-gray-600 block px-1">Dine-in / Takeaway Time</label>
              <input 
                type="text" 
                name="deliveryTime"
                placeholder="e.g. 15-20 mins"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold text-gray-800"
                value={formData?.deliveryTime || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* 6. Image Setup */}
            <div className="md:col-span-2 py-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-orange-400 transition-colors group cursor-pointer relative overflow-hidden">
                {previewUrl ? (
                    <img 
                       src={previewUrl.startsWith("blob:") || previewUrl.startsWith("http") ? previewUrl : `http://localhost:5000/${previewUrl.replace(/\\/g, '/')}`} 
                       onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/e2e8f0/1e293b?text=${encodeURIComponent(formData?.restaurantName || "Preview")}`; }} 
                       alt="Preview" 
                       className="w-full h-40 object-cover rounded-xl" 
                    />
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-300 group-hover:text-orange-400 transition-colors mb-2"></i>
                    <p className="text-gray-400 font-bold text-sm">Upload Profile / Cover Image</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-black text-lg shadow-lg hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i> Saving...
              </span>
            ) : (
              isEdit ? "Update Restaurant Profile" : "Create Restaurant Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RestaurantProfile;
