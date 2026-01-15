// Couleurs fixes pour chaque type de contenu
export const CONTENT_TYPE_COLORS: Record<string, string> = {
  NEWS: "#3B82F6", // Bleu
  SEMINAR: "#8B5CF6", // Violet
  WORKSHOP: "#F59E0B", // Orange
  CONFERENCE: "#EF4444", // Rouge
  SYMPOSIUM: "#EC4899", // Rose
  FORUM: "#06B6D4", // Cyan
  CELEBRATION: "#F97316", // Orange foncé
};

export const getContentTypeColor = (type: string): string => {
  return CONTENT_TYPE_COLORS[type] || "#3B82F6"; // Bleu par défaut
};
