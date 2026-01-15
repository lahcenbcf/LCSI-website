"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MemberComp from "@/components/MemberComp";
import CustomSelect from "@/components/CustomSelect";
import Link from "next/link";

interface Member {
  id: string;
  firstname: string;
  lastname: string;
  position: string;
  department: string;
  gender: "MALE" | "FEMALE";
  image?: string;
  teams?: Array<{ slug: string; name_fr: string; name_en: string }>;
}

interface Team {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
}

export default function MembersPage() {
  const t = useTranslations("MembersPage");
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  const [selectedTeam, setSelectedTeam] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les équipes
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        if (response.ok) {
          const data = await response.json();
          setTeams(data.teams || []);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  // Charger les membres avec filtre optionnel par équipe
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (selectedTeam) {
          queryParams.set("team", selectedTeam);
        }

        const response = await fetch(`/api/members?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedTeam]);

  const getTranslatedLabel = (label: string) => {
    try {
      if (label === "allTeams") {
        return t(`filters.${label}`);
      }
      if (label.startsWith("teams.")) {
        return t(`filters.${label}`);
      }
      return label;
    } catch (error) {
      console.error("Translation error for:", label, error);
      return label;
    }
  };

  const teamOptions = [
    { value: "", label: getTranslatedLabel("allTeams") },
    ...teams.map((team) => ({
      value: team.slug,
      label: locale === "fr" ? team.name_fr : team.name_en,
    })),
  ];

  // Grouper les membres par équipe pour l'affichage mobile
  const membersByTeam = teams.reduce((acc, team) => {
    acc[team.slug] = members.filter((member) =>
      member.teams?.some((t) => t.slug === team.slug)
    );
    return acc;
  }, {} as Record<string, Member[]>);

  // Formatter les membres pour le composant
  const formatMember = (member: Member) => ({
    id: member.id,
    name: `${member.firstname} ${member.lastname}`,
    position: member.position,
    department: member.department,
    gender: member.gender,
    image: member.image,
    teamName: member.teams?.[0]
      ? locale === "fr"
        ? member.teams[0].name_fr
        : member.teams[0].name_en
      : undefined,
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto lg:px-8">
          <div className="hidden lg:flex lg:items-center lg:justify-between gap-6 mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black font-integralCF">
              {t("title").toUpperCase()}
            </h1>
            <div className="flex">
              <CustomSelect
                value={selectedTeam}
                onChange={setSelectedTeam}
                options={teamOptions}
              />
            </div>
          </div>

          <div className="lg:hidden mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-black font-integralCF ml-5 lg:text-center">
              {t("title").toUpperCase()}
            </h1>
          </div>

          {/* Desktop: Grid view with filter */}
          <div className="hidden lg:block">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue"></div>
              </div>
            ) : members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {members.map((member) => (
                  <Link key={member.id} href={`/members/${member.id}`}>
                    <MemberComp member={formatMember(member)} locale={locale} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">{t("noResults")}</p>
              </div>
            )}
          </div>

          {/* Mobile: Horizontal scroll by team */}
          <div className="lg:hidden space-y-8">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue"></div>
              </div>
            ) : (
              teams.map((team) => {
                const teamMembers = membersByTeam[team.slug] || [];
                if (teamMembers.length === 0) return null;

                return (
                  <div key={team.slug} className="space-y-4">
                    <h2 className="text-xl font-bold text-mainBlue font-integralCF ml-5">
                      {locale === "fr" ? team.name_fr : team.name_en}
                    </h2>
                    <div className="overflow-x-auto pb-4 gg">
                      <div className="flex gap-4 min-w-max">
                        {teamMembers.map((member, index) => (
                          <Link
                            href={`/members/${member.id}`}
                            key={member.id}
                            className={`flex-shrink-0 ${
                              index === 0 ? "ml-10 lg:ml-0" : ""
                            } ${
                              index === teamMembers.length - 1
                                ? "mr-10 lg:mr-0"
                                : ""
                            }`}
                          >
                            <MemberComp
                              member={formatMember(member)}
                              locale={locale}
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
