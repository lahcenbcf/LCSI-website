"use client";

import { useRef } from "react";
import { useDraggable } from "react-use-draggable-scroll";
import TeamComp from "@/components/TeamComp";

interface Team {
  id: string;
  name_fr?: string;
  name_en?: string;
  description_fr?: string;
  description_en?: string;
  memberCount?: number;
  projectCount?: number;
  image?: string;
}

interface DraggableTeamsListProps {
  teams: Team[];
  locale: string;
  buttonText: string;
}

export default function DraggableTeamsList({
  teams,
  locale,
  buttonText,
}: DraggableTeamsListProps) {
  const ref = useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLDivElement>;
  const { events } = useDraggable(ref);

  return (
    <div
      {...events}
      ref={ref}
      className="max-w-[calc(100vw)] overflow-scroll gg -translate-y-8 md:translate-0"
    >
      <div className="lg:mt-4 relative z-10 flex gap-7">
        {teams.map((team, index) => (
          <div
            key={team.id}
            className={`w-fit animate-fadeIn ${
              index === 0 ? "ml-[30px] lg:ml-[90px]" : ""
            } shrink-0 ${index === teams.length - 1 ? "pr-[30px]" : ""}`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <TeamComp
              teamData={{
                id: team.id,
                name:
                  locale === "en"
                    ? team.name_en || team.name_fr || ""
                    : team.name_fr || team.name_en || "",
                description:
                  locale === "en"
                    ? team.description_en || team.description_fr || ""
                    : team.description_fr || team.description_en || "",
                members: team.memberCount || 0,
                projects: team.projectCount || 0,
                buttonText: buttonText,
                image: team.image || "",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
