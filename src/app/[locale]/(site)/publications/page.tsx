"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import PublicationComp from "@/components/PublicationComp";
import CustomSelect from "@/components/CustomSelect";
import { PublicationCardSkeleton } from "@/components/ui/SkeletonLoaders";

interface Publication {
  id: string;
  title_fr: string;
  title_en: string;
  abstract_fr?: string;
  abstract_en?: string;
  authors: Array<{
    id: string;
    firstname: string;
    lastname: string;
    order: number;
  }>;
  journal: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publishedAt: string;
  team?: {
    slug: string;
    name_fr: string;
    name_en: string;
  };
}

interface Team {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
}

export default function PublicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations("PublicationsPage");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [allYears, setAllYears] = useState<number[]>([]); // Toutes les années disponibles
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<string>("fr");
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const LIMIT = 10;

  useEffect(() => {
    // Résoudre la promesse params
    params.then((resolvedParams) => {
      setLocale(resolvedParams.locale);
    });

    // Charger les équipes
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        const data = await response.json();
        setTeams(data.teams || []);
      } catch (error) {
        console.error("Erreur lors du chargement des équipes:", error);
      }
    };

    // Charger toutes les années disponibles (optimisé)
    const fetchAllYears = async () => {
      try {
        const response = await fetch("/api/publications/years");
        const data = await response.json();
        setAllYears(data.years || []);
      } catch (error) {
        console.error("Erreur lors du chargement des années:", error);
      }
    };

    fetchTeams();
    fetchAllYears();
  }, [params]);

  useEffect(() => {
    // Charger les publications avec filtres
    const fetchPublications = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("limit", LIMIT.toString());
        queryParams.set("offset", currentOffset.toString());

        if (selectedTeam) queryParams.set("team", selectedTeam);
        if (selectedYear) queryParams.set("year", selectedYear);

        const response = await fetch(
          `/api/publications?${queryParams.toString()}`
        );
        const data = await response.json();

        if (currentOffset === 0) {
          setPublications(data.publications || []);
        } else {
          setPublications((prev) => [...prev, ...(data.publications || [])]);
        }

        setHasMore(data.pagination?.hasMore || false);

        // Extraire les années uniques des publications
        if (data.publications?.length > 0) {
          const uniqueYears = [
            ...new Set(data.publications.map((p: Publication) => p.year)),
          ].sort((a: any, b: any) => b - a);
          setYears(uniqueYears as number[]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des publications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [selectedTeam, selectedYear, currentOffset]);

  // Reset offset when filters change
  useEffect(() => {
    setCurrentOffset(0);
  }, [selectedTeam, selectedYear]);

  // Translated label helper
  const getTranslatedLabel = (label: string) => {
    if (label === "allTeams" || label === "allYears") {
      return t(`filters.${label}`);
    }
    if (label.startsWith("teams.")) {
      return t(`filters.${label}`);
    }
    return label;
  };

  // Team options
  const teamOptions = [
    { value: "", label: getTranslatedLabel("allTeams") },
    ...teams.map((team) => ({
      value: team.slug,
      label: locale === "fr" ? team.name_fr : team.name_en,
    })),
  ];

  // Year options
  const yearOptions = [
    { value: "", label: getTranslatedLabel("allYears") },
    ...allYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
  ];

  // Transform publication data for PublicationComp
  const transformedPublications = publications.map((pub, index) => ({
    id: (index + 1 + currentOffset).toString(), // Convert id to string
    title: locale === "fr" ? pub.title_fr : pub.title_en,
    authors: pub.authors.map((a) => `${a.firstname} ${a.lastname}`),
    journal: pub.journal,
    date: new Date(pub.publishedAt).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    volume: pub.volume || "",
    year: pub.year,
    team: pub.team?.slug || "",
    url: pub.url || "",
  }));

  const handleLoadMore = () => {
    setCurrentOffset((prev) => prev + LIMIT);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black font-integralCF">
              {t("title").toUpperCase()}
            </h1>

            <div className="flex flex-col-reverse sm:flex-row gap-4">
              <CustomSelect
                value={selectedTeam}
                onChange={setSelectedTeam}
                options={teamOptions}
              />
              <CustomSelect
                value={selectedYear}
                onChange={setSelectedYear}
                options={yearOptions}
              />
            </div>
          </div>

          {loading && currentOffset === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(10)].map((_, index) => (
                <PublicationCardSkeleton key={index} />
              ))}
            </div>
          ) : transformedPublications.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {transformedPublications.map((publication, index) => (
                  <div
                    key={publication.id}
                    className="animate-fadeIn"
                    style={{
                      animationDelay: `${(index % 10) * 50}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <PublicationComp publicationData={publication} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white bg-mainBlue rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Chargement...
                      </>
                    ) : (
                      t("showMore")
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">{t("noResults")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
