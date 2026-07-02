"use client";

import { useTranslation } from "react-i18next";

import { AuthShell, LoginForm } from "@features/auth";

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <AuthShell
      description={t("login.description")}
      eyebrow={t("login.eyebrow")}
      title={t("login.title")}
    >
      <LoginForm />
    </AuthShell>
  );
}
