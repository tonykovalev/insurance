"use client"

import { useActionState } from "react"
import { UserRoundCheck } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"

import { convertLeadToClient, type ConvertLeadState } from "../api/actions"

type ConvertLeadButtonProps = {
  leadId: string
  leadName: string
}

export function ConvertLeadButton({ leadId, leadName }: ConvertLeadButtonProps) {
  const [state, formAction, pending] = useActionState<ConvertLeadState, FormData>(
    convertLeadToClient,
    undefined
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        <UserRoundCheck className="size-4" />
        Конвертировать в клиента
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Конвертировать лида в клиента?</AlertDialogTitle>
          <AlertDialogDescription>
            «{leadName}» появится в списке клиентов, а лид получит статус «Выигран». Лид при этом
            не удаляется.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="leadId" value={leadId} />
            <AlertDialogAction type="submit" disabled={pending}>
              {pending ? "Конвертируем..." : "Конвертировать"}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
