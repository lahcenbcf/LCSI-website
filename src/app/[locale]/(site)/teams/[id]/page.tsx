"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { DDD, BDA, PI, MA } from "@/assets";
import {
  TeamExpertises,
  TeamDomains,
  TeamValueAdded,
  TeamHeader,
  TeamMembers,
  TeamPublications,
  TeamContact,
} from "@/components/Team";

interface Team {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  valueAdded_fr?: string;
  valueAdded_en?: string;
  image?: string;
  keywords?: string[];
  domains?: string[];
  expertises?: string[];
  memberCount: number;
  projectCount: number;
}

interface Member {
  email: Member | undefined;
  id: string;
  firstname: string;
  lastname: string;
  position: string;
  gender: "MALE" | "FEMALE";
  image?: string;
  isTeamLeader?: boolean;
}

interface Publication {
  id: string;
  title_fr?: string;
  title_en?: string;
  authors: Array<{
    firstname: string;
    lastname: string;
  }>;
  journal: string;
  year: number;
  publishedAt: string;
  url?: string | null;
}

export default function TeamDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const teamId = params.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);

        // Fetch team details
        const teamResponse = await fetch(`/api/teams/${teamId}`);
        if (!teamResponse.ok) {
          notFound();
        }
        const teamData = await teamResponse.json();
        setTeam(teamData);

        // Fetch team members
        const membersResponse = await fetch(`/api/teams/${teamId}/members`);
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData.members || []);
        }

        // Fetch team publications
        const publicationsResponse = await fetch(
          `/api/teams/${teamId}/publications`
        );
        if (publicationsResponse.ok) {
          const publicationsData = await publicationsResponse.json();
          setPublications(publicationsData.publications || []);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue"></div>
      </div>
    );
  }

  if (!team) {
    notFound();
  }

  // Prepare data for components
  const teamForDisplay = {
    id:team.id,
    name: locale === "en" ? team.name_en : team.name_fr,
    description: locale === "en" ? team.description_en : team.description_fr,
    members: team.memberCount,
    projects: team.projectCount,
    buttonText: "",
    image: team.image || "",
  };

  // Parse keywords, domains, expertises from arrays
  const keywords = team.keywords?.join(", ") || "";
  const domains = team.domains || [];
  const expertises = team.expertises || [];

  // Parse value added (assuming it's stored as a comma-separated string or array)
  const valueAddedText =
    locale === "en" ? team.valueAdded_en : team.valueAdded_fr;
  const valueAdded = valueAddedText
    ? valueAddedText.split("\n").filter((v: string) => v.trim())
    : [];

  // Format expertises data (if stored as array of strings, convert to objects)
  const expertisesFormatted = expertises.map((exp: any) => {
    if (typeof exp === "string") {
      return { title: exp, description: "" };
    }
    return exp;
  });

  // Format members data
  const membersFormatted = members.map((member) => ({
    id: member.id,
    name: `${member.firstname} ${member.lastname}`,
    position: member.position,
    gender: member.gender,
    image: member.image,
  }));

  const teamLeader = members.find(m => m.isTeamLeader);

  // Format publications data
  const publicationsFormatted = publications.map((pub) => ({
    id: pub.id,
    title:
      (locale === "en"
        ? pub.title_en || pub.title_fr
        : pub.title_fr || pub.title_en) || "Sans titre",
    authors: pub.authors.map((a) => `${a.firstname} ${a.lastname}`),
    journal: pub.journal,
    date: new Date(pub.publishedAt).toLocaleDateString(
      locale === "en" ? "en-US" : "fr-FR",
      { year: "numeric", month: "long" }
    ),
    year: pub.year, // Ajouter l'année pour le filtre
    url: pub.url,
  }));

  console.log("publicationsFormatted", publicationsFormatted);

  return (
    <>
      <div className=" bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex lg:flex-row flex-col-reverse gap-8 lg:gap-12">
            <div className="space-y-8 lg:mt-2">
              <TeamExpertises expertises={expertisesFormatted} />
              <TeamDomains domains={domains} />
              <TeamValueAdded valueAdded={valueAdded} />
            </div>
            <TeamHeader
              team={teamForDisplay}
              imageMap={teamForDisplay.image}
              keywords={keywords}
            />
          </div>
        </div>
      </div>
      <TeamMembers members={membersFormatted} />
      <TeamPublications publications={publicationsFormatted} />
      <TeamContact
        fullName={teamLeader ? `${teamLeader.firstname} ${teamLeader.lastname}` : ""}
        email={teamLeader && typeof teamLeader.email === "string" ? teamLeader.email : ""}
      />
    </>
  );
}
