/**
 * Features related to interacting with a node information for a user
 * such as resume position, playlist status, etc.
 * @module serives/user-node-info
 */
import { get as apiGet, post as apiPost, TYPE_BROOKLYN } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _join from 'lodash/join'
import _map from 'lodash/map'
import _parseInt from 'lodash/parseInt'
import _partial from 'lodash/partial'
import _size from 'lodash/size'

export async function getMany (nodeIds, options = {}) {
  const { auth } = options
  const requestOptions = {
    path: 'api/user/node', // This path still requires the api/ path
    params: nodeIds.join(','),
  }
  const response = await apiPost('batchget', requestOptions, { auth }, TYPE_BROOKLYN)
  const batchResponses = _get(response, 'body.batchResponses', [])

  // Return an object with data keyed by node id
  return batchResponses.reduce((acc, item) => {
    const id = _get(item, 'id')
    if (!id) {
      return acc
    }

    // Convert to expected data types
    const itemData = _get(item, 'data', {})
    acc[item.id] = convertTypes(itemData)
    return acc
  }, {})
}

export async function getOne (nodeId, options = {}) {
  const { auth } = options
  const response = await apiGet(`user/node/${nodeId}`, {}, { auth }, TYPE_BROOKLYN)
  const body = _get(response, 'body', {})

  // Convert to expected data types
  return convertTypes(body)
}

function convertTypes (data) {
  return {
    playlist: data.playlist || false,
    featurePosition: data.featurePosition ? Number(data.featurePosition) : 0,
  }
}

// Legacy code below here
const SCHEMA_USER = {
  id: null,
  _dataError: null,
  featurePosition: 0,
  playlist: false,
}

/**
 * Get user node info using batchget endpoint
 * @param {Object} options The options
 * @param {Number[]} options.ids A list of content ids
 * @param {import('immutable').Map|String} [options.auth] Optional authentication
 */
export async function legacyBatchGet (options = {}) {
  const { ids = [], auth } = options
  if (!ids || _size(ids) === 0) {
    return handleGetResponse({}, false)
  }
  const params = {
    path: 'api/user/node', // This path still requires the api/ path
    params: _join(ids, ','),
  }
  try {
    const res = await apiPost('batchget', params, { auth }, TYPE_BROOKLYN)
    return handleGetResponse(res)
  } catch (e) {
    return handleGetResponse({}, true)
  }
}

export function handleGetResponse (res, _dataError) {
  const batchResponses = _get(res, 'body.batchResponses', [])
  const rows = _isArray(batchResponses) ? batchResponses : []
  return _map(rows, _partial(createModel, _partial.placeholder, _dataError))
}

export function createModel (data, _dataError) {
  const featurePosition = _get(data, 'data.featurePosition', 0)
  return _assign(_cloneDeep(SCHEMA_USER), {
    id: _parseInt(_get(data, 'id', -1)),
    _dataError,
    featurePosition: featurePosition ? _parseInt(featurePosition) : 0,
    playlist: _get(data, 'data.playlist', false),
  })
}
