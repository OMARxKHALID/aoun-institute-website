import Marquee from "@/components/motion/marquee";

const LogoMarquee = ({ partners }) => (
  <section className="py-20 mask-x-from-85%">
    <Marquee>
      {partners.map(({ name, logo }) =>
        logo?.url ? (
          <img key={name} src={logo.url} alt={name} className="mr-24 h-10 w-auto opacity-80" />
        ) : (
          <span key={name} className="whitespace-nowrap pr-24 font-machina text-4xl font-bold text-white">
            {name}
          </span>
        ),
      )}
    </Marquee>
  </section>
);

export default LogoMarquee;
