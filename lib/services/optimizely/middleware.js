import _get from 'lodash/get'
import _isNil from 'lodash/isNil'
import { Map, List, fromJS } from 'immutable'
import { containsUtm } from 'services/inbound-tracking'
import { SET_AUTH_DATA } from 'services/auth/actions'
import { SET_PLANS_SELECTION } from 'services/plans/actions'
import { SET_EVENT_PAGE_VIEWED } from 'services/event-tracking/actions'
import { SET_INBOUND_TRACKING_DATA_INITIALIZED } from 'services/inbound-tracking/actions'
import {
  SET_USER_DATA_LANGUAGE_PRIMARY,
  SET_USER_DATA_LANGUAGE,
} from 'services/user/actions'

import {
  addUserAttributes,
  reactivatePage,
  triggerEvent,
  addListener,
} from 'services/optimizely'

import {
  setOptimizelyExperimentDecision,
  setOptimizelyActivePage,
  setOptimizelyUserAttributes,
  setOptimizelyEvent,
  NO_PAGE_NAME_FOUND,
} from 'services/optimizely/actions'

/**
 * Add the current location pathname to the optimizely.page store entry and send optimizely the
 * active page pathname.
 * Optimizely page names are as followed: /seeking-truth/metaphysics ->
 *  web_app__seeking_truth_metaphysics
 * @param {object} store - redux store
 * @param {object} action - redux action
 */

function setPageViewed (store, action) {
  let path = ''
  let pageName = ''

  if (_isNil(action)) {
    const state = store.getState()
    const page = _get(state, 'page', Map())
    path = page.get('path', NO_PAGE_NAME_FOUND)
  } else {
    path = _get(action, ['payload', 'location', 'pathname'], NO_PAGE_NAME_FOUND)
  }

  path = path.replace(/^\//, '')
  pageName = (`web_app__${path.replace(/(\/|-)/g, '_') || 'home'}`
  ).toLowerCase()

  store.dispatch(setOptimizelyActivePage(pageName))
  reactivatePage(pageName)
}

/**
 * Add the current inbound tracking values to optimizely.attributes store entry
 * and send optimizely the new attributes
 * @param {object} store - redux store
 * @param {object} action - redux action
 */

function setInboundTrackingAttributes (store, action) {
  let data
  let dataContainsUtm = false

  if (_isNil(action)) {
    const state = store.getState()
    data = _get(state, 'inboundTracking', Map())
  } else {
    data = _get(action, ['payload', 'data'], Map())
  }

  dataContainsUtm = containsUtm(data)
  addAttributes(store, {
    web_app__tracked: dataContainsUtm ? 'true' : 'false',
    web_app__not_tracked: dataContainsUtm ? 'false' : 'true',
  })
}

/**
 * Add the current user language to optimizely.attributes store entry and send
 * optimizely the new language attribute
 * @param {object} store - redux store
 * @param {object=} action - redux action or nil. If nil the language is pulled
 *  from the user.data.language store entry instead of the action
 */

function setUserLanguageAttribute (store, action) {
  let language

  // if we intentionally do not provide an actions, pull the language from the store
  // used to set the language attribute initially, without user interaction

  if (_isNil(action)) {
    const state = store.getState()
    const user = _get(state, 'user', Map())
    language = user.getIn(['data', 'language'], List())
  } else {
    // if we have an action, we're dealing with a user triggered event for setting language
    language = _get(action, ['payload', 'value'], null)
  }

  if (List.isList(language)) {
    language = language.first()
  }
  addAttributes(store, { web_app__language: language })
}

/**
 * Dispatch setOptimizelyUserAttributes action as well as send attributes to optimizely
 * @param {object} store - redux store
 * @param {object} attributes - name/value pair attributes to be sent
 */

function addAttributes (store, attributes) {
  store.dispatch(setOptimizelyUserAttributes(Map(attributes)))
  addUserAttributes(attributes)
}

/**
 * Dispatch setOptimizelyEvent action as well as send event to optimizely
 * @param {object} store - redux store
 * @param {string} eventType - an event type or key
 * @param {object} tags - an object containing event data
 */

function addEvent (store, eventType, tags) {
  store.dispatch(setOptimizelyEvent(eventType, Map(tags)))
  triggerEvent(eventType, tags)
}

/**
 * Add the current auth uid to optimizely.attributes store entry and send
 * optimizely the uid value (if any)
 * @param {object} store - redux store
 * @param {object} action - redux action
 */

function setUserAuth (store, action) {
  let uid

  if (_isNil(action)) {
    const state = store.getState()
    const { auth = Map() } = state
    uid = auth.get('uid')
  } else {
    uid = _get(action, ['payload', 'data', 'uid'])
  }
  addAttributes(store, { web_app__user_is_member: uid ? '1' : '0' })
}

/**
 * Trigger a pricing event for plan selection using the price and sku data points
 * @param {object} store - redux store
 * @param {object} action - redux action
 */

function setPlansSelection (store, action) {
  const data = _get(action, ['payload', 'data'])
  const sku = fromJS(data).get('sku', '')
  const planEvent = `web_app__plan_selected_${sku.replace(/\s/g, '_')}`
  addEvent(store, planEvent, {})
}

function createDecisionManager (store) {
  addListener((e) => {
    const eventName = _get(e, 'name')
    const decision = _get(e, ['data', 'decision'], {})

    if (
      eventName === 'campaignDecided' &&
      _get(decision, 'experimentId', null)
    ) {
      store.dispatch(setOptimizelyExperimentDecision(decision))
    }
  })
}

/**
 * Middleware function used by redux, triggerd on each redux type event
 * @param {object} store - redux store object containing getStore and dispatch methods
 */

export default function middleware (store) {
  return (next) => {
    if (process.env.BROWSER) {
      createDecisionManager(store)
      setUserLanguageAttribute(store)
      setUserAuth(store)
    }

    return (action) => {
      const type = _get(action, 'type')

      if (process.env.BROWSER) {
        switch (type) {
          case SET_AUTH_DATA:
            setUserAuth(store, action)
            setPageViewed(store)
            break
          case SET_PLANS_SELECTION:
            setPlansSelection(store, action)
            break
          case SET_EVENT_PAGE_VIEWED:
            setPageViewed(store, action)
            break
          case SET_INBOUND_TRACKING_DATA_INITIALIZED:
            setInboundTrackingAttributes(store, action)
            setPageViewed(store)
            break
          case SET_USER_DATA_LANGUAGE_PRIMARY:
          case SET_USER_DATA_LANGUAGE:
            setUserLanguageAttribute(store, action)
            setPageViewed(store)
            break

          default:
            break
        }
      }
      next(action)
    }
  }
}
