"use client";

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";

import { ordersReducer } from "@features/orders";

import { shipmentReducer } from "@entities/shipment";
import { vehicleReducer } from "@entities/vehicle";

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
