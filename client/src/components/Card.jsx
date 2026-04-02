function Card({ children, onClick, clickable = false, className = "", style }) {
  const baseStyles = "bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden transition-all duration-300";
  const clickableStyles = clickable ? "cursor-pointer hover:shadow-premium-hover hover:-translate-y-1 active:scale-[0.98]" : "";
  
  const finalClassName = `
    ${baseStyles}
    ${clickableStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={finalClassName} onClick={onClick} style={style}>
      {children}
    </div>
  );
}

export default Card;

  
