import _merge from 'lodash/merge'
import {
  buildEventVideoPlayed,
  buildEventShelfExpanded,
  buildEventVideoVisited,
  buildEventSeriesVisited,
  buildEventPlaylistVideoAdded,
  buildEventVideoView,
  buildEventGiftVideoViewed,
  buildEventPageViewed,
  buildEventExperimentVariantDecided,
  buildEventExperimentData,
  buildEventUserInteraction,
  buildEventUserMenuItemClicked,
  buildCustomDataLayerEvent,
  buildEventVideoImpressed,
  buildEventSeriesImpressed,
  buildCheckoutStepDataLayerObject,
  buildEventEpisodeVisited,
  QUALIFIED,
} from './index'
import {
  TRACK_EVENT_DELAY_MS,
} from './middleware'

export const SET_DEFAULT_GA_EVENT = 'SET_DEFAULT_GA_EVENT'
export const SET_EVENT_VIDEO_PLAYED = 'SET_EVENT_VIDEO_PLAYED'
export const SET_EVENT_PAGE_CONTEXT_VIDEO_PLAYED = 'SET_EVENT_PAGE_CONTEXT_VIDEO_PLAYED'
export const SET_EVENT_SHELF_EXPANDED = 'SET_EVENT_SHELF_EXPANDED'
export const SET_EVENT_VIDEO_VISITED = 'SET_EVENT_VIDEO_VISITED'
export const SET_EVENT_EPISODE_VISITED = 'SET_EVENT_EPISODE_VISITED'
export const SET_EVENT_SERIES_VISITED = 'SET_EVENT_SERIES_VISITED'
export const SET_EVENT_VIDEO_VIEW_QUALIFIED = 'SET_EVENT_VIDEO_VIEW_QUALIFIED'
export const SET_EVENT_PLAYLIST_VIDEO_ADDED = 'SET_EVENT_PLAYLIST_VIDEO_ADDED'
export const SET_EVENT_GIFT_VIDEO_VIEWED = 'SET_EVENT_GIFT_VIDEO_VIEWED'
export const SET_EVENT_PAGE_VIEWED = 'SET_EVENT_PAGE_VIEWED'
export const SET_EVENT_EXPERIMENT_VARIANT_DECIDED =
  'SET_EVENT_EXPERIMENT_VARIANT_DECIDED'
export const SET_EVENT_EXPERIMENT_DATA = 'SET_EVENT_EXPERIMENT_DATA'
export const SET_EVENT_USER_INTERACTION = 'SET_EVENT_USER_INTERACTION'
export const SET_EVENT_LOGIN_FAILED = 'SET_EVENT_LOGIN_FAILED'
export const SET_EVENT_USER_MENU_ITEM_CLICKED = 'SET_EVENT_USER_MENU_ITEM_CLICKED'
export const SET_EVENT_ACCOUNT_CANCEL_OFFER_POPUP = 'SET_EVENT_ACCOUNT_CANCEL_OFFER_POPUP'
export const SET_EVENT_POPUP_MARKETING_PROMO = 'SET_EVENT_POPUP_MARKETING_PROMO'
export const SET_EVENT_VIDEO_IMPRESSED = 'SET_EVENT_VIDEO_IMPRESSED'
export const SET_EVENT_SERIES_IMPRESSED = 'SET_EVENT_SERIES_IMPRESSED'
export const SET_EVENT_PAYPAL_BUTTON_DISPLAYED = 'SET_EVENT_PAYPAL_BUTTON_DISPLAYED'
export const SET_EVENT_PAYPAL_BUTTON_CLICKED = 'SET_EVENT_PAYPAL_BUTTON_CLICKED'
export const SET_EVENT_MEMBERSHIP_BUTTON_CLICKED = 'SET_EVENT_MEMBERSHIP_BUTTON_CLICKED'
export const SET_EVENT_FOOTER_EMAIL_SUBMITTED = 'SET_EVENT_FOOTER_EMAIL_SUBMITTED'
export const SET_EVENT_CART_ABANDON_EMAIL_SUBMITTED = 'SET_EVENT_CART_ABANDON_EMAIL_SUBMITTED'
export const SET_EVENT_GIFT_VIDEO_EMAIL_SUBMITTED = 'SET_EVENT_GIFT_VIDEO_EMAIL_SUBMITTED'
export const SET_EVENT_CART_CHECKOUT_STEP = 'SET_EVENT_CART_CHECKOUT_STEP'
export const SET_EVENT_REFERRAL_LINK_COPY_BUTTON_CLICKED = 'SET_EVENT_REFERRAL_LINK_COPY_BUTTON_CLICKED'

export function setEventDataExperimentVariantDecided (options) {
  const event = buildEventExperimentVariantDecided(options)
  return {
    type: SET_EVENT_EXPERIMENT_VARIANT_DECIDED,
    payload: { event },
  }
}

export function setEventDataExperimentData (options) {
  const event = buildEventExperimentData(options)
  return {
    type: SET_EVENT_EXPERIMENT_DATA,
    payload: { event },
  }
}

export function setEventPageContextVideoPlayed (value) {
  return {
    type: SET_EVENT_PAGE_CONTEXT_VIDEO_PLAYED,
    payload: value,
  }
}

export function setEventDataVideoPlayed (options) {
  const event = buildEventVideoPlayed(options)
  return {
    type: SET_EVENT_VIDEO_PLAYED,
    payload: { event },
  }
}

