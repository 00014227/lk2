import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Vehicle } from "./types";

interface VehicleState {
  items: Vehicle[];
}

const initialState: VehicleState = {
  items: [],
};

export const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setVehicles(state, action: PayloadAction<Vehicle[]>) {
      state.items = action.payload;
    },
  },
  selectors: {
    selectVehicles: (state) => state.items,
    selectVehicleById: (state, id: string | null) =>
      id ? (state.items.find((v) => v.id === id) ?? null) : null,
  },
});

export const { setVehicles } = vehicleSlice.actions;
export const { selectVehicles, selectVehicleById } = vehicleSlice.selectors;
export const vehicleReducer = vehicleSlice.reducer;
