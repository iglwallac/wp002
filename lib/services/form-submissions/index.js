import { post as apiPost, TYPE_BROOKLYN_JSON } from 'api-client'
import _get from 'lodash/get'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'

export const FORM_SUBMISSION_NAME_CANCEL_FLOW = 'cancel-flow'

const SCHEMA = {
  data: {},
  _dataError: null,
}

export async function post (options) {
  const { auth, data } = options
  try {
    const res = await apiPost('form-submissions', data, { auth }, TYPE_BROOKLYN_JSON)
    return handlePost(res)
  } catch (e) {
    return handlePost({}, true)
  }
}

export function handlePost (res, _dataError) {
  const data = _get(res, 'body', {})
  return _assign(_cloneDeep(SCHEMA), {
    data: _get(data, 'data', {}),
    _dataError,
  })
}
