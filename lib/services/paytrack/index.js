import { fromJS } from 'immutable'
import { log as logError } from 'log/error'
import _get from 'lodash/get'
import {
  get as apiGet,
  TYPE_BROOKLYN_JSON,
  RESPONSE_ERROR_TYPE_RANGE_500,
} from 'api-client'

export const PAYMENT_PROVIDER_NAME_GCSI = 'gcsi'

export default async function getPaytrackLastTransaction (options = {}) {
  const { auth } = options

  const handleResponse = (res) => {
    if (res.status >= 400) {
      logError(null, `Bad Request to Paytrack. Payload - ${JSON.stringify(res.body)}`)
    }

    const lastTransaction = _get(res, 'body', {})

    return fromJS({
      lastTransaction,
    })
  }

  if (!auth) {
    return handleResponse({}, true)
  }

  const apiOptions = {
    auth,
    responseErrorType: RESPONSE_ERROR_TYPE_RANGE_500,
  }
  const res = await apiGet('/last-transaction', null, apiOptions, TYPE_BROOKLYN_JSON)
  return handleResponse(res)
}
