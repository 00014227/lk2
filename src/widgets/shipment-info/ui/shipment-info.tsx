import { Card } from "@shared/ui/card";
import type { Shipment } from "@entities/shipment";
import { buildShipmentInfoGroups } from "../model/config";
import { InfoGroup } from "./info-group";

interface Props {
  shipment: Shipment;
  isRailway: boolean;
}

export function ShipmentInfo({ shipment, isRailway }: Props) {
  const groups = buildShipmentInfoGroups(shipment, isRailway);

  return (
    <Card className="p-5 lg:p-6">
      <h2 className="font-display text-lg font-semibold">
        Информация об отправлении
      </h2>
      <div className="mt-2 flex flex-col divide-y divide-border">
        {groups.map((group) => (
          <InfoGroup key={group.title} group={group} />
        ))}
      </div>
    </Card>
  );
}
