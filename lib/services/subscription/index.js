import _get from 'lodash/get'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _size from 'lodash/size'
import _gt from 'lodash/gt'
import { post as apiPost,
  TYPE_BROOKLYN_JSON,
} from 'api-client'
import { log as logError } from 'log/error'
import { List } from 'immutable'
import { get as getServerTime } from 'services/server-time'
import { LIVE_ACCESS_SUBSCRIPTION_CODE } from 'services/live-access-events/constants'

export async function compUserSubscription (options) {
  // apiPost(url, data, options, clientType, client)
  const { auth } = options

  /**
   * /billing/comp returns data in this structure:
    {
      days:     int
      period:   string
      reason:   string
      start:    date string
      success:  boolean
      uuid:     string uuid
    }
  */
  try {
    const res = await apiPost('v1/user/subscription/comp', null, { auth }, TYPE_BROOKLYN_JSON)
    if (res.status >= 200 && res.status <= 299) {
      return {
        success: res.body.success || false,
        processing: false,
        compId: res.body.uuid || '',
      }
    }
    try {
      const bodyString = JSON.stringify(res.body)
      logError('Subscription compUserSubscription received a non 200 level repsonse.', bodyString)
    } catch (e) {
      logError('Subscription compUserSubscription could not stringify response body.')
    }
    const body = _get(res, 'body', {})
    return handleCompError(body)
  } catch (e) {
    return handleCompError({})
  }
}

const SCHEMA_COMP_ERROR = {
  success: false,
  errors: null,
}

function handleCompError (body) {
  const errors = _get(body, 'errors', {})
  return _assign(_cloneDeep(SCHEMA_COMP_ERROR), {
    errors,
  })
}

export const SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE = 'free'
export const SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH = 'onlyWith'

export function hasLiveAccessEntitlement (subscriptions) {
  return isEntitled(subscriptions) && subscriptions.includes(LIVE_ACCESS_SUBSCRIPTION_CODE)
}

export function isEntitled (subscriptions) {
  return subscriptions.size > 0
}

export async function getUserEntitled (idExpires, subscriptions) {
  try {
    const serverTime = await getServerTime()
    const entitled = _gt(idExpires, serverTime.serverTime) && _gt(_size(subscriptions), 0)

    return entitled
  } catch (e) {
    return false
  }
}

export function isFeatureAllowedWithSubscription (feature, auth) {
  const availability = feature.getIn(['offerings', 'availability'], null)
  const subscriptions = feature.getIn(['offerings', 'subscriptions'], List())
  const userSubscriptions = auth.get('subscriptions', List())

  if (availability === SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH) {
    return subscriptions.some(v => userSubscriptions.includes(v))
  }
  return featureIsFree(availability)
}

export function featureIsFree (availability) {
  return availability === SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE
}
