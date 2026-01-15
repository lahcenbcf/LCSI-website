// Utility functions for API calls

const API_BASE_URL = "/api";

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Erreur ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (parseError) {
      // Si on ne peut pas parser le JSON, utiliser le message par défaut
      console.warn("Impossible de parser la réponse d'erreur:", parseError);
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (parseError) {
    console.error("Erreur lors du parsing de la réponse:", parseError);
    throw new Error("Réponse serveur invalide");
  }
}

// Members API
export const membersAPI = {
  // Get all members
  getAll: (params?: {
    search?: string;
    teams?: string[];
    language?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.teams?.length)
      searchParams.set("teams", params.teams.join(","));
    if (params?.language) searchParams.set("language", params.language);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return apiCall(`/members${query ? `?${query}` : ""}`);
  },

  // Get single member
  getById: (id: string, language = "FR") => {
    return apiCall(`/members/${id}?language=${language}`);
  },

  // Create new member
  create: (data: {
    firstname: string;
    lastname: string;
    email: string;
    position: string;
    teamSlug?: string;
    gender: string;
    phone?: string;
    image?: string;
    isTeamLeader?: boolean;
    translations: {
      FR: {
        bio: string;
        institution: string;
      };
      EN: {
        bio: string;
        institution: string;
      };
    };
  }) => {
    return apiCall("/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update member
  update: (
    id: string,
    data: {
      name?: string;
      email?: string;
      position?: string;
      teamSlug?: string;
      gender?: string;
      phone?: string;
      bio?: string;
      department?: string;
      isTeamLeader?: boolean;
      language?: string;
    }
  ) => {
    return apiCall(`/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete member
  delete: (id: string) => {
    return apiCall(`/members/${id}`, {
      method: "DELETE",
    });
  },
};

// Publications API
export const publicationsAPI = {
  // Get all publications
  getAll: (params?: {
    search?: string;
    teams?: string[];
    language?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.teams?.length)
      searchParams.set("teams", params.teams.join(","));
    if (params?.language) searchParams.set("language", params.language);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return apiCall(`/publications${query ? `?${query}` : ""}`);
  },

  // Get single publication
  getById: (id: string, language = "FR") => {
    return apiCall(`/publications/${id}?language=${language}`);
  },

  // Create new publication
  create: (data: {
    title: string;
    abstract?: string;
    journal: string;
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    url?: string;
    year: number;
    publishedAt?: string;
    teamSlug?: string;
    authors?: Array<{ memberId: string; order: number }>;
    language?: string;
  }) => {
    return apiCall("/publications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update publication
  update: (
    id: string,
    data: {
      title?: string;
      abstract?: string;
      journal?: string;
      volume?: string;
      issue?: string;
      pages?: string;
      doi?: string;
      url?: string;
      year?: number;
      publishedAt?: string;
      teamSlug?: string;
      authors?: Array<{ memberId: string; order: number }>;
      language?: string;
    }
  ) => {
    return apiCall(`/publications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete publication
  delete: (id: string) => {
    return apiCall(`/publications/${id}`, {
      method: "DELETE",
    });
  },
};

// Teams API
export const teamsAPI = {
  // Get all teams
  getAll: (language = "FR") => {
    return apiCall(`/teams?language=${language}`);
  },

  // Get team by ID
  getById: (id: string, language = "FR") => {
    return apiCall(`/teams/${id}?language=${language}`);
  },

  // Get team by slug
  getBySlug: (slug: string, language = "FR") => {
    return apiCall(`/teams/slug/${slug}?language=${language}`);
  },

  // Create new team
  create: (data: {
    slug: string;
    image?: string;
    translations: {
      FR: {
        name: string;
        description?: string;
        valueAdded?: string;
        keywords?: string[];
        domains?: string[];
        expertises?: string[];
      };
      EN: {
        name: string;
        description?: string;
        valueAdded?: string;
        keywords?: string[];
        domains?: string[];
        expertises?: string[];
      };
    };
  }) => {
    return apiCall("/teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update team
  update: (
    id: string,
    data: {
      slug?: string;
      image?: string;
      translations: {
        FR: {
          name: string;
          description?: string;
          valueAdded?: string;
          keywords?: string[];
          domains?: string[];
          expertises?: string[];
        };
        EN: {
          name: string;
          description?: string;
          valueAdded?: string;
          keywords?: string[];
          domains?: string[];
          expertises?: string[];
        };
      };
    }
  ) => {
    return apiCall(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete team
  delete: (id: string) => {
    return apiCall(`/teams/${id}`, {
      method: "DELETE",
    });
  },
};

// Error types
export interface APIError {
  error: string;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Response types
export interface MembersResponse {
  members: Member[];
  pagination: PaginationInfo;
}

export interface PublicationsResponse {
  publications: Publication[];
  pagination: PaginationInfo;
}

export interface TeamsResponse {
  teams: Team[];
  total: number;
}

// Data types
export interface Member {
  id: string;
  email: string;
  phone?: string;
  image?: string;
  gender: string;
  position: string;
  isTeamLeader: boolean;
  createdAt: string;
  name: string;
  bio?: string;
  department?: string;
  team?: string;
  teamName?: string;
  publications?: Publication[];
}

export interface Publication {
  title_fr: any;
  title_en: any;
  id: string;
  title: string;
  abstract?: string;
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  year: number;
  publishedAt: string;
  createdAt: string;
  team?: string;
  teamName?: string;
  authors: Array<{
    lastname: any;
    firstname: any;
    id: string;
    name: string;
    email?: string;
    order: number;
  }>;
}

export interface Team {
  id: string;
  slug: string;
  image?: string;
  name_fr: string;
  name_en: string;
  description_fr?: string;
  description_en?: string;
  valueAdded_fr?: string;
  valueAdded_en?: string;
  keywords: string[];
  domains: string[];
  technologies: string[];
  expertises: string[];
  createdAt: string;
  memberCount: number;
  projectCount: number;
  // Helper properties (computed based on language)
  name?: string;
  description?: string;
  valueAdded?: string;
  membersCount?: number;
  publicationsCount?: number;
}
