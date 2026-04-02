function Button({ children, variant = "primary", fullWidth = false, className = "", ...rest }) {
  const variants = {
    primary: "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-md hover:shadow-lg active:scale-95",
    secondary: "bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 shadow-md hover:shadow-lg active:scale-95",
    outline: "border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white active:scale-95",
    ghost: "text-gray-600 hover:bg-gray-100 active:scale-95",
  };

  const baseStyles = "px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const finalClassName = `
    ${baseStyles}
    ${variants[variant] || variants.primary}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button {...rest} className={finalClassName}>
      {children}
    </button>
  );
}

export default Button;

