
export const TOASTY_ADD_MESSAGE = 'TOASTY_ADD_MESSAGE'
export const TOASTY_REMOVE_MESSAGE = 'TOASTY_REMOVE_MESSAGE'

let toastId = 0

function createId () {
  // eslint-disable-next-line
  return `toast-${++toastId}`
}

export function addToasty (message) {
  return {
    type: TOASTY_ADD_MESSAGE,
    payload: {
      id: createId(),
      message,
    },
  }
}

export function removeToasty (id) {
  return {
    type: TOASTY_REMOVE_MESSAGE,
    payload: { id },
  }
}
