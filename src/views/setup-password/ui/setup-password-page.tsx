"use client";

import { useTranslation } from "react-i18next";

import { AuthShell, SetupPasswordForm } from "@features/auth";

export default function SetupPasswordPage() {
  const { t } = useTranslation();
  return (
    <AuthShell
      description={t("setupPassword.description")}
      eyebrow={t("setupPassword.eyebrow")}
      title={t("setupPassword.title")}
    >
      <SetupPasswordForm />
    </AuthShell>
  );
}
