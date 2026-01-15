import SectionTitle from "@/components/SectionTitle";
import { useTranslations } from "next-intl";

interface Expertise {
  title: string;
  description: string;
}

interface TeamExpertisesProps {
  expertises: Expertise[];
}

export default function TeamExpertises({ expertises }: TeamExpertisesProps) {
  const t = useTranslations();

  return (
    <div className="mb-0">
      <div className="flex items-center ">
        <SectionTitle
          title={t("TeamDetail.expertises", {
            defaultValue: "Nos expertises",
          })}
          lineColor="#3253BA"
          font="poppins"
          extraClass="text-[24px] md:text-[26px] font-bold md:text-nowrap mt-6"
        />
        <div className="flex-1 h-px bg-mainBlue ml-4"></div>
      </div>
      <ul className="space-y-4 lg:-translate-y-1 -translate-y-10 ">
        {expertises.map((expertise, index) => (
          <li key={index} className="flex items-start">
            <span className="text-black mr-3 mt-1 text-lg">•</span>
            <div className="text-sm md:text-base">
              <span className="font-semibold text-gray-900">
                {expertise.title}:
              </span>
              <span className="text-black ml-1">{expertise.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
