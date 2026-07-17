"use client"

import { Trash2 } from "lucide-react"

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

import { deletePolicy } from "../api/actions"

type DeletePolicyButtonProps = {
  policyId: string
  clientId: string
  policyNumber: string
}

export function DeletePolicyButton({ policyId, clientId, policyNumber }: DeletePolicyButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Удалить полис" />}>
        <Trash2 className="size-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить полис?</AlertDialogTitle>
          <AlertDialogDescription>
            Полис «{policyNumber}» будет удалён безвозвратно. Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <form action={deletePolicy}>
            <input type="hidden" name="policyId" value={policyId} />
            <input type="hidden" name="clientId" value={clientId} />
            <AlertDialogAction type="submit" variant="destructive">
              Удалить
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
