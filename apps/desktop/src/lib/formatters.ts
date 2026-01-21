export const formatCurrency = (value: number | null | undefined, currency = "BRL") => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-"
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value)
}

export const formatDateTime = (value: string | Date | null | undefined) => {
  if (!value) {
    return "-"
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    return dateStr
  }
  return date.toLocaleDateString("pt-BR")
}

export const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
}
