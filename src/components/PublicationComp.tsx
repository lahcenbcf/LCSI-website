import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

interface PublicationData {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  date: string;
  volume?: string;
  url?: string;
}

interface PublicationCompProps {
  publicationData: PublicationData;
  disableHover?: boolean;
}

const PublicationComp: React.FC<PublicationCompProps> = ({
  publicationData,
  disableHover = false,
}) => {
  const { title, authors, journal, date, volume } = publicationData;

  return (
    <a
      href={publicationData.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
    >
      <CardContainer
        className="w-full cursor-pointer h-full"
        disableHover={disableHover}
      >
        <div
          className={`bg-white flex flex-col justify-between  w-full h-full p-6 mb-4 ${
            disableHover ? "" : "hover:shadow-md"
          } transition-shadow duration-300 border-grayBorder border-1`}
        >
          <h3 className="text-[18px] font-medium text-[#0E1C2A] mb-4 leading-tight">
            {title}
          </h3>

          <div className="text-sm text-gray-600 mb-2">
            <span className="text-lightgrayTxt text-[13px]">{journal}</span>
            {volume && (
              <span className="block text-xs text-gray-500 mt-1">{volume}</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mt-4 flex-wrap gap-2">
            <div className="mb-2 sm:mb-0">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {date}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-600">
                Auteur(s):{" "}
              </span>
              <span className="text-xs font-semibold text-mainBlue">
                {authors.join(", ")}
              </span>
            </div>
          </div>
        </div>
      </CardContainer>
    </a>
  );
};

export default PublicationComp;
