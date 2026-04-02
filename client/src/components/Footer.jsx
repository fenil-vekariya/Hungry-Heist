function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-brand-orange p-1.5 rounded-lg">
                <i className="fa-solid fa-utensils text-white w-5 h-5 flex items-center justify-center"></i>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Hungry Heist
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Modernizing the way you experience food. Discover the best tastes around you with ease and style.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-50 rounded-xl hover:bg-brand-orange/10 hover:text-brand-orange transition-all duration-300">
                <i className="fa-brands fa-facebook"></i>
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-xl hover:bg-brand-orange/10 hover:text-brand-orange transition-all duration-300">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-xl hover:bg-brand-orange/10 hover:text-brand-orange transition-all duration-300">
                <i className="fa-brands fa-twitter"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-brand-orange text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-orange text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-orange text-sm transition-colors">Partner with us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-orange text-sm transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-brand-orange text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-orange text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-orange text-sm transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Join the Heist</h4>
            <p className="text-gray-500 text-sm mb-4">Subscribe for the latest updates and delicious deals.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-gray-50 border-none px-4 py-2 rounded-xl text-sm w-full"
              />
              <button className="bg-brand-orange text-white p-2 rounded-xl hover:bg-brand-orange/90 transition-all">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Hungry Heist. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-brand-orange text-xs">Help Center</a>
            <a href="#" className="text-gray-400 hover:text-brand-orange text-xs">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

