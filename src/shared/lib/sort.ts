export type SortOrder = "asc" | "desc"

export function parseSort<TKey extends string>(
  params: { sort?: string; order?: string },
  allowedKeys: readonly TKey[],
  defaultKey: TKey,
  defaultOrder: SortOrder = "desc"
): { sort: TKey; order: SortOrder } {
  const sort = (allowedKeys as readonly string[]).includes(params.sort ?? "")
    ? (params.sort as TKey)
    : defaultKey

  const order: SortOrder = params.order === "asc" || params.order === "desc" ? params.order : defaultOrder

  return { sort, order }
}
