"use client";

import { useCreateShipmentForm } from "../model/use-create-shipment-form";
import { ShipmentDetailsForm } from "./shipment-details-form";
import { TransportSelectDialog } from "./transport-select-dialog";

interface Props { open: boolean; onClose: () => void }

export function CreateShipmentSheet({ open, onClose }: Props) {
  const form = useCreateShipmentForm(open);

  return (
    <>
      <TransportSelectDialog
        open={open && form.step === "select-type"}
        onClose={onClose}
        type={form.type}
        step1Valid={form.step1Valid}
        onContinue={() => form.setStep("details")}
      />

      <ShipmentDetailsForm
        open={open && form.step === "details"}
        onClose={onClose}
        form={form}
      />
    </>
  );
}
