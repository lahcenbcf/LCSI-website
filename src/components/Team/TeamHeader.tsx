import Image from "next/image";
import { useTranslations } from "next-intl";
import { DDD } from "@/assets";
interface TeamHeaderProps {
  team: {
    name: string;
    image: string;
  };
  imageMap: string;
  keywords: string;
}

export default function TeamHeader({
  team,
  imageMap,
  keywords,
}: TeamHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-3 h-fit  lg:max-w-[450px]">
      <div className="relative w-fit">
        <h1 className="text-[18px] md:text-xl lg:text-[24px] font-poppins font-bold text-black text-left lg:text-right">
          {team.name}
        </h1>
        <span className="w-[110px] h-[5px] bg-mainBlue left-0 -bottom-1 absolute"></span>
      </div>
      <div className="w-full ">
        <Image
          src={imageMap || DDD}
          alt={team.name}
          width={400}
          height={100}
          className="w-full h-auto border-1 border-grayBorder"
          priority
        />
      </div>
      <div className="mt-2">
        <p className="">
          <span className="font-bold text-gray-900 mr-2 mb-2 sm:mb-0 whitespace-nowrap">
            {t("TeamDetail.keywords", { defaultValue: "Mots-clés" })}:
          </span>
          {keywords}
        </p>
      </div>
    </div>
  );
}
