import { RequireAuth } from "@features/auth";
import { DashboardShell } from "./dashboard-shell";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardShell />
    </RequireAuth>
  );
}
