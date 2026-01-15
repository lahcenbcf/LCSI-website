"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { fr, en } from "@/assets";
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <div className="flex items-center gap-3 px-2">
      <Link
        href={pathname}
        locale="en"
        className={`transition-colors duration-200 relative hover:opacity-70 `}
      >
        <Image
          src={en}
          alt="English"
          width={25}
          height={25}
          className="inline-block"
        />
        {locale == "en" && (
          <span className="w-2 h-2 absolute bg-mainBlue rounded-full -bottom-[12px] lg:left-[6px] left-[8.5px]"></span>
        )}
      </Link>
      <Link
        href={pathname}
        locale="fr"
        className={`transition-colors duration-200 relative hover:opacity-70`}
      >
        <Image
          src={fr}
          alt="French"
          width={25}
          height={25}
          className="inline-block"
        />
        {locale == "fr" && (
          <span className="w-2 h-2 absolute bg-mainBlue rounded-full -bottom-[12px] lg:left-[7px] left-[8px]"></span>
        )}
      </Link>
    </div>
  );
}
