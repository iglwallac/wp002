/**
 * Features related to interacting with a node which will be deprecated
 * and replaced with content
 * @module serives/node
 */
import get from 'lodash/get'
import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import isFinite from 'lodash/isFinite'
import { map as mapPromise } from 'bluebird'
import { legacyBatchGet as getUserNodeInfo } from 'services/user-node-info'
import { createModel as createTileModel } from 'services/tile'
import { get as apiGet, TYPE_BROOKLYN_JSON } from 'api-client'

/**
 * Get a single node
 * @param {Object} [options={}] The options
 * @param {Number} options.id The content id (nid)
 * @param {String|String[]} options.language The content requested language
 * @param {Boolean} [options.asTile] If true transform the node response using
 * createTileModel()
 * @param {import('immutable').Map|String} [options.auth] Optional authentication
 */
export async function getNode (options = {}) {
  const { id, language, asTile, auth } = options
  // If we did not get an id just return an empty object
  if (!id) {
    return {}
  }
  try {
    const nodes = await getNodes({ ids: [id], language, asTile, auth })
    return get(nodes, 0, {})
  } catch (e) {
    return {}
  }
}

/**
 * Get multiple nodes by calling /node/:contentId for each id
 * @param {Object} [options={}] The options
 * @param {Number[]} options.ids A list of content ids
 * @param {String|String[]} options.language The content requested language
 * @param {Boolean} [options.asTile] If true transform the node response using
 * createTileModel()
 * @param {import('immutable').Map|String} [options.auth] Optional authentication
 */
export async function getNodes (options = {}) {
  const { ids, language, asTile, auth } = options
  if (!ids || size(ids) === 0) {
    return []
  }
  const nodes = await mapPromise(ids, async (id) => {
    // This is not a valid id so don't make a request
    if (!isFinite(id)) {
      return {}
    }
    try {
      const { body: data } = await apiGet(`node/${id}`, { language }, {}, TYPE_BROOKLYN_JSON)
      if (asTile) {
        return createTileModel(data)
      }

      return data
    } catch (e) {
      return {}
    }
  })
  // If auth is provided also get the user node info
  if (auth) {
    const userInfoList = await getUserNodeInfo({ ids, auth })
    const dataWithUserInfo = map(nodes, (node) => {
      const userInfo = find(userInfoList, n => n.id === node.id || n.id === node.nid)
      return { ...node, userInfo }
    })
    return dataWithUserInfo
  }
  return nodes
}
