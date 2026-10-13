import { avatarTones } from "@/lib/data";

const shifts = ["", "-translate-x-[30%]", "-translate-x-[60%]", "-translate-x-[90%]"];

const AvatarStack = () => (
  <div className="flex w-32">
    {avatarTones.map((tone, i) => (
      <span key={tone} className={`aspect-square h-10 shrink-0 rounded-full border border-white ${tone} ${shifts[i]}`} />
    ))}
  </div>
);

export default AvatarStack;
