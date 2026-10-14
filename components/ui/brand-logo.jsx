import Link from "next/link";

const BrandLogo = ({ brand, href = "/" }) => {
  const [first, ...rest] = (brand?.name ?? "").split(" ");
  return (
    <Link href={href} className="flex w-50 items-center gap-3 sm:w-54">
      {brand?.logo?.url ? (
        <img src={brand.logo.url} alt={brand.name} className="h-10 w-auto" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white font-machina text-xl font-bold text-black">{first?.[0]}</span>
      )}
      <span className="border-l border-current/40 pl-3 font-machina text-[1.35rem] leading-tight">
        {first}
        <br />
        {rest.join(" ")}
      </span>
    </Link>
  );
};

export default BrandLogo;
