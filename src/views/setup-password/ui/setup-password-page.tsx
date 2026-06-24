import { AuthShell, SetupPasswordForm } from "@features/auth";

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
