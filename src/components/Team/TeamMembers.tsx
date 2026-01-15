import SectionTitle from "@/components/SectionTitle";
import MemberComp from "@/components/MemberComp";
import { useTranslations } from "next-intl";
import Link from "next/dist/client/link";

interface Member {
  id: string;
  name: string;
  position: string;
  gender: "MALE" | "FEMALE";
  image?: string;
}

interface TeamMembersProps {
  members: Member[];
}

export default function TeamMembers({ members }: TeamMembersProps) {
  const t = useTranslations();

  return (
    <div className="overflow-hidden lg:-translate-y-1 -translate-y-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <SectionTitle
          title={t("TeamsPage.members")}
          lineColor="#3253BA"
          font="poppins"
          extraClass="text-[24px] md:text-[26px] font-bold md:text-nowrap mt-6"
        />
      </div>
      <div className="gg -translate-y-8 md:translate-0 flex overflow-x-scroll gap-5 w-screen md:w-auto lg:mt-8 md:grid md:grid-cols-2 lg:grid-cols-4 justify-between md:items-center md:px-4 lg:px-9 md:mx-auto md:max-w-[1280px] md:gap-12">
        {members.map((member, index) => (
          <div
            key={member.id}
            className={`flex-shrink-0 self-start
     ${index === 0 ? "ml-[40px] md:ml-0" : ""} ${
              index === members.length - 1 ? "mr-[40px] md:mr-0" : ""
            } `}
          >
            <Link href={`/members/${member.id}`}>
              <MemberComp member={member} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
