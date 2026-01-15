"use client";

import { DDD, BDA, PI, MA, users, file } from "@/assets";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface TeamDetailCardProps {
  teamData: {
    id: number;
    name: string;
    description: string;
    members: number;
    projects: number;
    buttonText: string;
    image: string;
  };
}

export default function TeamDetailCard({ teamData }: TeamDetailCardProps) {

  return (
    <div className="flex flex-col lg:flex-row bg-white overflow-hidden min-h-[300px]">
      <div className="w-full lg:w-1/2 relative">
        <div className="h-64 lg:h-full relative overflow-hidden">
          <Image
            src={teamData?.image || DDD} 
            width={500}
            height={500}
            alt={teamData.name}
            className="w-full h-full object-cover border-1 border-grayBorder"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-between">
        {/* Team Name */}
        <h3 className="text-2xl lg:text-3xl font-bold text-black mb-4 leading-tight">
          {teamData.name}
        </h3>

        {/* Description */}
        <p className="text-gray-700 text-sm lg:text-base mb-6 leading-relaxed flex-grow">
          {teamData.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Image src={users} alt="Members" className="w-4 h-4" />
            <span className="text-sm font-semibold text-mainBlue">
              {teamData.members} Membres
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Image src={file} alt="Publications" className="w-4 h-4" />
            <span className="text-sm font-semibold text-mainBlue">
              {teamData.projects} Publications
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/teams/${teamData.id}`}
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-mainBlue bg-white border border-mainBlue rounded-lg hover:bg-blue-50 transition-colors duration-200 w-fit"
        >
          {teamData.buttonText}
        </Link>
      </div>
    </div>
  );
}
