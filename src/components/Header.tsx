"use client";

import ContactComp from "./ContactComp";
import Image from "next/image";
import { logo } from "@/assets";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import {  Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { usePathname } from "next/navigation";
export default function Header() {
  const t = useTranslations("Header");

  const navItems = [
    { key: "presentation", href: "/presentation" },
    { key: "teams", href: "/teams" },
    { key: "publications", href: "/publications" },
    { key: "members", href: "/members" },
    { key: "news", href: "/news" },
  ];
  const page = usePathname().split("/")[2];

  return (
    <Sheet>
      <div className="hidden lg:block">
        <ContactComp />
      </div>
      <header className="bg-white border-b-[2px] border-grayBorder w-full">
        {/* lcsi logo */}
        <div className="container mx-auto px-4 py-4 flex justify-between items-center w-full">
          <Link href={"/"} className="pl-5">
            <Image src={logo} alt="Logo" width={75} height={50} />
          </Link>
          {/* Navigation bar -- Desktop */}
          <div className="hidden lg:block ">
            <div className="flex gap-3 items-center">
              {/* Navigation items */}
              <nav className="container mx-auto px-4 py-2">
                <ul className="flex gap-8 justify-end">
                  {navItems.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className={`${
                          page == item.key ? "text-mainBlue" : "text-black"
                        } hover:text-mainBlue transition-colors duration-200 font-medium`}
                      >
                        {t(`nav.${item.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {/* lang switcher */}
              <LanguageSwitcher />
            </div>
            {/* Navigation sidbar -- phone / tablet screeen */}
          </div>
          <div className="lg:hidden">
            <SheetTrigger className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
              <Menu className="w-6 h-6 text-mainBlue" />
            </SheetTrigger>
          </div>
          <SheetTitle className="sr-only"></SheetTitle>
          <SheetContent
            side="right"
            className="min-w-1/2 w-64 bg-white border-l-2 border-grayBorder"
          >
            <div className="flex flex-col gap-3 p-4 mt-12">
              {/* Navigation items */}
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="text-black w-fit hover:text-mainBlue transition-colors duration-200 font-medium relative"
                  >
                    <span
                      className={`absolute ${
                        page == item.key ? "w-1/2" : "w-0 "
                      } h-1 bg-mainBlue -bottom-[4px] transition-all duration-200 `}
                    ></span>
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </nav>
              <div className="mt-7">
                {/* Contact info */}
                <h2 className="text-darkgrayTxt font-semibold">Contact</h2>
                <ContactComp />
                {/* lang switcher */}
                <h2 className="text-darkgrayTxt font-semibold mb-2">
                  {t("nav.language")}
                </h2>
                <LanguageSwitcher />
              </div>
            </div>
            <SheetFooter></SheetFooter>
          </SheetContent>
        </div>
      </header>
    </Sheet>
  );
}
