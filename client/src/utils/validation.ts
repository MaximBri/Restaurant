export function validateRequired(value: string, fieldName: string) {
  if (!value.trim()) {
    return `Поле "${fieldName}" обязательно`
  }

  return null
}

export function validateName(value: string, fieldName: string, minLength = 2) {
  const requiredError = validateRequired(value, fieldName)

  if (requiredError) return requiredError

  const trimmed = value.trim()

  if (trimmed.length < minLength) {
    return `Поле "${fieldName}" должно содержать минимум ${minLength} символа`
  }

  return null
}

export function validateEmail(value: string) {
  const requiredError = validateRequired(value, 'Email')

  if (requiredError) return requiredError

  const normalized = value.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if (!emailRegex.test(normalized)) {
    return 'Введите корректный email'
  }

  return null
}

export function validatePassword(value: string, minLength = 8) {
  const requiredError = validateRequired(value, 'Пароль')

  if (requiredError) return requiredError

  if (value.length < minLength) {
    return `Пароль должен содержать минимум ${minLength} символов`
  }

  return null
}

const PHONE_ALLOWED_REGEX = /^[+\d\s()-]+$/
const PHONE_DIGITS_REGEX = /^(\+7|7|8)\d{10}$/

export function normalizePhone(value: string) {
  const trimmed = value.trim()
  const normalized = trimmed.replace(/[()\s-]/g, '')

  if (normalized.startsWith('8')) {
    return `+7${normalized.slice(1)}`
  }

  if (normalized.startsWith('7')) {
    return `+${normalized}`
  }

  return normalized
}

export function validatePhone(value: string) {
  const requiredError = validateRequired(value, 'Телефон')

  if (requiredError) return requiredError

  const trimmed = value.trim()

  if (!PHONE_ALLOWED_REGEX.test(trimmed)) {
    return 'Телефон может содержать только цифры, пробелы, скобки, дефисы и знак +'
  }

  const normalized = normalizePhone(trimmed)

  if (!PHONE_DIGITS_REGEX.test(normalized)) {
    return 'Введите номер в формате +7XXXXXXXXXX'
  }

  return null
}
