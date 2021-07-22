import {
  approveRemoteLoginCode,
} from './index'

export const SET_REMOTE_LOGIN_CODE_PROCESSING = 'SET_REMOTE_LOGIN_CODE_PROCESSING'
export const SET_REMOTE_LOGIN_CODE_DATA = 'SET_REMOTE_LOGIN_CODE_DATA'

export function getRemoteLoginCodeApproval ({ auth, remoteLoginCode }) {
  return async function getRemoteLoginCodeApprovalThunk (dispatch) {
    dispatch(setRemoteLoginCodeProcessing(true))
    const data = await approveRemoteLoginCode({ auth, remoteLoginCode })
    dispatch(setRemoteLoginCodeData(data))
    return data
  }
}

export function setRemoteLoginCodeProcessing (value) {
  return {
    type: SET_REMOTE_LOGIN_CODE_PROCESSING,
    payload: value,
  }
}

export function setRemoteLoginCodeData (data, processing = false) {
  return {
    type: SET_REMOTE_LOGIN_CODE_DATA,
    payload: { data, processing },
  }
}
