"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Loader2 } from "lucide-react";
import Image from "next/image";
import { getContentTypeColor } from "@/lib/contentColors";
import { useTranslations } from "next-intl";

interface NewsDetail {
  id: string;
  slug: string;
  type: string;
  image?: string;
  publishedAt?: string;
  eventDate?: string;
  createdAt: string;
  updatedAt: string;
  translations: Array<{
    language: "FR" | "EN";
    title: string;
    description: string;
    categoryLabel?: string;
    categoryColor?: string;
  }>;
}

export default function NewsDetailPage() {
  const params = useParams();
  const t = useTranslations("NewsPage");
  const locale = useLocale();
  const newsSlug = params.id as string; // Le paramètre s'appelle 'id' mais contient le slug

  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        // D'abord, récupérer toutes les actualités pour trouver celle avec le bon slug
        const response = await fetch(`/api/contents?locale=${locale}`);

        if (response.ok) {
          const data = await response.json();
          const foundNews = data.contents.find(
            (item: any) => item.slug === newsSlug
          );

          if (foundNews) {
            // Récupérer les détails complets
            const detailResponse = await fetch(`/api/contents/${foundNews.id}`);
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              setNews(detailData.content);
            } else {
              setError(true);
            }
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (newsSlug) {
      fetchNews();
    }
  }, [newsSlug, locale]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mainBlue" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-darkgrayTxt mb-4">
          {t("noResults")}
        </h1>
        <Link
          href="/news"
          className="flex items-center gap-2 text-mainBlue hover:underline"
        >
          <ArrowLeft size={20} />
          {t("backToNews")}
        </Link>
      </div>
    );
  }

  const translation =
    news.translations.find((t) => t.language === locale.toUpperCase()) ||
    news.translations[0];

  const categoryColor = getContentTypeColor(news.type);

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-mainBlue hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          {t("backToNews")}
        </Link>
      </div>

      {/* Article Container */}
      <article className="max-w-4xl mx-auto px-4 pb-12">
        {/* Featured Image */}
        {news.image && (
          <div className="relative w-full h-96 rounded-xl overflow-hidden mb-8">
            <Image
              src={news.image}
              alt={translation.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span
              className="inline-block px-3 py-1 text-sm font-medium text-white rounded-full"
              style={{ backgroundColor: categoryColor }}
            >
              {translation.categoryLabel || news.type}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-darkgrayTxt mb-4 leading-tight">
            {translation.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-lightgrayTxt mb-6 border-b border-grayBorder pb-6">
            {news.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {t("publishedAtLabel")} {formatDate(news.publishedAt)}
                </span>
              </div>
            )}
            {news.eventDate && (
              <div className="flex items-center gap-2">
                <Tag size={16} />
                <span>
                  {t("eventDateLabel")} {formatDate(news.eventDate)}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Article Content */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {translation.description}
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="flex items-center justify-between border-t border-grayBorder pt-6">
          <div className="text-sm text-lightgrayTxt">
            {t("updatedAtLabel")} {formatDate(news.updatedAt)}
          </div>
        </div>
      </article>
    </div>
  );
}
