"use client";

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import { shipmentReducer } from "@entities/shipment/model/slice";
import { vehicleReducer } from "@entities/vehicle/model/slice";
import { ordersReducer } from "@features/orders/model/slice";

export const store = configureStore({
  reducer: {
    shipment: shipmentReducer,
    vehicle: vehicleReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
