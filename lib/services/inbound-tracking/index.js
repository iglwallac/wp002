/* eslint-disable no-param-reassign */
import { Promise as BluebirdPromise } from 'bluebird'
import {
  getLocalPreferences,
  setLocalPreferences,
} from 'services/local-preferences'
import { fromJS, List, Map } from 'immutable'
import _toString from 'lodash/toString'

const LOCAL_STORAGE_KEY = 'inboundTracking'
const INBOUND_TRACKING_QUERY_UTM_VARS = List([
  'utm_source',
  'utm_medium',
  'utm_term',
  'utm_campaign',
  'utm_content',
  'ch',
])
const INBOUND_TRACKING_CI_VARS = List(['ci_type', 'ci_id'])
const INBOUND_TRACKING_REFERRAL_ATTRIBUTION_ID = List(['rfd'])
const INBOUND_TRACKING_SCARAB_VARS = List(['sc_src', 'sc_llid'])
const INBOUND_TRACKING_QUERY_VARS = INBOUND_TRACKING_QUERY_UTM_VARS.concat(
  List(['cid', 'siteID', 'chan'])
    .concat(INBOUND_TRACKING_CI_VARS)
    .concat(INBOUND_TRACKING_REFERRAL_ATTRIBUTION_ID)
    .concat(INBOUND_TRACKING_SCARAB_VARS),
)

export function parseQuery (query, timestamp = new Date()) {
  return fromJS(query || {})
    .filter((v, k) => INBOUND_TRACKING_QUERY_VARS.includes(k))
    .withMutations((mutateQuery) => {
      if (containsUtm(mutateQuery)) {
        const utm = mutateQuery.filter((v, k) =>
          INBOUND_TRACKING_QUERY_UTM_VARS.includes(k),
        )
        const utmString = utm
          .reduce((reduction, v, k) => {
            reduction.push(`${k}=${encodeURIComponent(v)}`)
            return reduction
          }, [])
          .join('&')
        mutateQuery.set('strings', Map({ utm: utmString }))
      }
      if (containsSiteID(mutateQuery)) {
        mutateQuery.set(
          'linkshare',
          Map({ siteID: mutateQuery.get('siteID'), timestamp }),
        )
      }
      if (containsCI(mutateQuery)) {
        mutateQuery.update('ci_id', ciId => _toString(ciId))
      }
      if (mutateQuery.get('rfd')) {
        mutateQuery.set('source', 'REFERRAL')
        mutateQuery.set('sourceId', undefined)
      }
      return mutateQuery
    })
}

export function queryContainsTracking (query) {
  return Map(query || {}).some((v, k) =>
    INBOUND_TRACKING_QUERY_VARS.includes(k),
  )
}

// these utilities are demonstrated in ./inbound-tracking.unit.js
export function containsUtm (inboundTracking) {
  return inboundTracking.some((v, k) =>
    INBOUND_TRACKING_QUERY_UTM_VARS.includes(k),
  )
}

export function containsCI (inboundTracking) {
  return inboundTracking.some((v, k) => INBOUND_TRACKING_CI_VARS.includes(k))
}

export function containsSiteID (inboundTracking) {
  return inboundTracking.has('siteID')
}

export function containsChan (inboundTracking) {
  return inboundTracking.has('chan')
}

export function containsCid (inboundTracking) {
  return inboundTracking.has('cid')
}

export function set (options) {
  const { uid, data, auth } = options
  if (!data) {
    return BluebirdPromise.reject(new Error('Inbound tracking set requires a data option.'))
  }
  return get({ uid })
    .then((inboundTracking) => {
      inboundTracking = inboundTracking.merge(data)
      inboundTracking = inboundTracking.filter(k => k !== undefined)
      setLocalPreferences(uid, LOCAL_STORAGE_KEY, inboundTracking, auth)
      return inboundTracking
    })
    .catch(() => {
      return Map()
    })
}

export function get (options) {
  const { uid } = options
  return new BluebirdPromise(((resolve) => {
    const inboundTracking = getLocalPreferences(uid, LOCAL_STORAGE_KEY) || {}
    resolve(fromJS(inboundTracking))
  }))
}

export function purgeSessionTracking (options) {
  const { uid, auth } = options
  try {
    const inboundTracking = getLocalPreferences(uid, LOCAL_STORAGE_KEY) || {}
    delete inboundTracking.sc_src
    delete inboundTracking.sc_llid
    setLocalPreferences(uid, LOCAL_STORAGE_KEY, inboundTracking, auth)
    return inboundTracking
  } catch (err) {
    return Map()
  }
}
