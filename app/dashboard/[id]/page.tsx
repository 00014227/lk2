import { ShipmentDetailView } from "@views/shipment-detail";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShipmentDetailView id={id} />;
}
