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

import { deleteLead } from "../api/actions"

type DeleteLeadButtonProps = {
  leadId: string
  leadName: string
}

export function DeleteLeadButton({ leadId, leadName }: DeleteLeadButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        <Trash2 className="size-4" />
        Удалить
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить лида?</AlertDialogTitle>
          <AlertDialogDescription>
            Лид «{leadName}» будет удалён безвозвратно. Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <form action={deleteLead}>
            <input type="hidden" name="leadId" value={leadId} />
            <AlertDialogAction type="submit" variant="destructive">
              Удалить
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
