"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import NewsCard from "@/components/NewsCard";
import { Loader2 } from "lucide-react";
import { getContentTypeColor } from "@/lib/contentColors";

type ContentType =
  | "NEWS"
  | "SEMINAR"
  | "WORKSHOP"
  | "CONFERENCE"
  | "SYMPOSIUM"
  | "FORUM"
  | "CELEBRATION";

interface NewsArticle {
  id: string;
  slug: string;
  type: ContentType;
  image?: string;
  publishedAt?: string;
  eventDate?: string;
  title: string;
  description: string;
  categoryLabel?: string;
  categoryColor: string;
}

const ITEMS_PER_PAGE = 9;

export default function NewsPage() {
  const t = useTranslations("NewsPage");
  const locale = useLocale();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchNews = useCallback(
    async (pageNum: number) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await fetch(
          `/api/contents?locale=${locale}&page=${pageNum}&limit=${ITEMS_PER_PAGE}`
        );

        if (response.ok) {
          const data = await response.json();
          const formattedNews = data.contents.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            type: item.type,
            image: item.image,
            publishedAt: item.publishedAt,
            eventDate: item.eventDate,
            title: item.title,
            description: item.description,
            categoryLabel: item.categoryLabel,
            categoryColor: getContentTypeColor(item.type),
          }));

          if (pageNum === 1) {
            setNews(formattedNews);
          } else {
            setNews((prev) => [...prev, ...formattedNews]);
          }

          // Vérifier s'il y a plus de contenu
          setHasMore(formattedNews.length === ITEMS_PER_PAGE);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    fetchNews(1);
  }, [fetchNews]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchNews(page);
    }
  }, [page, fetchNews]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mainBlue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="lg:mt-16 2xl:container mx-auto relative mt-10">
        {/* Header */}
        <div className="px-4 lg:px-12 mb-8">
          <h1 className="text-3xl font-bold text-darkgrayTxt mb-4">
            {t("title")}
          </h1>
        </div>

        {/* Events Grid */}
        <div className="lg:mt-8 px-4 lg:px-12">
          {news.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lightgrayTxt">
                {t("noResults")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article, index) => (
                  <NewsCard
                    key={article.id}
                    article={{
                      id: article.id,
                      slug: article.slug,
                      title: article.title,
                      description: article.description,
                      date: formatDate(
                        article.publishedAt || article.eventDate || ""
                      ),
                      category: article.categoryLabel || article.type,
                      image: article.image || "",
                      categoryColor: article.categoryColor,
                    }}
                    isLarge={index === 0}
                    className={
                      index === 0
                        ? "md:col-span-2 lg:col-span-1 lg:row-span-2"
                        : ""
                    }
                  />
                ))}
              </div>

              {/* Observer target for infinite scroll */}
              <div ref={observerTarget} className="h-10 mt-6">
                {loadingMore && (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-mainBlue" />
                  </div>
                )}
              </div>

              {!hasMore && news.length > 0 && (
                <div className="text-center py-8 text-lightgrayTxt">
                  {t("bottomPage")}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
