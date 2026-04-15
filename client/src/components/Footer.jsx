function Footer() {
  return (
    <footer className="flex flex-col items-center text-center gap-2 py-6 bg-white border-t border-gray-100">
      {/* Logo / Name */}
      <div className="flex items-center gap-2">
        <div className="bg-brand-orange p-1.5 rounded-lg">
          <i className="fa-solid fa-utensils text-white w-4 h-4 flex items-center justify-center"></i>
        </div>
        <span className="text-lg font-semibold text-gray-900 tracking-tight">
          Hungry Heist
        </span>
      </div>

      {/* Tagline */}
      <p className="text-sm text-gray-500">
        Delicious food, delivered simply.
      </p>

      {/* Copyright */}
      <p className="text-xs text-gray-400 mt-1">
        © {new Date().getFullYear()} Hungry Heist. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
