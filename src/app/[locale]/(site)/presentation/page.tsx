import { useTranslations } from "next-intl";
import PresentationSection from "@/components/PresentationSection";
import { esi, local, thematique, equipe } from "@/assets";
export default function PresentationPage() {
  const t = useTranslations("PresentationPage");

  return (
    <div >
      {/* Le LCSI Section */}
      <PresentationSection
        title={t("lcsi.title")}
        description={t("lcsi.description")}
        image={esi}
        imageAlt="esi image"
        className="bg-gray-50"
      />

      {/* Notre Équipe Section */}
      <PresentationSection
        title={t("equipe.title")}
        description={t("equipe.description")}
        image={equipe}
        imageAlt="LCSI Team"
        reverse={true}
        className="bg-white"
      />

      {/* Nos Thématiques Section */}
      <PresentationSection
        title={t("thematiques.title")}
        description={t("thematiques.description")}
        image={thematique}
        imageAlt="LCSI Research Themes"
        className="bg-gray-50"
      />
      {/* Notre local Section */}
      <PresentationSection
        title={t("local.title")}
        description={t("local.description")}
        image={local}
        imageAlt="LCSI local"
        reverse={true}
        className="bg-white"
      />
    </div>
  );
}
