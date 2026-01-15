"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SectionTitle from "../SectionTitle";
import MemberComp from "../MemberComp";
import Link from "next/link";
import { MemberCardSkeleton } from "../ui/SkeletonLoaders";

interface Member {
  id: string;
  firstname: string;
  lastname: string;
  position: string;
  department: string;
  gender: "MALE" | "FEMALE";
  image?: string;
  teams?: Array<{ slug: string; name_fr: string; name_en: string }>;
  isTeamLeader?: boolean;

}

export default function MembersSection() {
  const t = useTranslations("HomePage");
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/members?limit=8");
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
  }, []);

  return (
    <div className="lg:mt-8 2xl:container mx-auto mt-5 relative z-10 overflow-hidden">
      <div className="px-4">
        <SectionTitle
          title={t("MembersSection.sectionTitle")}
          lineColor="#e8e9e9"
        />
      </div>
      <div className="gg -translate-y-8 md:translate-0 flex overflow-x-scroll gap-5 w-screen md:w-auto lg:mt-8 md:grid md:grid-cols-2 lg:grid-cols-4 justify-between md:items-center md:px-4 lg:px-9 md:mx-auto md:max-w-[1280px] md:gap-12">
        {loading
          ? [...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`flex-shrink-0 self-start ${
                  index === 0 ? "ml-[40px] md:ml-0" : ""
                } ${index === 3 ? "mr-[40px] md:mr-0" : ""}`}
              >
                <MemberCardSkeleton />
              </div>
            ))
          : members.map((member, index) => (
              <div
                key={member.id}
                className={`flex-shrink-0 self-start animate-fadeIn ${
                  index === 0 ? "ml-[40px] md:ml-0" : ""
                } ${index === members.length - 1 ? "mr-[40px] md:mr-0" : ""}`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <Link href={`/members/${member.id}`}>
                  <MemberComp
                    member={{
                      id: member.id,
                      name: `${member.firstname} ${member.lastname}`,
                      position: member.position,
                      gender: member.gender,
                      image: member.image,
                      isTeamLeader: member.isTeamLeader,
                      teamName: member.teams?.[0]
                        ? locale === "fr"
                          ? member.teams[0].name_fr
                          : member.teams[0].name_en
                        : undefined,
                    }}
                    locale={locale}
                  />
                </Link>
              </div>
            ))}
      </div>
      <div className="flex justify-center md:mt-8">
        <Link
          href="/members"
          className="px-6 py-3 bg-mainBlue text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
        >
          {t("MembersSection.buttonText")}
        </Link>
      </div>
    </div>
  );
}
