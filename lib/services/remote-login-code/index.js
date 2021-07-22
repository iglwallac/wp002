import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import _get from 'lodash/get'

export const TEXTBOX_REMOTE_LOGIN_CODE = 'remote_login_code'
export const REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED = 'remoteLoginCodeSuccessfullyActivated'
export const APPROVE_REMOTE_LOGIN_CODE_PROCESSING = 'approveRemoteLoginCodeProcessing'
export const APPROVE_REMOTE_LOGIN_CODE_ERROR_CODE = 'approveRemoteLoginCodeErrorCode'
export const REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED_CODE = 'activatedCode'

export function getRemoteLoginCodeValidation () {
  return {
    minLength: REMOTE_LOGIN_CODE_LENGTH,
    matchRegexp: REMOTE_LOGIN_CODE_REGEX,
  }
}

const REMOTE_LOGIN_CODE_REGEX = /^\d+$/
const REMOTE_LOGIN_CODE_LENGTH = 6

export async function approveRemoteLoginCode ({ auth, remoteLoginCode }) {
  try {
    const url = `v1/approve-code/${remoteLoginCode}`
    const res = await apiGet(url, null, { auth }, TYPE_BROOKLYN)
    return handleResponse(res, remoteLoginCode)
  } catch (e) {
    return handleResponse({}, remoteLoginCode, true, e.code)
  }
}

function handleResponse (res, remoteLoginCode, _dataError) {
  const returnVal = {}
  const genericErrorCode = 500
  if (_dataError) {
    returnVal[REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED] = false
    returnVal[APPROVE_REMOTE_LOGIN_CODE_ERROR_CODE] = genericErrorCode
    return returnVal
  }
  const status = _get(res, 'status')
  if (status === 200) {
    const returnedCode = _get(res.body.data, REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED_CODE, null)
    returnVal[REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED] = true
    returnVal[REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED_CODE] = returnedCode
    return returnVal
  }
  if (status === 400) {
    returnVal[REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED] = false
    returnVal[APPROVE_REMOTE_LOGIN_CODE_ERROR_CODE] = 400
    return returnVal
  }
  returnVal[REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED] = false
  returnVal[APPROVE_REMOTE_LOGIN_CODE_ERROR_CODE] = genericErrorCode
  return returnVal
}
