// Hook personnalisé pour les membres
"use client";

import { useState, useEffect } from "react";
import {
  membersAPI,
  type Member,
  type MembersResponse,
  type APIError,
} from "@/lib/api";

export function useMembers(params?: {
  search?: string;
  teams?: string[];
  language?: string;
  limit?: number;
  offset?: number;
}) {
  const [data, setData] = useState<MembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await membersAPI.getAll(params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ FIXED: Only fetch if we have specific params, avoid fetching all members by default
    if (params) {
      fetchMembers();
    } else {
      // Reset state when no params provided
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [
    params?.search,
    params?.teams?.join(","),
    params?.language,
    params?.limit,
    params?.offset,
  ]);

  const createMember = async (
    memberData: Parameters<typeof membersAPI.create>[0]
  ) => {
    try {
      const newMember = await membersAPI.create(memberData);
      // Refetch data to get updated list
      await fetchMembers();
      return newMember;
    } catch (err) {
      throw err;
    }
  };

  const updateMember = async (
    id: string,
    memberData: Parameters<typeof membersAPI.update>[1]
  ) => {
    try {
      const updatedMember = await membersAPI.update(id, memberData);
      // Refetch data to get updated list
      await fetchMembers();
      return updatedMember;
    } catch (err) {
      throw err;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await membersAPI.delete(id);
      // Refetch data to get updated list
      await fetchMembers();
    } catch (err) {
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchMembers,
    createMember,
    updateMember,
    deleteMember,
  };
}

export function useMember(id: string, language = "FR") {
  const [data, setData] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await membersAPI.getById(id, language);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMember();
    }
  }, [id, language]);

  return { data, loading, error };
}
