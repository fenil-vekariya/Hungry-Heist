import { useNavigate } from "react-router-dom";

function BackButton({ className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`group flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-gray-700 hover:text-orange-500 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/50 backdrop-blur-md font-bold text-sm ${className}`}
    >
      <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
        <i className="fa-solid fa-arrow-left"></i>
      </div>
      <span>Go Back</span>
    </button>
  );
}

export default BackButton;
