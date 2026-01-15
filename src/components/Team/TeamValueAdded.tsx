import SectionTitle from "@/components/SectionTitle";
import { useTranslations } from "next-intl";

interface TeamValueAddedProps {
  valueAdded: string[];
}

export default function TeamValueAdded({ valueAdded }: TeamValueAddedProps) {
  const t = useTranslations();

  return (
    <div className="mb-0">
      <div className="flex items-center">
        <SectionTitle
          title={t("TeamDetail.valueAdded", {
            defaultValue: "Notre valeur ajoutée",
          })}
          lineColor="#3253BA"
          font="poppins"
          extraClass="text-[24px] md:text-[26px] font-bold md:text-nowrap mt-6"
        />
      </div>
      <ul className="lg:-translate-y-1 -translate-y-10">
        {valueAdded.map((value, index) => (
          <li key={index} className="flex items-start">
            <span className="text-black mr-3 mt-1 text-lg">•</span>
            <span className="text-black text-sm md:text-base">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
