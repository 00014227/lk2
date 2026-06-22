import { ShipmentDetail } from "@/components/shipment/shipment-detail";
import { RequireAuth } from "@/components/auth/require-auth";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth>
      <ShipmentDetail id={id} />
    </RequireAuth>
  );
}
