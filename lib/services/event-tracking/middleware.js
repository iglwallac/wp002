
import { Map, List } from 'immutable'
import {
  SET_AUTH_LOGIN_SUCCESS,
} from 'services/auth/actions'
import _get from 'lodash/get'
import {
  emarsysCustomerLogin,
  emarsysReload,
  emarsysView,
  emarsysTag,
  emarsysCategory,
  emarsysSendCartStart,
  emarsysSendCartPurchase,
  emarsysSendEmail,
} from 'services/emarsys'
import { SET_RESOLVER_LOCATION } from 'services/resolver/actions'
import { SET_CHECKOUT_USER_DATA, SET_CHECKOUT_ORDER_DATA } from 'services/checkout/actions'
import { CHANGE_USER_ACCOUNT_PLAN_TYPE_SET_DATA } from 'services/user-account/actions'
import { SET_EMAIL_SIGNUP_SUCCESS } from 'services/email-signup/actions'
import {
  SET_DETAIL_DATA,
} from 'services/detail/actions'
import {
  SET_DEFAULT_GA_EVENT,
  SET_EVENT_VIDEO_PLAYED,
  SET_EVENT_SHELF_EXPANDED,
  SET_EVENT_VIDEO_VISITED,
  SET_EVENT_SERIES_VISITED,
  SET_EVENT_PLAYLIST_VIDEO_ADDED,
  SET_EVENT_VIDEO_VIEW_QUALIFIED,
  SET_EVENT_GIFT_VIDEO_VIEWED,
  SET_EVENT_PAGE_VIEWED,
  SET_EVENT_EXPERIMENT_VARIANT_DECIDED,
  SET_EVENT_EXPERIMENT_DATA,
  SET_EVENT_USER_INTERACTION,
  SET_EVENT_USER_MENU_ITEM_CLICKED,
  SET_EVENT_ACCOUNT_CANCEL_OFFER_POPUP,
  SET_EVENT_POPUP_MARKETING_PROMO,
  SET_EVENT_PAYPAL_BUTTON_DISPLAYED,
  SET_EVENT_PAYPAL_BUTTON_CLICKED,
  SET_EVENT_MEMBERSHIP_BUTTON_CLICKED,
  SET_EVENT_FOOTER_EMAIL_SUBMITTED,
  SET_EVENT_CART_ABANDON_EMAIL_SUBMITTED,
  SET_EVENT_GIFT_VIDEO_EMAIL_SUBMITTED,
  SET_EVENT_CART_CHECKOUT_STEP,
  SET_EVENT_EPISODE_VISITED,
} from './actions'

export const TRACK_EVENT_DELAY_MS = 500
export const GA_PUSH_DELAY_MS = 750

function emarsysTagVideoQualifiedView (store) {
  const {
    inboundTracking = Map(),
    detail = Map(),
  } = store.getState()
  const scSrc = inboundTracking.getIn(['data', 'sc_src'])
  const scLid = inboundTracking.getIn(['data', 'sc_llid'])
  if (scSrc) {
    const campaignId = scSrc.substring(scSrc.lastIndexOf('_') + 1)
    if (campaignId) {
      const videoId = detail.getIn(['data', 'nid'])
      const timestamp = Date.now()
      let tag = `${campaignId}|${videoId}|${timestamp}`
      if (scLid) {
        const variantId = scLid
        tag = `${campaignId}-${variantId}|${videoId}|${timestamp}`
      }
      emarsysTag(tag)
    }
  }
}

function emarsysSendContentCategories (store, action) {
  const { data = {} } = action.payload
  const categories = []
  const adminCategory = _get(data, 'adminCategory.name')
  if (adminCategory) {
    categories.push(adminCategory)
  }
  const siteSegment = _get(data, 'siteSegment.name')
  if (siteSegment) {
    categories.push(siteSegment)
  }
  emarsysCategory(store, categories)
}

function emarsysSendCartStartData (store, action) {
  const { email } = action.payload
  const { plans = Map() } = store.getState()
  const selectedPlan = plans.get('selection')
  if (!Map.isMap(selectedPlan)) {
    return
  }
  const id = selectedPlan.get('id')
  const price = parseFloat(selectedPlan.getIn(['costs', 0], 0))
  const cartItems = [
    {
      item: id,
      quantity: 1,
      price,
    },
  ]

  emarsysSendCartStart(cartItems, email)
}

