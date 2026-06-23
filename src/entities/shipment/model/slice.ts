import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Shipment } from "./types";

interface ShipmentState {
  items: Shipment[];
}

const initialState: ShipmentState = {
  items: [],
};

export const shipmentSlice = createSlice({
  name: "shipment",
  initialState,
  reducers: {
    setShipments(state, action: PayloadAction<Shipment[]>) {
      state.items = action.payload;
    },
  },
  selectors: {
    selectShipments: (state) => state.items,
    selectShipmentById: (state, id: string | null) =>
      id ? state.items.find((s) => s.id === id) ?? null : null,
  },
});

export const { setShipments } = shipmentSlice.actions;
export const { selectShipments, selectShipmentById } = shipmentSlice.selectors;
export const shipmentReducer = shipmentSlice.reducer;
