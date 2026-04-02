import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Card from "../components/Card";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/restaurant/all");
      setRestaurants(res.data);
    } catch (error) {
      console.log(error);
      setError("Failed to load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (id) => {
    navigate(`/menu/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Our Top <span className="text-brand-orange">Partner Restaurants</span>
          </h2>
          <p className="text-gray-500 text-lg">Discover the best flavors in your neighborhood.</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium tracking-tight">Finding the best spots...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 p-6 rounded-3xl text-center font-bold mb-10">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((r) => (
            <Card
              key={r._id}
              clickable
              onClick={() => handleClick(r._id)}
              className="group border-none bg-white overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative h-56 shrink-0 overflow-hidden">
                {r.image ? (
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-gray flex items-center justify-center text-gray-300">
                     <i className="fa-solid fa-utensils w-16 h-16 flex items-center justify-center text-4xl"></i>
                  </div>
                )}
                
                {/* Overlay Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md text-brand-orange px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                    <i className="fa-solid fa-star w-3 h-3 text-brand-yellow"></i> 4.5
                  </span>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-2xl font-black text-gray-900 group-hover:text-brand-orange transition-colors duration-300">
                      {r.name}
                    </h4>
                    <div className="bg-brand-orange/10 p-2 rounded-lg text-brand-orange scale-0 group-hover:scale-100 transition-transform duration-300">
                      <i className="fa-solid fa-arrow-right w-5 h-5 flex items-center justify-center"></i>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-2">
                    {r.description || "Experience the authentic flavors and warm hospitality of this local gem."}
                  </p>
                </div>
                
                <div className="border-t border-gray-50 pt-6 mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 text-[11px] font-bold uppercase tracking-wider truncate mr-2">
                    <i className="fa-solid fa-location-dot w-4 h-4 text-brand-orange flex items-center justify-center shrink-0"></i> 
                    <span className="truncate">{r.address}</span>
                  </div>
                  <span className="shrink-0 bg-yellow-200 text-black px-3 py-1 rounded-full text-sm font-medium">
                    OPEN NOW
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {restaurants.length === 0 && !loading && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <i className="fa-solid fa-utensils w-20 h-20 text-gray-200 mx-auto mb-6 flex items-center justify-center text-6xl"></i>
            <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">No restaurants found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Restaurants;

