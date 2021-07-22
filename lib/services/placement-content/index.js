import {
  get as apiGet,
  TYPE_BROOKLYN,
  RESPONSE_ERROR_TYPE_RANGE_500,
} from 'api-client'
import _get from 'lodash/get'
import { fromJS } from 'immutable'

export const ALL_YOGA_PRACTICES_ID = 26711

export async function getPlacementContent (options) {
  const { auth, tid, language } = options

  const handleResponse = function handleResponse (res, _dataError) {
    const data = _get(res, 'body', {})
    return fromJS({ _dataError, data })
  }

  if (!auth) {
    return handleResponse({}, true)
  }
  const apiOptions = {
    auth,
    responseErrorType: RESPONSE_ERROR_TYPE_RANGE_500,
  }
  try {
    const res = await apiGet(
      `placement-content/subcategory-spotlight/${tid}?language[]=${language}`,
      null,
      apiOptions,
      TYPE_BROOKLYN,
    )
    return handleResponse(res)
  } catch (e) {
    return handleResponse({}, true)
  }
}
