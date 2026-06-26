import { RequireAuth } from "@features/auth";
import { RatingShell } from "./rating-shell";

export default function RatingPage() {
  return (
    <RequireAuth>
      <RatingShell />
    </RequireAuth>
  );
}
