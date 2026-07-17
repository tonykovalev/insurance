import Link from "next/link"

import { LoginForm } from "@/features/auth/ui/LoginForm"

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6">
        <h1 className="mb-6 text-xl font-semibold">Вход в систему</h1>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href="/signup" className="font-medium text-foreground underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
