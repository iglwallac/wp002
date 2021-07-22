import { updatePassword } from 'services/reset-password'

export const SET_RESET_PASSWORD_DATA = 'SET_RESET_PASSWORD_DATA'
export const RESET_RESET_PASSWORD = 'RESET_RESET_PASSWORD'
export const SET_RESET_PASSWORD_PROCESSING = 'SET_RESET_PASSWORD_PROCESSING'

export function doResetPassword (options) {
  return function doResetPasswordThunk (dispatch) {
    dispatch(
      setResetPasswordData(
        {},
        true,
      ),
    )
    return updatePassword(options)
      .then((data) => {
        // eslint-disable-next-line no-param-reassign
        data.success = true
        dispatch(setResetPasswordData(data, false))
        return data
      })
      .catch(() => {
        dispatch(
          setResetPasswordData(
            {
              success: false,
            },
            false,
          ),
        )
      })
  }
}

export function resetResetPassword () {
  return {
    type: RESET_RESET_PASSWORD,
  }
}

export function setResetPasswordData (data, processing = false) {
  return {
    type: SET_RESET_PASSWORD_DATA,
    payload: { data, processing },
  }
}

export function setResetPasswordProcessing (value) {
  return {
    type: SET_RESET_PASSWORD_PROCESSING,
    payload: value,
  }
}
