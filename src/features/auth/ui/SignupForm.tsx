"use client"

import { useActionState } from "react"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

import { signup } from "../api/actions"

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        {state?.errors?.password?.map((error) => (
          <p key={error} className="text-sm text-destructive">
            {error}
          </p>
        ))}
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Создаём аккаунт..." : "Зарегистрироваться"}
      </Button>
    </form>
  )
}
