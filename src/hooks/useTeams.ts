// Hook personnalisé pour les équipes
"use client";

import { useState, useEffect } from "react";
import { teamsAPI, type Team, type TeamsResponse } from "@/lib/api";

export function useTeams(language = "FR") {
  const [data, setData] = useState<TeamsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamsAPI.getAll(language);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [language]);

  const createTeam = async (
    teamData: Parameters<typeof teamsAPI.create>[0]
  ) => {
    try {
      const newTeam = await teamsAPI.create(teamData);
      // Refetch data to get updated list
      await fetchTeams();
      return newTeam;
    } catch (err) {
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchTeams,
    createTeam,
  };
}

// Hook pour récupérer une équipe spécifique par ID
export function useTeam(id: string, language = "FR") {
  const [data, setData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const team = await teamsAPI.getById(id, language);
      setData(team);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTeam();
    }
  }, [id, language]);

  return {
    data,
    loading,
    error,
    refetch: fetchTeam,
  };
}
