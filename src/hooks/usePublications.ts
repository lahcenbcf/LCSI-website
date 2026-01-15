// Hook personnalisé pour les publications
"use client";

import { useState, useEffect } from "react";
import {
  publicationsAPI,
  type Publication,
  type PublicationsResponse,
} from "@/lib/api";

export function usePublications(params?: {
  search?: string;
  teams?: string[];
  language?: string;
  limit?: number;
  offset?: number;
}) {
  const [data, setData] = useState<PublicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicationsAPI.getAll(params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [
    params?.search,
    params?.teams?.join(","),
    params?.language,
    params?.limit,
    params?.offset,
  ]);

  const createPublication = async (
    publicationData: Parameters<typeof publicationsAPI.create>[0]
  ) => {
    try {
      const newPublication = await publicationsAPI.create(publicationData);
      // Refetch data to get updated list
      await fetchPublications();
      return newPublication;
    } catch (err) {
      throw err;
    }
  };

  const updatePublication = async (
    id: string,
    publicationData: Parameters<typeof publicationsAPI.update>[1]
  ) => {
    try {
      const updatedPublication = await publicationsAPI.update(
        id,
        publicationData
      );
      // Refetch data to get updated list
      await fetchPublications();
      return updatedPublication;
    } catch (err) {
      throw err;
    }
  };

  const deletePublication = async (id: string) => {
    try {
      await publicationsAPI.delete(id);
      // Refetch data to get updated list
      await fetchPublications();
    } catch (err) {
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchPublications,
    createPublication,
    updatePublication,
    deletePublication,
  };
}

export function usePublication(id: string, language = "FR") {
  const [data, setData] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await publicationsAPI.getById(id, language);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublication();
    }
  }, [id, language]);

  return { data, loading, error };
}

// Hook pour récupérer les publications d'une équipe spécifique
export function useTeamPublications(teamId: string) {
  const [data, setData] = useState<PublicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/teams/${teamId}/publications`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des publications");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [teamId]);

  return {
    data,
    loading,
    error,
    refetch: fetchPublications,
  };
}
