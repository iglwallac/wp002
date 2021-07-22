export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])/
export const PASSWORD_LENGTH = 7
export const PASSWORD_MAX_LENGTH = 32
export const PASSWORD_INPUT_MAX_CHARS = 100

export function getPasswordValidation () {
  return {
    minLength: PASSWORD_LENGTH,
    matchRegexp: PASSWORD_REGEX,
    maxLength: PASSWORD_MAX_LENGTH,
  }
}

export function getRepeatedPasswordValidation (validate) {
  return (
    `equalsField:${validate}`
  )
}
