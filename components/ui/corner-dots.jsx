const positions = [
  "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
  "top-0 right-0 translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
  "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
];

const CornerDots = ({ className = "size-[3px] bg-white" }) =>
  positions.map((p) => <span key={p} className={`absolute z-10 aspect-square ${p} ${className}`} />);

export default CornerDots;
