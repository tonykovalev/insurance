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

import { deleteClient } from "../api/actions"

type DeleteClientButtonProps = {
  clientId: string
  clientName: string
}

export function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        <Trash2 className="size-4" />
        Удалить
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
          <AlertDialogDescription>
            Клиент «{clientName}» и все его полисы будут удалены безвозвратно. Это действие
            нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <form action={deleteClient}>
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
