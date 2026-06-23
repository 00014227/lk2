import { AuthShell, LoginForm } from "@features/auth";

export default function LoginPage() {
  return (
    <AuthShell
      description="Войдите с паролем, сохраненным локально на этом устройстве, чтобы получить доступ к инструментам отслеживания отправлений."
      eyebrow="Безопасный доступ"
      title="Вход в портал TransAsia"
    >
      <LoginForm />
    </AuthShell>
  );
}
