"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import SectionTitle from "@/components/SectionTitle";
import NewsCard from "@/components/NewsCard";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getContentTypeColor } from "@/lib/contentColors";

interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
  categoryColor: string;
}

export default function ActualiteSection() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/contents?locale=${locale}&page=1&limit=6`
        );

        if (response.ok) {
          const data = await response.json();
          const formattedNews = data.contents.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            description: item.description,
            date: formatDate(item.publishedAt || item.eventDate || ""),
            category: item.categoryLabel || item.type,
            image: item.image || "/placeholder.jpg",
            categoryColor: getContentTypeColor(item.type),
          }));
          setNews(formattedNews);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [locale]);

  if (loading) {
    return (
      <div className="lg:mt-16 2xl:container mx-auto relative mt-10">
        <div className="w-full lg:px-4 relative z-10">
          <SectionTitle
            title={t("actualiteSection.title")}
            lineColor="#e8e9e9"
          />
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-mainBlue" />
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return null; // Ne rien afficher s'il n'y a pas d'actualités
  }

  return (
    <div className="lg:mt-16 2xl:container mx-auto relative mt-10">
      <div className="w-full lg:px-4 relative z-10">
        <SectionTitle title={t("actualiteSection.title")} lineColor="#e8e9e9" />
      </div>

      <div className="lg:mt-8 px-4 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <NewsCard
              key={article.id}
              article={article}
              isLarge={index === 0}
              className={
                index === 0 ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""
              }
            />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href="/news"
            className="px-6 py-3 bg-mainBlue text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
          >
            {t("actualiteSection.viewAll")}
          </Link>
        </div>
      </div>
    </div>
  );
}
