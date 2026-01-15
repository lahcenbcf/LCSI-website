import { DDD, BDA, PI, MA, users, file } from "@/assets";
import Image from "next/image";
import Link from "next/link";

export default function TeamComp({
  teamData,
}: {
  teamData: {
    id: string;
    name: string;
    description: string;
    members: number;
    projects: number;
    buttonText: string;
    image: string;
  };
}) {
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col rounded-[15px] bg-white shrink-0 h-[500px] select-none lg:cursor-grab xl:cursor-auto">
      <Image
        src={teamData?.image || DDD} 
        alt={teamData.name}
        width={321.27}
        height={194.87}
        className="w-[321.27px] h-[194.87px] rounded-t-[15px] object-cover select-none"
        onDragStart={handleDragStart}
        onMouseDown={handleMouseDown}
        draggable={false}
      />
      <div className="pl-6 flex flex-col justify-between gap-8 flex-1 py-8 max-w-[321.27px]">
        <div className="flex flex-col gap-5">
          <div className="flex gap-5 w-fit">
            <div className="flex gap-2 items-center">
              <Image
                src={users}
                alt="Users"
                width={20}
                height={20}
              />
              <span className="text-[14px] font-semibold text-darkgrayTxt">
                {teamData.members}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <Image
                src={file}
                alt="File"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span className="text-[14px] font-semibold text-darkgrayTxt">
                {teamData.projects}
              </span>
            </div>
          </div>
          <div className="w-fit flex flex-col gap-1.5 ">
            <h2 className="font-bold text-black text-[17px] ">
              {teamData.name}
            </h2>
            <p className="text-[14px] text-[#676767] font-medium">
              {teamData.description}
            </p>
          </div>
        </div>
        <Link
          href={`/teams/${teamData.id}`}
          className="inline-block text-[12px] px-2 py-1 text-mainBlue border-2 border-mainBlue rounded-md w-fit ml-3"
        >
          {teamData.buttonText}
        </Link>
      </div>
    </div>
  );
}
