import { SiteHeader } from "@/components/layout/site-header";
import { AuthCheck } from "@/components/layout/auth-check";

interface AppShellProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function AppShell({ children, allowedRoles }: AppShellProps) {
  return (
    <AuthCheck allowedRoles={allowedRoles}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </div>
    </AuthCheck>
  );
}
