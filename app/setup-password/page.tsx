import { AuthShell } from "@/components/auth/auth-shell";
import { SetupPasswordForm } from "@/components/auth/setup-password-form";

export default function SetupPasswordPage() {
  return (
    <AuthShell
      description="Создайте временный локальный пароль, который будет использоваться для входа в клиентский портал на этапе MVP."
      eyebrow="Первичная настройка"
      title="Создание пароля портала"
    >
      <SetupPasswordForm />
    </AuthShell>
  );
}
