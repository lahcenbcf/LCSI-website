"use client";

import { man, woman } from "@/assets";
import Image from "next/image";
import { CardContainer } from "./ui/3d-card";
import { useTranslations } from "next-intl";
interface Member {
  id: string;
  name: string;
  position: string;
  gender: "MALE" | "FEMALE";
  email?: string;
  phone?: string;
  image?: string;
  institution?: string;
  teamName?: string; // Team name based on locale
  bio?: string; // Biography based on locale
  isTeamLeader?: boolean;
}

interface MemberCompProps {
  member: Member;
  isDetailView?: boolean;
  locale?: string; // Pour traduire la position
}

// améliorer la qualité des images Google
const getHighQualityGoogleImage = (imageUrl: string): string => {
  if (!imageUrl) return "";

  if (imageUrl.includes("googleusercontent.com")) {
    return imageUrl.replace(/=s\d+-c/, "=s500-c");
  }

  return imageUrl;
};

// Traduire les positions
const translatePosition = (position: string, locale: string = "fr"): string => {
  if (locale === "en") return position; // Retourner tel quel en anglais

  const translations: Record<string, string> = {
    PROFESSOR: "Professeur",
    ASSOCIATE_PROFESSOR: "Professeur Associé",
    ASSISTANT_PROFESSOR: "Professeur Assistant",
    LECTURER: "Maître de Conférences",
    RESEARCHER: "Chercheur",
    PHD_STUDENT: "Doctorant",
    MASTER_STUDENT: "Étudiant Master",
    ENGINEER: "Ingénieur",
  };

  return translations[position] || position;
};

export default function MemberComp({
  member,
  isDetailView = false,
  locale = "fr",
}: MemberCompProps) {
  const googleImage = member?.image
    ? getHighQualityGoogleImage(member.image)
    : null;

  const profileImage = googleImage || (member.gender === "MALE" ? man : woman);
  const t = useTranslations("MemberComp");

  console.log("MEM" , member)
  return (
    <CardContainer disableHover={isDetailView}>
      <div
        className={`${
          isDetailView
            ? "bg-white rounded-lg p-6 shadow-sm border border-gray-100 max-w-xs mx-auto lg:mx-0"
            : "flex shrink-0 items-start flex-col gap-2 justify-between md:max-w-[226px] max-w-[150px]"
        }`}
      >
        <div
          className={`relative w-full aspect-square ${
            isDetailView ? "mb-4" : ""
          }`}
        >
          <Image
            loading="lazy"
            src={profileImage}
            width={500}
            height={500}
            alt={`${member.name} Profile`}
            className={`w-full ${isDetailView ? "mb-4 rounded-lg" : ""}`}
          />
        </div>

        <h1
          className={`font-bold ${
            isDetailView
              ? "text-xl lg:text-2xl mb-2"
              : "md:text-[20px] text-[16px]"
          }`}
        >
          {member.name}
        </h1>
        <p
          className={`font-medium ${
            isDetailView
              ? "text-sm lg:text-base text-gray-600 mb-2"
              : "md:text-[14px] text-[12px] text-[#9F9F9F]"
          }`}
        >
          {translatePosition(member.position, locale)}
        </p>

        {isDetailView ? (
          <>
            {member.bio && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs lg:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {member.bio}
                </p>
              </div>
            )}
            {member.teamName && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-500">👥</span>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  {member.teamName}
                </p>
              </div>
            )}
            {member.institution && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-500">🏢</span>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  {member.institution}
                </p>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-500">✉️</span>
                <p className="text-xs lg:text-sm font-medium text-gray-600 break-all">
                  {member.email}
                </p>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📞</span>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  {member.phone}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="md:text-[14px] text-[12px] font-medium text-[#9F9F9F]">
            {member.isTeamLeader ? t("TeamLeader") : t("TeamMember")} {member.teamName || member.institution}
          </p>
        )}
      </div>
    </CardContainer>
  );
}
