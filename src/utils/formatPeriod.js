// "2024-03" → "Mar 2024"
export function formatMonth(value) {
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

// An experience entry's dates, e.g. "Mar 2024 — Present" when there's no end date
export function formatPeriod({ startDate, endDate }) {
  return `${formatMonth(startDate)} — ${endDate ? formatMonth(endDate) : 'Present'}`
}
