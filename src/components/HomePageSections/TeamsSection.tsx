"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import dynamic from "next/dynamic";
import { TeamCardSkeleton } from "../ui/SkeletonLoaders";

// Importer le composant draggable uniquement côté client
const DraggableTeamsList = dynamic(() => import("../DraggableTeamsList"), {
  ssr: false,
});

interface Team {
  id: string;
  name_fr?: string;
  name_en?: string;
  description_fr?: string;
  description_en?: string;
  memberCount?: number;
  projectCount?: number;
  image?: string;
}

export default function TeamsSection() {
  const t = useTranslations("HomePage");
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/teams");
        if (response.ok) {
          const data = await response.json();
          setTeams(data.teams || []);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="lg:mt-8 2xl:container mx-auto relative mt-5">
        <div className="absolute z-0 w-full top-[125px] lg:bottom-[34px] h-[550px] blur-[70px] blue__gradient"></div>
        <div className="w-full lg:px-4 relative z-10">
          <SectionTitle title={t("teamsSection.title")} lineColor="#e8e9e9" />
        </div>
        <div className="lg:mt-4 relative z-10 flex gap-7 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={`${
                index === 0 ? "ml-[30px] lg:ml-[90px]" : ""
              } shrink-0 `}
            >
              <TeamCardSkeleton key={index} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className=" lg:mt-8 2xl:container mx-auto relative mt-5 min-h-[606px]">
      <div className=" absolute z-0 w-full top-[125px] lg:bottom-[34px] h-[550px] blur-[70px] blue__gradient"></div>
      <div className="w-full lg:px-4 relative z-10">
        <SectionTitle title={t("teamsSection.title")} lineColor="#e8e9e9" />
      </div>
      <DraggableTeamsList
        teams={teams}
        locale={locale}
        buttonText={t("teamsSection.buttonText")}
      />
    </div>
  );
}
