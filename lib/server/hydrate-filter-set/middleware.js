import _get from 'lodash/get'
import _includes from 'lodash/includes'
import { getSetLogger } from 'log'
import { getLogger as getLoggerServer } from 'log/server'
import {
  getReqResolver,
  getReqAuthUid,
  hydrateReq,
  getReqUserLanguage,
} from 'server/common'
import {
  RESOLVER_TYPE_SUBCATEGORY,
  RESOLVER_TYPE_CLASSIC_FACET,
} from 'services/resolver/types'
import { get, FILTER_SET_DEFAULT } from 'services/filter-set'
import { STORE_KEY_SUBCATEGORY } from 'services/store-keys'

const RESOLVER_VALID_TYPES = [
  RESOLVER_TYPE_SUBCATEGORY,
  RESOLVER_TYPE_CLASSIC_FACET,
]

function middleware () {
  return async function route (req, res, next) {
    const uid = getReqAuthUid(req)
    const log = getSetLogger(getLoggerServer(uid))
    const reqFilterSet = getReqFilterSet(req) || FILTER_SET_DEFAULT
    const resolver = getReqResolver(req)
    const resolverTypeValid = _includes(
      RESOLVER_VALID_TYPES,
      _get(resolver, ['data', 'type']),
    )
    const language = getReqUserLanguage(req)

    if (!resolverTypeValid) {
      next()
      return
    }
    try {
      const filterSet = await get({ filterSet: reqFilterSet, language })
      log.info(`Completed Hydrating Filter Set ${reqFilterSet}`)
      const data = {}
      data[reqFilterSet] = filterSet
      hydrateReq(req, { filterSet: data })
    } catch (e) {
      log.error(e, `Failed Hydrating Filter Set ${reqFilterSet}`)
    }
    next()
  }
}

function getReqFilterSet (req) {
  const filterSet = _get(req, ['query', 'filter-set'])
  return (
    filterSet ||
    _get(req, [
      'hydrate',
      'jumbotron',
      STORE_KEY_SUBCATEGORY,
      'data',
      'filterSet',
    ]) ||
    _get(req, ['hydrate', 'resolver', 'data', 'filterSet'])
  )
}

export default middleware
