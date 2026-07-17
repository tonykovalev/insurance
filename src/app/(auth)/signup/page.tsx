import Link from "next/link"

import { SignupForm } from "@/features/auth/ui/SignupForm"

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6">
        <h1 className="mb-6 text-xl font-semibold">Регистрация агента</h1>
        <SignupForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
