"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import MemberComp from "@/components/MemberComp";
import PublicationComp from "@/components/PublicationComp";
import { url } from "inspector";

interface Member {
  id: string;
  firstname: string;
  lastname: string;
  position: string;
  department: string;
  gender: "MALE" | "FEMALE";
  email?: string;
  phone?: string;
  image?: string;
  institution?: string;
  institution_fr?: string;
  institution_en?: string;
  teamName?: string;
  teamName_fr?: string;
  teamName_en?: string;
  bio?: string;
  bio_fr?: string;
  bio_en?: string;
}

interface Publication {
  id: string;
  title?: string;
  title_fr?: string;
  title_en?: string;
  abstract?: string;
  abstract_fr?: string;
  abstract_en?: string;
  journal: string;
  year: number;
  doi?: string;
  publishedAt?: string;
  volume?: string;
  authors: Array<{
    firstname: string;
    lastname: string;
  }>;
  url?: string | null;
}

export default function MemberDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const memberId = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);

        // Fetch member details (includes publications)
        const memberResponse = await fetch(`/api/members/${memberId}`);
        if (!memberResponse.ok) {
          notFound();
        }
        const memberData = await memberResponse.json();
        setMember(memberData);

        // Publications are already included in memberData
        setPublications(memberData.publications || []);
      } catch (error) {
        console.error("Error fetching member data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [memberId]); // Removed locale - no need to refetch when language changes


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue"></div>
      </div>
    );
  }

  if (!member) {
    notFound();
  }

  // Format member data for MemberComp
  const memberForDisplay = {
    id: member.id,
    name: `${member.firstname} ${member.lastname}`,
    position: member.position,
    institution:
      locale === "fr"
        ? member.institution_fr || member.institution
        : member.institution_en || member.institution,
    teamName:
      locale === "fr"
        ? member.teamName_fr || member.teamName
        : member.teamName_en || member.teamName,
    bio:
      locale === "fr"
        ? member.bio_fr || member.bio
        : member.bio_en || member.bio,
    gender: member.gender,
    email: member.email,
    phone: member.phone,
    image: member.image,
  };

  // Format publications data for PublicationComp
  const publicationsFormatted = publications.map((pub) => ({
    id: pub.id,
    title:
      (locale === "en"
        ? pub.title_en || pub.title_fr || pub.title
        : pub.title_fr || pub.title_en || pub.title) || "Sans titre",
    authors: pub.authors.map((a) => `${a.firstname} ${a.lastname}`),
    journal: pub.journal,
    date: pub.publishedAt
      ? new Date(pub.publishedAt).toLocaleDateString(
          locale === "en" ? "en-US" : "fr-FR",
          { year: "numeric", month: "long" }
        )
      : pub.year?.toString() || "",
    volume: pub.volume,
    url: pub.url ?? undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-shrink-0">
          <MemberComp
            member={memberForDisplay}
            isDetailView={true}
            locale={locale}
          />
        </div>

        <div className="flex-1">
          <div className="bg-blue-50 rounded-lg py-4 px-6">
            <h2 className="text-xl lg:text-2xl font-bold mb-3 text-mainBlue">
              PUBLICATIONS
            </h2>
            <div className="lg:h-[calc(100vh-250px)] min-h-[445px] lg:overflow-y-auto lg:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-mainBlue [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb:hover]:bg-blue-600">
              <div className="">
                {publicationsFormatted.length > 0 ? (
                  publicationsFormatted.map((publication) => (
                    <PublicationComp
                      key={publication.id}
                      publicationData={publication}
                      disableHover={true}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {locale === "fr"
                        ? "Aucune publication"
                        : "No publications"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
