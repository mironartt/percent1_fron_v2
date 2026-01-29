export function pluralizeDays(n) {
  const lastTwo = n % 100
  const lastOne = n % 10

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${n} дней`
  }

  if (lastOne === 1) {
    return `${n} день`
  }

  if (lastOne >= 2 && lastOne <= 4) {
    return `${n} дня`
  }

  return `${n} дней`
}

export function pluralize(n, one, few, many) {
  const lastTwo = n % 100
  const lastOne = n % 10

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${n} ${many}`
  }

  if (lastOne === 1) {
    return `${n} ${one}`
  }

  if (lastOne >= 2 && lastOne <= 4) {
    return `${n} ${few}`
  }

  return `${n} ${many}`
}
