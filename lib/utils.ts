export function calculateFine(
  dueDate: Date,
  returnedAt: Date,
  finePerDay: number = Number(process.env.FINE_PER_DAY ?? 5000)
): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const daysLate = Math.floor(
    (returnedAt.getTime() - dueDate.getTime()) / msPerDay
  )
  return daysLate > 0 ? daysLate * finePerDay : 0
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
