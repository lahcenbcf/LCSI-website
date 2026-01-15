"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import TeamDetailCard from "@/components/TeamDetailCard";

interface Team {
  id: number;
  slug: string;
  image: string;
  name_fr: string;
  name_en: string;
  description_fr: string | null;
  description_en: string | null;
  memberCount: number;
  projectCount: number;
}

export default function TeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<string>("fr");
  const t = useTranslations("TeamsPage");

  useEffect(() => {
    // Résoudre la promesse params
    params.then((resolvedParams) => {
      setLocale(resolvedParams.locale);
    });

    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        const data = await response.json();
        setTeams(data.teams || []);
      } catch (error) {
        console.error("Erreur lors du chargement des équipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [params]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Teams Grid Section */}
      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 lg:gap-12">
            {teams.map((team, index) => {
              const teamData = {
                id: team.id,
                name: locale === "fr" ? team.name_fr : team.name_en,
                description:
                  locale === "fr"
                    ? team.description_fr || ""
                    : team.description_en || team.description_fr || "",
                members: team.memberCount,
                projects: team.projectCount,
                buttonText: t("buttonText"),
                image: team.image,
              };

              return (
                <div
                  key={team.id}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <TeamDetailCard teamData={teamData} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
