import { post, TYPE_BROOKLYN } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'

const SCHEMA = {
  _dataError: null,
  clientTime: null,
  clientTimeMs: null,
  serverTime: null,
  serverTimeMs: null,
  timestampDiffMs: null,
  todayStart: null,
}

/**
 * Get the server time
 * @param {Object} options The options
 * @param {Number} options.clientTimeMs The client time in milliseconds
 */
export async function get (options = {}) {
  try {
    const { clientTimeMs = Math.floor(Date.now()) } = options
    const res = await post(
      'v1/server-time',
      { clientTime: clientTimeMs },
      {},
      TYPE_BROOKLYN,
    )
    return handleResponse(res, clientTimeMs)
  } catch (e) {
    throw new Error('Could not fetch server time.')
  }
}

export function handleResponse (res, clientTime, _dataError) {
  const data = _get(res, 'body', {})
  return createModel(data, clientTime, _dataError)
}

function createModel (data, clientTimeMs, _dataError) {
  const serverTimeMs = _parseInt(_get(data, 'serverTimeMs', -1))
  let timestampDiffMs = 0
  if (serverTimeMs > -1) {
    timestampDiffMs = serverTimeMs - clientTimeMs
  }
  return _assign(_cloneDeep(SCHEMA), {
    _dataError,
    clientTime: Math.floor(clientTimeMs / 1000),
    clientTimeMs,
    serverTime: _parseInt(_get(data, 'serverTime', -1)),
    serverTimeMs,
    timestampDiff: Math.floor(timestampDiffMs / 1000),
    timestampDiffMs,
    todayStart: _parseInt(_get(data, 'todayStart', -1)),
  })
}