function emarsysSendCartPurchaseData (store, action) {
  const { billing, email } = action.payload
  const { plans } = store.getState()
  const selectedPlan = plans.get('selection')
  const id = selectedPlan.get('id')
  const price = parseFloat(selectedPlan.getIn(['costs', 0], 0))
  const purchase = {
    orderId: _get(billing, ['orderNumber']),
    items:
      [
        {
          item: id,
          quantity: 1,
          price,
        },
      ],
  }

  emarsysSendCartPurchase(purchase, email)
}

function emarsysSendChangePlanData (store, action) {
  const orderNumber = Map.isMap(action.payload) ? action.payload.get('orderNumber') : ''

  if (!orderNumber) {
    return
  }

  const { plans, user } = store.getState()
  const selectedPlanSku = plans.getIn(['changePlanData', 'selectedPlan'])
  const availablePlans = plans.getIn(['data', 'plans'], List())
  const fullSelectedPlan = availablePlans.find(plan => plan.get('sku') === selectedPlanSku) || Map()
  const id = fullSelectedPlan.get('id', '')
  const price = parseFloat(fullSelectedPlan.getIn(['costs', 0], 0))
  const email = user.getIn(['data', 'mail'], '') || user.getIn(['data', 'email'], '')
  const purchase = {
    orderId: orderNumber,
    items:
      [
        {
          item: id,
          quantity: 1,
          price,
        },
      ],
  }

  emarsysSendCartPurchase(purchase, email)
}

function emarsysSendEmailSignupData (action) {
  const { email, success } = action.payload
  if (success) {
    emarsysSendEmail(email)
  }
}

function pushEventButtonClicked (store, action) {
  const { eventData = Map() } = action.payload
  if (!eventData.isEmpty()) {
    setTimeout(() => {
      const { resolver, user, page } = store.getState()
      const userId = user.getIn(['data', 'uid'])
      const path = resolver.get('path')
      const pageTitle = `${page.get('title')} | Gaia`
      const loggedInStatus = userId ? 'Logged In' : false

      const data = eventData
        .set('path', path)
        .set('userId', userId)
        .set('loggedInStatus', loggedInStatus)
        .set('pageTitle', pageTitle)
      pushEventIntoDataLayer(data)
    }, GA_PUSH_DELAY_MS)
  }
}

function pushEventVideoVisited (store, action) {
  const { event } = action.payload || {}
  setTimeout(() => {
    const { detail = Map() } = store.getState()
    const eventData = Map({
      parentSeries: detail.hasIn(['data', 'seriesTitle']) ? detail.getIn(['data', 'seriesTitle']) : undefined,
      parentSeriesId: detail.hasIn(['data', 'seriesId']) ? detail.getIn(['data', 'seriesId']) : undefined,
    })
    const dataLayerEvent = event.mergeDeep(eventData)
    pushEventIntoDataLayer(dataLayerEvent)
  }, GA_PUSH_DELAY_MS)
}

function pushEventVideoPlay (store, action) {
  const { event } = action.payload || {}
  setTimeout(() => {
    const { video = Map() } = store.getState()
    const eventData = Map({
      parentSeries: video.hasIn(['data', 'seriesTitle']) ? video.getIn(['data', 'seriesTitle']) : undefined,
      parentSeriesId: video.hasIn(['data', 'seriesId']) ? video.getIn(['data', 'seriesId']) : undefined,
    })
    const dataLayerEvent = event.mergeDeep(eventData)
    pushEventIntoDataLayer(dataLayerEvent)
  }, GA_PUSH_DELAY_MS)
}

function pushEventPageViewed (store, action) {
  const { auth, event, location, page } = action.payload || {}
  setTimeout(() => {
    const {
      resolver = Map(),
      detail = Map(),
    } = store.getState()
    const contentType = resolver.getIn(['data', 'content_type'])
    const eventData = Map({
      pageURL: location.pathname + location.search || '',
      pageTitle: `${page.get('title')} | Gaia`,
      loggedInStatus: auth.get('jwt') ? 'Logged In' : false,
      memberStatus: auth.get('jwt') ? 'member' : 'anonymous',
      parentSeries: contentType === 'video' ? detail.getIn(['data', 'seriesTitle']) : undefined,
      parentSeriesId: contentType === 'video' ? detail.getIn(['data', 'seriesId']) : undefined,
    })
    const dataLayerEvent = event.mergeDeep(eventData)
    pushEventIntoDataLayer(dataLayerEvent)
  }, GA_PUSH_DELAY_MS)
}

