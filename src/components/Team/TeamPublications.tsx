"use client";

import { useState, useMemo } from "react";
import PublicationComp from "@/components/PublicationComp";
import Line from "@/components/ui/Line";
import CustomSelect from "@/components/CustomSelect";
import { useTranslations } from "next-intl";

interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  date: string;
  volume?: string;
  year?: number;
}

interface TeamPublicationsProps {
  publications: Publication[];
}

export default function TeamPublications({
  publications,
}: TeamPublicationsProps) {
  const t = useTranslations();
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Extraire les années uniques des publications
  const availableYears = useMemo(() => {
    const years = publications
      .map((pub) => pub.year)
      .filter((year): year is number => year !== undefined && year !== null);

    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);

    return [
      {
        value: "",
        label: t("PublicationsPage.filters.allYears") || "Toutes les années",
      },
      ...uniqueYears.map((year) => ({
        value: year.toString(),
        label: year.toString(),
      })),
    ];
  }, [publications, t]);

  // Filtrer les publications par année
  const filteredPublications = useMemo(() => {
    if (!selectedYear) return publications;
    return publications.filter((pub) => pub.year?.toString() === selectedYear);
  }, [publications, selectedYear]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:mt-7">
      <div className="flex lg:gap-4 lg:items-center w-full flex-col lg:flex-row items-start lg:pl-5">
        <div className="flex items-center gap-5 lg:px-0 mt-6">
          <h2
            className={`font-poppins text-black lg:px-0 text-[24px] md:text-[26px] font-bold md:text-nowrap`}
          >
            {t("PublicationsPage.title")}
          </h2>
          {availableYears.length > 1 && (
            <CustomSelect
              value={selectedYear}
              onChange={setSelectedYear}
              options={availableYears}
            />
          )}
        </div>
        <Line lineColor={"#3253BA"} />
      </div>
      <div className="lg:mt-8 relative -translate-y-8 md:translate-0 grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-9 realative">
        {filteredPublications.length > 0 ? (
          filteredPublications
            .slice(0, 6)
            .map((publication) => (
              <PublicationComp
                key={publication.id}
                publicationData={publication}
              />
            ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-xl text-gray-500">
              {t("PublicationsPage.noResults") || "Aucune publication trouvée"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
