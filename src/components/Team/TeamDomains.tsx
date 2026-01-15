import SectionTitle from "@/components/SectionTitle";
import { useTranslations } from "next-intl";

interface TeamDomainsProps {
  domains: string[];
}

export default function TeamDomains({ domains }: TeamDomainsProps) {
  const t = useTranslations();

  return (
    <div className="mb-0">
      <div className="flex items-center">
        <SectionTitle
          title={t("TeamDetail.domainsApplication", {
            defaultValue: "Nos domaines d'application",
          })}
          lineColor="#3253BA"
          font="poppins"
          extraClass="text-[24px] md:text-[26px] font-bold md:text-nowrap mt-6"
        />
      </div>
      <ul className="lg:-translate-y-1 -translate-y-10">
        {domains.map((domain, index) => (
          <li key={index} className="flex items-center">
            <span className="text-black mr-3 mt-1 text-lg">•</span>
            <span className="text-black font-semibold text-sm md:text-base">
              {domain}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
