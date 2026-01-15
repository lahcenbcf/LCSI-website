import { DashboardSidebar, DashboardHeader } from "@/components/Dashboard";
import AuthGuard from "@/components/AuthGuard";
import RoleBasedDashboard from "@/components/RoleBasedDashboard";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { ProfileStateProvider } from "@/contexts/ProfileStateContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard redirectTo="/auth/signin">
      <ProfileStateProvider>
        <RoleBasedDashboard>
          <PermissionsProvider>
            <div className="h-screen bg-grayRectangle flex overflow-hidden">
              {/* Sidebar (Desktop + Mobile avec Sheet) */}
              <DashboardSidebar />

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>
            </div>
          </PermissionsProvider>
        </RoleBasedDashboard>
      </ProfileStateProvider>
    </AuthGuard>
  );
}
