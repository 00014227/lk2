import { useDispatch, useSelector } from "react-redux";

import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";

/**
 * App-wide typed Redux hooks, kept in `shared` so any layer may use them
 * without importing from the `app` layer (which would break FSD's import
 * direction). Reads stay fully typed through slice selectors; dispatch is
 * typed to accept thunks without depending on the configured store's RootState.
 */
type AppThunkDispatch = ThunkDispatch<unknown, unknown, UnknownAction>;

export const useAppDispatch = () => useDispatch<AppThunkDispatch>();
export const useAppSelector = useSelector;
