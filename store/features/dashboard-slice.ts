"use client";

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { DashboardTab, Shipment, Vehicle } from "@/lib/types";

// ── Thunk ────────────────────────────────────────────────────────────────────
export const fetchMyOrders = createAsyncThunk("dashboard/fetchMyOrders", async () => {
  const { data } = await api.get<{ shipments: Shipment[]; vehicles: Vehicle[] }>("/orders/my");
  return data;
});

// ── Slice ────────────────────────────────────────────────────────────────────
interface DashboardState {
  activeTab: DashboardTab;
  selectedShipmentId: string | null;
  selectedVehicleId: string | null;
  shipments: Shipment[];
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  activeTab: "map",
  selectedShipmentId: null,
  selectedVehicleId: null,
  shipments: [],
  vehicles: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<DashboardTab>) {
      state.activeTab = action.payload;
    },
    selectShipment(state, action: PayloadAction<string | null>) {
      state.selectedShipmentId = action.payload;
    },
    selectVehicle(state, action: PayloadAction<string | null>) {
      state.selectedVehicleId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments = action.payload.shipments;
        state.vehicles = action.payload.vehicles;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Ошибка загрузки данных";
      });
  },
});

export const { setActiveTab, selectShipment, selectVehicle } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
