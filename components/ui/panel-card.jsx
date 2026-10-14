const PanelCard = ({ title, action, children, className = "", id }) => (
  <section id={id} className={`flex min-w-0 flex-col gap-4 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-4 sm:p-6 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3">
        {title && <h2 className="font-machina text-xl">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);

export default PanelCard;
