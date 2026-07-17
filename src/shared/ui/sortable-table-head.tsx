import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import type { SortOrder } from "@/shared/lib/sort"
import { TableHead } from "@/shared/ui/table"

type SortableTableHeadProps = {
  label: string
  sortKey: string
  currentSort: string
  currentOrder: SortOrder
  className?: string
  extraParams?: Record<string, string>
}

export function SortableTableHead({
  label,
  sortKey,
  currentSort,
  currentOrder,
  className,
  extraParams,
}: SortableTableHeadProps) {
  const isActive = currentSort === sortKey
  const nextOrder: SortOrder = isActive && currentOrder === "asc" ? "desc" : "asc"
  const Icon = !isActive ? ArrowUpDown : currentOrder === "asc" ? ArrowUp : ArrowDown

  const query = new URLSearchParams({ ...extraParams, sort: sortKey, order: nextOrder })

  return (
    <TableHead className={className}>
      <Link
        href={`?${query.toString()}`}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <Icon className="size-3.5" />
      </Link>
    </TableHead>
  )
}
