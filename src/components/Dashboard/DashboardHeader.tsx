"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { Bell, Search, ChevronDown } from "lucide-react";

export default function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-grayBorder px-6 py-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-6 ml-6">
          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-darkgrayTxt">
                {session?.user?.name || "Utilisateur"}
              </p>
              <p className="text-xs text-lightgrayTxt">
                {session?.user?.role || "Membre"}
              </p>
            </div>

            <div className="relative">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Profile"}
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-mainBlue ring-offset-2"
                />
              ) : (
                <div className="w-10 h-10 bg-mainBlue rounded-full flex items-center justify-center ring-2 ring-mainBlue ring-offset-2">
                  <span className="text-white font-semibold text-sm">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
