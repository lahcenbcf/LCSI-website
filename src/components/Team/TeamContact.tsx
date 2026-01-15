import SectionTitle from "@/components/SectionTitle";
import { User, Home } from "lucide-react";
import { useTranslations } from "next-intl";

interface TeamLeader {
  fullName: string;
  email : string;
}

export default function TeamContact(tl: TeamLeader) {
  const t = useTranslations('TeamContact');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:mt-7">
      <SectionTitle
        title={t("title")}
        lineColor="#3253BA"
        font="poppins"
        extraClass="text-[24px] md:text-[26px] font-bold md:text-nowrap mt-6"
      />
        <div className=" md:ml-16 md:mt-5 flex flex-col md:flex-row justify-start gap-8 itmes-center">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#3253BA] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-black mb-1">
                  {t("teamLeader")}
                </h3>
                <p className="text-gray-700 text-base">
                  {tl.fullName}
                </p>
                <p className="text-gray-600 text-sm">{tl.email}</p>
              </div>
            </div>



            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#3253BA] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-black mb-1">
                  {t("teamEmail")}
                </h3>
                <p className="text-gray-700 text-base">lcsi@esi.dz</p>
                <p className="text-gray-600 text-sm">
                  {t("info")}
                </p>
              </div>
            </div>


      </div>
    </div>
  );
}
