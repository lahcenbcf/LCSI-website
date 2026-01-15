"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import PublicationComp from "@/components/PublicationComp";
import { PublicationCardSkeleton } from "../ui/SkeletonLoaders";

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
  volume?: string;
  url?: string;
}

export default function PublicationsSection() {
  const t = useTranslations("HomePage");
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/publications?limit=6");
        if (response.ok) {
          const data = await response.json();
          setPublications(data.publications || []);
        }
      } catch (error) {
        console.error("Error fetching publications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  return (
    <div className="lg:mt-8 2xl:container mx-auto mt-5 relative">
      <div className="px-4">
        <SectionTitle
          title={t("publicationsSection.title")}
          lineColor="#e8e9e9"
        />
        <div className="lg:mt-8 relative -translate-y-8 md:translate-0 grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-9 realative">
          {loading
            ? [...Array(2)].map((_, index) => (
                <PublicationCardSkeleton key={index} />
              ))
            : publications.map((publication, index) => (
                <div
                  key={publication.id}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <PublicationComp
                    publicationData={{
                      id: publication.id,
                      title:
                        locale === "en"
                          ? publication.title_en || publication.title_fr || ""
                          : publication.title_fr || publication.title_en || "",
                      authors: publication.authors.map(
                        (author) => `${author.firstname} ${author.lastname}`
                      ),
                      journal: publication.journal,
                      date: new Date(
                        publication.publishedAt
                      ).toLocaleDateString(
                        locale === "en" ? "en-US" : "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                        }
                      ),
                      volume: publication.volume,
                      url : publication.url || "",
                    }}
                  />
                </div>
              ))}
          <div className=" absolute z-[-1] blur-[80px]  top-[80px] left-0 w-[250px] h-[250px] blue__gradient"></div>
          <div className=" absolute z-[-1] blur-[80px]  top-[190px] right-0 w-[250px] h-[250px] blue__gradient"></div>
        </div>
        <div className="flex justify-center md:mt-8 ">
          <Link
            href="/publications"
            className="px-6 py-3 bg-mainBlue text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
          >
            {t("publicationsSection.buttonText")}
          </Link>
        </div>
      </div>
    </div>
  );
}
