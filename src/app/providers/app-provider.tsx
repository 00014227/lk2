"use client";

import { Provider } from "react-redux";

import { store } from "@app/store";

import { I18nProvider } from "@shared/i18n";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <I18nProvider>{children}</I18nProvider>
    </Provider>
  );
}