function pushEventGiftVideoViewed (action) {
  const { auth, event } = action.payload || {}
  setTimeout(() => {
    const eventData = Map({
      loggedIn: auth.get('jwt') ? 'Logged In' : false,
    })
    const dataLayerEvent = event.mergeDeep(eventData)
    pushEventIntoDataLayer(dataLayerEvent)
  }, GA_PUSH_DELAY_MS)
}

function pushEventEnriched (action) {
  const { event } = action.payload || {}
  setTimeout(() => {
    const dataLayerEvent = Map({
      event: event.get('event'),
      eventCategory: event.get('eventCategory'),
      eventAction: event.get('eventAction'),
      eventLabel: event.get('eventLabel'),

    })
    pushEventIntoDataLayer(dataLayerEvent)
  }, GA_PUSH_DELAY_MS)
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { event, data } = action.payload || {}
      // dataLayer is special needs care
      switch (action.type) {
        case SET_DEFAULT_GA_EVENT:
          pushEventButtonClicked(store, action)
          break
        case SET_EVENT_VIDEO_VISITED:
        case SET_EVENT_EPISODE_VISITED:
          pushEventVideoVisited(store, action)
          break
        case SET_EVENT_VIDEO_PLAYED:
        case SET_EVENT_VIDEO_VIEW_QUALIFIED:
          pushEventVideoPlay(store, action)
          break
        case SET_EVENT_PAGE_VIEWED:
          pushEventPageViewed(store, action)
          break
        case SET_EVENT_GIFT_VIDEO_VIEWED:
          pushEventGiftVideoViewed(action)
          break
        case SET_EVENT_SHELF_EXPANDED:
        case SET_EVENT_SERIES_VISITED:
        case SET_EVENT_PLAYLIST_VIDEO_ADDED:
        case SET_EVENT_EXPERIMENT_VARIANT_DECIDED:
        case SET_EVENT_EXPERIMENT_DATA:
        case SET_EVENT_USER_INTERACTION:
        case SET_EVENT_USER_MENU_ITEM_CLICKED:
        case SET_EVENT_CART_CHECKOUT_STEP:
          setTimeout(() => {
            pushEventIntoDataLayer(event)
          }, GA_PUSH_DELAY_MS)
          break
        case SET_EVENT_ACCOUNT_CANCEL_OFFER_POPUP:
        case SET_EVENT_POPUP_MARKETING_PROMO:
        case SET_EVENT_PAYPAL_BUTTON_DISPLAYED:
        case SET_EVENT_PAYPAL_BUTTON_CLICKED:
        case SET_EVENT_MEMBERSHIP_BUTTON_CLICKED:
        case SET_EVENT_FOOTER_EMAIL_SUBMITTED:
        case SET_EVENT_CART_ABANDON_EMAIL_SUBMITTED:
        case SET_EVENT_GIFT_VIDEO_EMAIL_SUBMITTED:
          pushEventEnriched(action)
          break
        default:
          // Do nothing.
          break
      }

      // Tracking
      switch (action.type) {
        case SET_AUTH_LOGIN_SUCCESS:
          emarsysCustomerLogin(store)
          break
        case SET_RESOLVER_LOCATION:
          // Needed to reload Emarsys for Web Channel due to SPA
          emarsysReload()
          break
        case SET_EVENT_VIDEO_VIEW_QUALIFIED:
          emarsysTagVideoQualifiedView(store)
          break
        case SET_DETAIL_DATA:
          emarsysView(store, _get(data, 'id'), { send: false })
          emarsysSendContentCategories(store, action)
          break
        case SET_CHECKOUT_USER_DATA:
          setTimeout(() => {
            emarsysSendCartStartData(store, action)
          }, 500)
          break
        case SET_CHECKOUT_ORDER_DATA:
          setTimeout(() => {
            emarsysSendCartPurchaseData(store, action)
          }, 500)
          break
        case CHANGE_USER_ACCOUNT_PLAN_TYPE_SET_DATA:
          emarsysSendChangePlanData(store, action)
          break
        case SET_EMAIL_SIGNUP_SUCCESS:
          emarsysSendEmailSignupData(action)
          break
        default:
          // do nothing
          break
      }
    }
    next(action)
  }
}

/**
 * Push event to Google Tag Manager dataLayer object
 * @param {import('immutable').Map} event An immutable map
 */
function pushEventIntoDataLayer (event) {
  global.dataLayer.push(event.toJS())
}
