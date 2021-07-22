export const SET_LOGIN_MESSAGE_CODES = 'SET_LOGIN_MESSAGE_CODES'
export const SET_LOGIN_MESSAGES = 'SET_LOGIN_MESSAGES'
export const SET_LOGIN_CAN_SUBMIT = 'SET_LOGIN_CAN_SUBMIT'
export const SET_LOGIN_PROCESSING = 'SET_LOGIN_PROCESSING'

export function setLoginMessageCodes (value) {
  return {
    type: SET_LOGIN_MESSAGE_CODES,
    payload: value,
  }
}

export function setLoginMessages (value) {
  return {
    type: SET_LOGIN_MESSAGES,
    payload: value,
  }
}

export function setLoginCanSubmit (value) {
  return {
    type: SET_LOGIN_CAN_SUBMIT,
    payload: value,
  }
}

export function setLoginProcessing (value) {
  return {
    type: SET_LOGIN_PROCESSING,
    payload: value,
  }
}
