export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dateToLocalString(date) {
  if (!date) return null
  if (typeof date === 'string') return date
  return getLocalDateString(date)
}

export function getTodayDateString() {
  return getLocalDateString(new Date())
}
