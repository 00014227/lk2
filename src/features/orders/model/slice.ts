import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "@shared/api";
import { setShipments, type Shipment } from "@entities/shipment";
import { setVehicles, type Vehicle } from "@entities/vehicle";

export type DashboardTab = "map" | "shipments";

// Loads the client's orders (shipments + vehicles) and fans the result out
// into the shipment and vehicle entity slices.
export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async (_, { dispatch }) => {
    const { data } = await api.get<{ shipments: Shipment[]; vehicles: Vehicle[] }>("/orders/my");
    console.log("Fetched my orders:", data);
    dispatch(setShipments(data.shipments));
    dispatch(setVehicles(data.vehicles));
  },
);

interface OrdersState {
  loading: boolean;
  error: string | null;
  activeTab: DashboardTab;
  selectedShipmentId: string | null;
  selectedVehicleId: string | null;
}

const initialState: OrdersState = {
  loading: false,
  error: null,
  activeTab: "map",
  selectedShipmentId: null,
  selectedVehicleId: null,
};

export const ordersSlice = createSlice({
  name: "orders",
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
      .addCase(fetchMyOrders.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Ошибка загрузки данных";
      });
  },
  selectors: {
    selectOrdersLoading: (state) => state.loading,
    selectOrdersError: (state) => state.error,
    selectActiveTab: (state) => state.activeTab,
    selectSelectedShipmentId: (state) => state.selectedShipmentId,
    selectSelectedVehicleId: (state) => state.selectedVehicleId,
  },
});

export const { setActiveTab, selectShipment, selectVehicle } = ordersSlice.actions;
export const {
  selectOrdersLoading,
  selectOrdersError,
  selectActiveTab,
  selectSelectedShipmentId,
  selectSelectedVehicleId,
} = ordersSlice.selectors;
export const ordersReducer = ordersSlice.reducer;
