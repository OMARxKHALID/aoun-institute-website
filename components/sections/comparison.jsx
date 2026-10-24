import { CircleCheck, CircleX, Layers } from "lucide-react";
import { comparison } from "@/lib/data";
import SectionHeading from "@/components/ui/section-heading";

const Comparison = ({ brand }) => (
  <section className="bg-black px-4 font-normal capitalize max-md:py-10 lg:py-16">
    <div className="mx-auto w-fit">
      <SectionHeading tag="Comparison" title={`What sets ${brand.name} apart`} />
      <div className="mx-auto flex flex-col justify-center gap-8 rounded-3xl border border-[#302C2A] p-3 md:gap-12 md:p-5 lg:flex-row">
        <div className="flex shrink-0 flex-col lg:max-w-[40vw]">
          <div className="mx-auto w-full rounded-3xl bg-[#69E82E73]/70 p-0.5 shadow-lg shadow-[#69E82E73]/70">
            <div className="mx-auto rounded-3xl bg-black p-5 md:px-10">
              <div className="flex h-24 items-center gap-5">
                <span className="grid size-12 place-items-center rounded-full bg-white font-machina text-2xl font-bold text-black">A</span>
                <p className="font-machina text-4xl font-light">{brand.name}</p>
              </div>
              {comparison.ours.map((item) => (
                <div key={item} className="flex items-center gap-3 py-5 md:items-start">
                  <CircleCheck className="size-7 shrink-0 text-green-400 md:mt-1" />
                  <p className="text-xl md:text-[1.6rem]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:max-w-[40vw]">
          <div className="mx-auto w-full rounded-3xl p-0.5 md:pr-20">
            <div className="mx-auto rounded-3xl pl-5 pt-5">
              <div className="flex h-24 items-center gap-5">
                <Layers className="size-12" />
                <p className="text-4xl font-light">Others</p>
              </div>
              {comparison.others.map((item) => (
                <div key={item} className="flex items-center gap-3 py-5 md:items-start">
                  <CircleX className="size-7 shrink-0 rounded-full bg-[#210b06] text-accent md:mt-1" />
                  <p className="text-xl md:text-[1.6rem]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Comparison;
