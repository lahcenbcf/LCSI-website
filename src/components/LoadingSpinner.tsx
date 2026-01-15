import { Loader2 } from "lucide-react";
export const LoadingSpinner = ({ text = "Chargement..." }: { text?: string }) => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-mainBlue" />
    <span className="ml-2 text-lightgrayTxt">{text}</span>
  </div>
);