export function setEventSeriesImpressed (options) {
  const { language } = options
  const event = buildEventSeriesImpressed(options)
  return {
    type: SET_EVENT_SERIES_IMPRESSED,
    payload: { event, language },
  }
}

export function setEventVideoImpressed (options) {
  const { auth, language } = options
  const event = buildEventVideoImpressed(options)
  return {
    type: SET_EVENT_VIDEO_IMPRESSED,
    payload: { auth, event, language },
  }
}

export function setEventShelfExpanded (options) {
  const event = buildEventShelfExpanded(options)
  return {
    type: SET_EVENT_SHELF_EXPANDED,
    payload: { event },
  }
}

export function setEventEpisodeVisited (options) {
  const event = buildEventEpisodeVisited(options)
  return {
    type: SET_EVENT_EPISODE_VISITED,
    payload: { event },
  }
}

export function setEventVideoVisited (options) {
  const event = buildEventVideoVisited(options)
  return {
    type: SET_EVENT_VIDEO_VISITED,
    payload: { event },
  }
}

export function setEventSeriesVisited (options) {
  const event = buildEventSeriesVisited(options)
  return {
    type: SET_EVENT_SERIES_VISITED,
    payload: { event },
  }
}

export function setEventDataVideoViewQualified (options) {
  const event = buildEventVideoView(options, QUALIFIED)
  return {
    type: SET_EVENT_VIDEO_VIEW_QUALIFIED,
    payload: { event },
  }
}


export function setEventPlaylistVideoAdded (options) {
  return function setEventPlaylistVideoAddedThunk (dispatch, getState) {
    const { resolver, auth, page, app } = getState()
    const { location } = resolver
    const params = _merge({}, options, { location, auth, page, app })
    const event = buildEventPlaylistVideoAdded(params)
    dispatch({
      type: SET_EVENT_PLAYLIST_VIDEO_ADDED,
      payload: { auth, event },
    })
  }
}

export function setEventGiftVideoViewed (options) {
  const { auth } = options
  const event = buildEventGiftVideoViewed(options)
  return {
    type: SET_EVENT_GIFT_VIDEO_VIEWED,
    payload: { auth, event },
  }
}

export function setEventPageViewed (options) {
  const { auth, location, page } = options
  const event = buildEventPageViewed(options)
  return {
    type: SET_EVENT_PAGE_VIEWED,
    payload: { auth, event, location, page },
  }
}

export function setEventPaypalButtonDisplayed (options) {
  const event = buildCustomDataLayerEvent(options)
  return {
    type: SET_EVENT_PAYPAL_BUTTON_DISPLAYED,
    payload: { event },
  }
}

export function setFooterEmailDataLayer (options) {
  const event = buildCustomDataLayerEvent(options)
  return {
    type: SET_EVENT_FOOTER_EMAIL_SUBMITTED,
    payload: { event },
  }
}

export function setCartAbandonEmailDataLayer (options) {
  const event = buildCustomDataLayerEvent(options)
  return {
    type: SET_EVENT_CART_ABANDON_EMAIL_SUBMITTED,
    payload: { event },
  }
}

export function setGiftVideoEmailDataLayer (options) {
  const event = buildCustomDataLayerEvent(options)
  return {
    type: SET_EVENT_GIFT_VIDEO_EMAIL_SUBMITTED,
    payload: { event },
  }
}

export function setEventStartMembershipClicked (options) {
  const event = buildCustomDataLayerEvent(options)
  return {
    type: SET_EVENT_MEMBERSHIP_BUTTON_CLICKED,
    payload: { event },
  }
}

export function setEventPaypalButtonClicked (options) {
  const event = buildCustomDataLayerEvent(options)
  return {
    type: SET_EVENT_PAYPAL_BUTTON_CLICKED,
    payload: { event },
  }
}

export function setEventUserInteraction (options) {
  return function setEventUserInteractionRedux (dispatch, getState) {
    const state = getState()
    const { app, auth, page, user } = state
    const language = user.getIn(['data', 'language'])
    const newOptions = _merge({}, options, { auth, app, page, language })
    dispatch(setEventUserInteractionBuilt(newOptions))
  }
}

function setEventUserInteractionBuilt (options) {
  const event = buildEventUserInteraction(options)
  return {
    type: SET_EVENT_USER_INTERACTION,
    payload: { event },
  }
}

export function setEventAccountCancelOfferPopup (options) {
  const event = buildCustomDataLayerEvent(options)
  return {
    type: SET_EVENT_ACCOUNT_CANCEL_OFFER_POPUP,
    payload: { event },
  }
}

export function setPopupMarketingPromo (options) {
  const event = buildCustomDataLayerEvent(options)
  return {
    type: SET_EVENT_POPUP_MARKETING_PROMO,
    payload: { event },
  }
}

export function setEventUserMenuClicked (options) {
  const {
    auth,
    delay = TRACK_EVENT_DELAY_MS,
  } = options
  const event = buildEventUserMenuItemClicked(options)
  return {
    type: SET_EVENT_USER_MENU_ITEM_CLICKED,
    payload: { auth, event },
    meta: {
      delay,
    },
  }
}

export function setEventCartCheckoutStep (options) {
  const event = buildCheckoutStepDataLayerObject(options)
  return {
    type: SET_EVENT_CART_CHECKOUT_STEP,
    payload: { event },
  }
}

export function setDefaultGaEvent (eventData) {
  return {
    type: SET_DEFAULT_GA_EVENT,
    payload: { eventData },
  }
}
