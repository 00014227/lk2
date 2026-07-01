import { RequireAuth } from "@features/auth";

import { ShipmentDetail } from "./shipment-detail";

export function ShipmentDetailView({ id }: { id: string }) {
  return (
    <RequireAuth>
      <ShipmentDetail id={id} />
    </RequireAuth>
  );
}
