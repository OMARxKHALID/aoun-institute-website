const RollText = ({ children, className = "", hoverClass = "" }) => (
  <span className={`relative block w-max overflow-hidden ${className}`}>
    <span className="block transition-transform duration-300 ease-out group-show:-translate-y-full">{children}</span>
    <span aria-hidden className={`absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-show:translate-y-0 ${hoverClass}`}>
      {children}
    </span>
  </span>
);

export default RollText;
