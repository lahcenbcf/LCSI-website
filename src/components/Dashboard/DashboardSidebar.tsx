"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logo } from "@/assets";
import {
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  BookOpen,
  Calendar,
  BarChart3,
  Lock,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/dash",
    icon: Home,
  },
  {
    name: "Membres",
    href: "/dash/members",
    icon: Users,
  },
  {
    name: "Publications",
    href: "/dash/publications",
    icon: BookOpen,
  },
  {
    name: "Actualités",
    href: "/dash/news",
    icon: Calendar,
  },
  {
    name: "Équipes",
    href: "/dash/teams",
    icon: BarChart3,
  },
  {
    name: "Paramètres",
    href: "/dash/settings",
    icon: Settings,
  },
  {
    name: "Sécurité",
    href: "/dash/security",
    icon: Lock,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:bg-white lg:border-r lg:border-grayBorder lg:h-screen">
        {/* Desktop Logo */}
        <div className="flex items-center p-6 border-b border-grayBorder">
          <div className="flex items-center space-x-3">
            <Image
              src={logo}
              alt="LCSI Lab"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-mainBlue font-integralCF">
                LCSI LAB
              </h1>
              <p className="text-xs text-lightgrayTxt">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-mainBlue text-white shadow-lg"
                    : "text-darkgrayTxt hover:bg-grayRectangle hover:text-mainBlue"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Logout */}
        <div className="p-4 border-t border-grayBorder">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Mobile Sheet Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-grayBorder lg:hidden">
            <Menu size={24} className="text-mainBlue" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-white">
          <SheetHeader className="p-6 border-b border-grayBorder">
            <div className="flex items-center space-x-3">
              <Image
                src={logo}
                alt="LCSI Lab"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <SheetTitle className="text-lg font-bold text-mainBlue font-integralCF">
                  LCSI LAB
                </SheetTitle>
                <p className="text-xs text-lightgrayTxt">Dashboard</p>
              </div>
            </div>
          </SheetHeader>
          <div className="flex flex-col h-full">
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SheetClose asChild key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-mainBlue text-white shadow-lg"
                          : "text-darkgrayTxt hover:bg-grayRectangle hover:text-mainBlue"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>

            {/* Logout */}
            <SheetFooter className="p-4 border-t border-grayBorder">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <LogOut size={20} />
                <span className="font-medium">Déconnexion</span>
              </button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
