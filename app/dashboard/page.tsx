import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RequireAuth } from "@/components/auth/require-auth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardShell />
    </RequireAuth>
  );
}
