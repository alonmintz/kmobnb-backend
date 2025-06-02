export function getDayDiff(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const msInDay = 86400000 // 24 * 60 * 60 * 1000
  return (end - start) / msInDay
}