import _get from 'lodash/get'
import _set from 'lodash/set'
import { fromJS, Map, List } from 'immutable'
import { TYPE_CONTENT_SERIES, TYPE_CONTENT_VIDEO } from 'services/content-type'
import { setDefaultGaEvent } from 'services/event-tracking/actions'

export const YOGA_HOME_ARTICLE_CLICKED = 'Yoga home article clicked'
export const YOGA_HOME_TEACHER_CLICKED = 'Yoga home teacher clicked'
export const YOGA_HOME_PILL_CLICKED = 'Yoga home pill clicked'
export const ROW_SCROLL_ARROW_CLICKED = 'Row scroll arrow clicked'
export const YOGA_HOME_LINK_CLICKED = 'Yoga home link clicked'
export const SET_EVENT_LEFT_ARROW_CLICKED = 'Left arrow clicked'
export const SET_EVENT_RIGHT_ARROW_CLICKED = 'Right arrow clicked'
export const AUTOCOMPLETE_SUGGESTION_CLICKED =
  'Autocomplete suggestion clicked'
export const SHARE_MODAL_OPENED = 'Share modal opened'
export const GLOBAL_LOGIN_MODAL_EVENT_CATEGORY = 'Global Login Modal'
export const EVENT_CATEGORY_PROFILE_SELECTOR = 'ProfileSelector'
export const EVENT_VALUE_FOCUSED = 'focused'
export const EVENT_VALUE_INVALID = 'invalid'
export const EVENT_VALUE_IN_USE = 'in_use'
export const EVENT_VALUE_RESET = 'reset'
export const EVENT_VALUE_SHOW = 'show'
export const EVENT_VALUE_HIDE = 'hide'
export const EVENT_VALUE_CLICKED = 'clicked'
export const EVENT_VALUE_CHECKED = 'checked'
export const EVENT_VALUE_UNCHECKED = 'unchecked'
export const EVENT_VALUE_DISABLED = 'disabled'
export const EVENT_VALUE_ENABLED = 'enabled'
export const EVENT_VALUE_SELECTED = 'selected'
export const EVENT_VALUE_CLOSED = 'closed'
export const EVENT_VALUE_FAILED = 'failed'
export const VIEW_WATCH_HISTORY_CLICKED = 'view all watch history clicked'
export const IN_PROGRESS_CLICKED = 'in progress clicked'
export const FINISHED_CLICKED = 'finished clicked'
export const NEW_VIDEOS_CLICKED = 'view all new videos clicked'
export const VIEW_ALL_PLAYLIST_CLICKED = 'view all playlist clicked'
export const VIDEO_VIEW = 'Video View'
export const QUALIFIED = 'Qualified'

export const LOAD_MORE = 'load more clicked'
export const SHELF_EXPANDED = 'shelf expanded'
export const FILTERTAB_CLICKED = 'FilterTab Clicked'
export const IN_PROGRESS_TAB_CLICKED = 'in progress tab clicked'
export const FINISHED_TAB_CLICKED = 'finished tab clicked'
export const HOVER_ROW_SCROLLED = 'hover row scrolled'
export const TOPIC_TAB_CLICKED = 'topic tab clicked'
export const TOPIC_SECTION_SCROLLED = 'topic section scrolled'
export const VIEW_ALL_TOPICS_CLICKED = 'view all topics clicked'
export const VIEW_ALL_SERIES_CLICKED = 'view all series clicked'
export const VIEW_ALL_RECENTLY_ADDED_CLICKED =
  'view all recently added clicked'
export const SERIES_CLICK = 'Series Click'
export const TITLE_CLICK = 'Title Click'
export const PLAYLIST_ADD = 'Playlist Add'
export const PLAY_EVENT = 'Play Event'
export const EVENT_ACTION_SPOTLIGHT_EXPANDED = 'expanded'
export const EVENT_ACTION_SPOTLIGHT_MINIMIZED = 'minimized'
export const EVENT_ACTION_SELECT = 'select'
export const EVENT_ACTION_DESELECT = 'deselect'
export const EVENT_ACTION_FAVORITE = 'favorite'
export const EVENT_ACTION_UNFAVORITE = 'unfavorite'

export const EVENT_LABEL_LETS_GO = "Let's Go"
export const EVENT_LABEL_SKIP = 'skip & start watching'
export const EVENT_LABEL_INTERESTS = 'Interests'

export const NOTIFICATIONS = 'Notifications'
export const NOTIFICATIONS_BELL_EVENT = 'notifications bell clicked'
export const NOTIFICATIONS_ITEM_EVENT = 'notification clicked'
export const NOTIFICATIONS_VIEW_ALL_EVENT = 'notifications view all clicked'
export const NOTIFICATIONS_WATCH_NOW_EVENT = 'notifications watch now clicked'
export const NOTIFICATIONS_MANAGE_EVENT = 'notifications manage clicked'
export const NOTIFICATIONS_FOLLOW_CLICKED = 'notifications follow clicked'
export const NOTIFICATIONS_UNFOLLOW_CLICKED = 'notifications unfollow clicked'
export const NOTIFICATIONS_IMPRESSED = 'notifications impressed'
export const NOTIFICATIONS_RECOMMENDED = 'notification of recommendation'
export const NOTIFICATIONS_NEW_CONTENT = 'notification of episode'
export const CLICK_ACTION = 'Click'
export const CUSTOM_EVENT = 'customEvent'
export const MERCH_EVENT = 'merchandiseEvent'
export const NAVIGATION_GEAR_EVENT = 'navigation gear'
export const MERCH_CAMPAIGN = 'Merchandising Campaign'
const IMPRESSION_ACTION = 'Impression'
const CLOSE_ACTION = 'Close'
export const HIDE_ACTION = 'Hide'
export const UNHIDE_ACTION = 'Unhide'
const CATEGORY_CUSTOM_ROW = 'Custom Row'
const CATEGORY_HIDDEN_CONTENT = 'Content Hidden'
const CATEGORY_SPOTLIGHT_TOGGLE = 'Spotlight Toggle'
const CATEGORY_TOOLTIP_IMPRESSION = 'Experiment - Tooltip'
const CATEGORY_TOOLTIP_CLOSE = 'Tooltip'
const CATEGORY_ENDSTATE_AUTOPLAY = 'Endstate Autoplay'
const CATEGORY_VIDEOINFO = 'Video Player Info'
const CATEGORY_NOTIFICATIONS_SETTINGS = 'settings'
const TOGGLED = 'Toggled'
const CATEGORY_CUSTOM_SPOTLIGHT = 'Custom Spotlight'
const CATEGORY_ONBOARDING_14 = 'Onboarding 1.4'
const CATEGORY_SETTINGS_AND_PREFERENCES = 'Settings & preferences'

const REMOVED_ROWS_SETTINGS_EVENT_CATEGORY = 'Custom Row'
export const REMOVED_ROWS_SETTINGS_ACTION_REMOVED = 'removed'
export const REMOVED_ROWS_SETTINGS_ACTION_REVERTED = 'reverted'

const EMAIL_OPT_IN_SETTINGS_EVENT_CATEGORY = 'settings'
export const EMAIL_OPT_IN_SETTINGS_ON = 'on'
export const EMAIL_OPT_IN_SETTINGS_OFF = 'off'
export const EMAIL_OPT_IN_SETTINGS_ACTION_TOGGLED = 'email opt-in'

const SITE_LANGUAGE_SETTINGS_EVENT_CATEGORY = 'settings'
export const SITE_LANGUAGE_SETTINGS_ACTION_SAVE = 'site language'
export const SITE_LANGUAGE_SETTINGS_ACTION_CANCEL = 'cancel'

const CONTENT_LANGUAGE_SETTINGS_EVENT_CATEGORY = 'settings'
export const CONTENT_LANGUAGE_SETTINGS_ACTION_SAVE = 'content language'
export const CONTENT_LANGUAGE_SETTINGS_ACTION_CANCEL = 'cancel'

export const BELL_EVENT_DATA = Map({
  event: CUSTOM_EVENT,
  eventName: NOTIFICATIONS_BELL_EVENT,
  eventCategory: NOTIFICATIONS,
  eventAction: CLICK_ACTION,
})
export const VIEW_ALL_EVENT_DATA = Map({
  event: CUSTOM_EVENT,
  eventName: NOTIFICATIONS_VIEW_ALL_EVENT,
  eventCategory: NOTIFICATIONS,
  eventAction: CLICK_ACTION,
})
export const WATCH_NOW_EVENT_DATA = Map({
  event: CUSTOM_EVENT,
  eventName: NOTIFICATIONS_WATCH_NOW_EVENT,
  eventCategory: NOTIFICATIONS,
  eventAction: CLICK_ACTION,
})
export const MANAGE_EVENT_DATA = Map({
  event: CUSTOM_EVENT,
  eventName: NOTIFICATIONS_MANAGE_EVENT,
  eventCategory: NOTIFICATIONS,
  eventAction: CLICK_ACTION,
})
export const ITEM_DATA = Map({
  event: CUSTOM_EVENT,
  eventName: NOTIFICATIONS_ITEM_EVENT,
  eventCategory: NOTIFICATIONS,
  eventAction: CLICK_ACTION,
})

export const MERCHANDISING_IMPRESSION_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: MERCH_CAMPAIGN,
  eventAction: 'Impression',
  nonInteraction: 'True',
})

export const NAVIGATION_GEAR_CLICK_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: NAVIGATION_GEAR_EVENT,
  eventAction: CLICK_ACTION,
  eventLabel: 'gear icon',
})

export const MERCHANDISING_CLICK_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: MERCH_CAMPAIGN,
  nonInteraction: 'false',
})

export const SPOTLIGHT_TOGGLE_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_SPOTLIGHT_TOGGLE,
  eventAction: TOGGLED,
})

export const NOTIFICATIONS_RECOMMENDED_TOGGLE_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_NOTIFICATIONS_SETTINGS,
  eventAction: NOTIFICATIONS_RECOMMENDED,
})

export const NOTIFICATIONS_NEW_CONTENT_TOGGLE_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_NOTIFICATIONS_SETTINGS,
  eventAction: NOTIFICATIONS_NEW_CONTENT,
})

export const HIDDEN_CONTENT_HIDE_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_HIDDEN_CONTENT,
  eventAction: HIDE_ACTION,
})

export const HIDDEN_CONTENT_UNHIDE_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_HIDDEN_CONTENT,
  eventAction: UNHIDE_ACTION,
})

export const CUSTOM_ROW_CLICK_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_CUSTOM_ROW,
  nonInteraction: 'False',
  impressionClicks: 1,
})

export const CUSTOM_ROW_IMPRESSION_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_CUSTOM_ROW,
  eventAction: 'Impression',
  nonInteraction: 'True',
})

export const CUSTOM_ROW_REMOVED_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_CUSTOM_ROW,
  eventAction: 'Removed',
})

export const CUSTOM_ROW_REVERTED_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_CUSTOM_ROW,
  eventAction: 'Reverted',
})

export const TOOLTIP_IMPRESSION_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_TOOLTIP_IMPRESSION,
  eventAction: IMPRESSION_ACTION,
  nonInteraction: 'True',
})

export const TOOLTIP_CLOSE_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_TOOLTIP_CLOSE,
  eventAction: CLOSE_ACTION,
  nonInteraction: 'false',
})

export const HIDE_WATCHED_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: 'Watch History',
  eventAction: 'Removed',
  nonInteraction: 'false',
})

export const ENDSTATE_AUTOPLAY_TOGGLED = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_ENDSTATE_AUTOPLAY,
  eventAction: TOGGLED,
  nonInteraction: 'false',
})

export const VIDEOINFO_TOGGLED = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_VIDEOINFO,
  eventAction: TOGGLED,
  nonInteraction: 'false',
})

export const SPOTLIGHT_AD_IMPRESSION_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_CUSTOM_SPOTLIGHT,
  eventAction: IMPRESSION_ACTION,
  eventLabel: 'Testarossa Variation Name',
  nonInteraction: 'True',
})

export const SPOTLIGHT_AD_CLICK_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_CUSTOM_SPOTLIGHT,
  eventAction: CLICK_ACTION,
  eventLabel: 'Testarossa Variation Name',
  nonInteraction: 'false',
})

export const ONBOARDING_CLICK_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_ONBOARDING_14,
  eventAction: CLICK_ACTION,
})

export const ONBOARDING_SELECT_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_ONBOARDING_14,
  eventAction: EVENT_ACTION_SELECT,
})

export const ONBOARDING_FAVORITE_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_ONBOARDING_14,
  eventAction: EVENT_ACTION_FAVORITE,
})

export const SETTINGS_AND_PREFERENCES_EVENT = fromJS({
  event: MERCH_EVENT,
  eventCategory: CATEGORY_SETTINGS_AND_PREFERENCES,
  eventAction: CLICK_ACTION,
})

export const EVENT_DEFAULT_VALUES = fromJS({
  properties: {},
})

export function handleMerchImpressionEvents (dispatch, data, impression) {
  const payloadType = _get(data, 'data.payloadType')

  if (payloadType === 'merchandising-content') {
    const campaignId = _get(data, 'data.payload.id')
    const campaignName = _get(data, 'data.payload.slug')
    const placement = _get(data, 'placementName')
    const language = _get(data, 'language')
    const contentId = _get(data, 'data.payload.contentItems.0.contentId')
    const contentType = _get(data, 'data.payload.contentItems.0.contentType')
    const eventLabel = `${campaignName} | ${campaignId} | ${language} | ${placement}`
    const event = impression ? MERCHANDISING_IMPRESSION_EVENT : 'click'

    const eventData = event
      .set('eventLabel', eventLabel)
      .set('contentId', contentId)
      .set('contentType', contentType)

    dispatch(setDefaultGaEvent(eventData))
  }
}

export function buildRemovedRowsSettingsObject (eventLabel, eventAction) {
  return fromJS({
    event: MERCH_EVENT,
    eventCategory: REMOVED_ROWS_SETTINGS_EVENT_CATEGORY,
    eventAction,
    eventLabel,
  })
}

export function buildEmailOptInSettingsObject (eventLabel) {
  return fromJS({
    event: MERCH_EVENT,
    eventCategory: EMAIL_OPT_IN_SETTINGS_EVENT_CATEGORY,
    eventAction: EMAIL_OPT_IN_SETTINGS_ACTION_TOGGLED,
    eventLabel,
  })
}

export function buildSiteLanguageSettingsObject (eventLabel, eventAction) {
  return fromJS({
    event: MERCH_EVENT,
    eventCategory: SITE_LANGUAGE_SETTINGS_EVENT_CATEGORY,
    eventAction,
    eventLabel,
  })
}

export function buildContentLanguageSettingsObject (
  eventLabel,
  eventAction,
  eventValue,
) {
  return fromJS({
    event: MERCH_EVENT,
    eventCategory: CONTENT_LANGUAGE_SETTINGS_EVENT_CATEGORY,
    eventAction,
    eventLabel,
    eventValue,
  })
}

export function buildCustomDataLayerEvent (data) {
  const { eventCategory, eventAction, eventLabel, event } = data
  const newEvent = Map({
    event,
    eventCategory,
    eventAction,
    eventLabel,
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildEmailDataLayerObject (option) {
  return {
    event: 'customEvent',
    eventCategory: 'email collection',
    eventAction: 'email submitted',
    eventLabel: option,
  }
}

export function buildCheckoutStepDataLayerObject (options) {
  const { step, selection } = options
  const id = selection ? selection.get('sku') : ''
  const price = selection ? selection.get('firstPayment') : ''
  const name = selection ? selection.get('heading') : ''
  const brand = selection ? '(not set)' : ''
  const category = selection ? 'plans' : ''
  const quantity = 1
  const product = {
    name,
    id,
    price,
    category,
    brand,
  }

  // If there is a selection in the cart, set the quantity
  if (selection) {
    _set(product, 'quantity', quantity)
  }

  return Map({
    event: 'checkout',
    ecommerce: {
      checkout: {
        actionField: {
          step,
        },
        products: [product],
      },
    },
  })
}

export function sentAtDate (date = new Date()) {
  return date.toISOString()
}

export function buildEventVideoPlayed (data) {
  const { video, media, upstreamContext, videoAnalyticsId } = data
  const newEvent = Map({
    event: 'Video Played',
    videoId: video.get('id', -1),
    mediaId: media.get('id', -1),
    videoAnalyticsId,
  })

  const event = createDefaultEvent(data)
    .mergeDeep(createCustomContextProperties(upstreamContext))
    .mergeDeep(newEvent)
  return event
}

function removeDestId (upstreamContext) {
  let newUpstreamContext = upstreamContext
  if (upstreamContext && upstreamContext.has('destId')) {
    newUpstreamContext = upstreamContext.delete('destId')
  }
  return newUpstreamContext
}

function cleanContext (upstreamContext) {
  return upstreamContext.filter(item => item !== null)
}

export function buildEventVideoImpressed (data) {
  const newEvent = Map({
    event: 'Video Impressed',
  })
  const { upstreamContext } = data
  let newUpstreamContext = removeDestId(upstreamContext)
  newUpstreamContext = cleanContext(upstreamContext)
  return createDefaultEvent(data)
    .mergeDeep(createCustomContextProperties(newUpstreamContext))
    .mergeDeep(newEvent)
}

export function buildEventSeriesImpressed (data) {
  const newEvent = Map({
    event: 'Series Impressed',
  })
  const { upstreamContext } = data
  let newUpstreamContext = removeDestId(upstreamContext)
  newUpstreamContext = cleanContext(upstreamContext)
  return createDefaultEvent(data)
    .mergeDeep(createCustomContextProperties(newUpstreamContext))
    .mergeDeep(newEvent)
}

export function buildEventShelfExpanded (data) {
  const { shelf, upstreamContext } = data
  const newEvent = Map({
    event: 'Shelf Expanded',
    contentType: shelf.get('type'),
    contentId: shelf.get('id'),
  })
  return createDefaultEvent(data)
    .mergeDeep(createCustomContextProperties(upstreamContext))
    .mergeDeep(newEvent)
}

export function buildEventVideoVisited (data) {
  const { id } = data
  const newEvent = Map({
    event: 'Video Visited',
    videoId: id,
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildEventEpisodeVisited (data) {
  const { id } = data
  const newEvent = Map({
    event: 'Episode Visited',
    videoId: id,
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildEventSeriesVisited (data) {
  const { id } = data
  const newEvent = Map({
    event: 'Series Visited',
    seriesId: id,
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildEventVideoView (data, status) {
  const { video, media } = data
  const newEvent = Map({
    event: `${VIDEO_VIEW} ${status}`,
    videoId: video.get('id', -1),
    mediaId: media.get('id', -1),
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildEventPlaylistVideoAdded (data) {
  const { id, upstreamContext } = data
  const newEvent = Map({
    event: 'Playlist Video Added',
    videoId: id,
  })

  return createDefaultEvent(data)
    .mergeDeep(createCustomContextProperties(upstreamContext))
    .mergeDeep(newEvent)
}

export function buildEventGiftVideoViewed (data) {
  const { siteSegment } = data
  const newEvent = fromJS({
    event: 'Gift Video Viewed',
    siteSegment: {
      id: siteSegment.get('id'),
      name: siteSegment.get('name'),
    },
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildEventPageViewed (data) {
  const { upstreamContext, gaiaScreen } = data
  const newEvent = Map({
    event: 'Page Viewed',
  })

  return createDefaultEvent(data)
    .mergeDeep(createCustomContextProperties(upstreamContext))
    .mergeDeep(createGaiaScreenProperties(gaiaScreen))
    .mergeDeep(newEvent)
}

export function buildEventExperimentVariantDecided (data) {
  const newEvent = Map({
    event: 'Experiment Variant Decided',
    experiment: _get(data, 'experiment'),
    variant: _get(data, 'variant'),
    tags: _get(data, 'tags', null),
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildEventExperimentData (data) {
  const newEvent = Map({
    event: 'Experiment Data',
    experiment: _get(data, 'experiment'),
    variant: _get(data, 'variant'),
    tags: _get(data, 'tags', null),
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildEventUserMenuItemClicked (data) {
  const newEvent = Map({
    event: 'User Menu Item Clicked',
    navItem: _get(data, 'navItem'),
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildEventUserInteraction (data) {
  const newEvent = Map({
    event: 'User Interaction',
    eventCategory: _get(data, 'category'),
    eventAction: _get(data, 'action'),
    eventLabel: _get(data, 'label', null),
    eventValue: _get(data, 'value', null),
  })
  return createDefaultEvent(data).mergeDeep(newEvent)
}

export function buildPictureInPictureToggled (data) {
  const { upstreamContext } = data
  const newEvent = Map({
    event: 'Picture In Picture Toggled',
  })
  return createDefaultEvent(data)
    .mergeDeep(createCustomContextProperties(upstreamContext))
    .mergeDeep(newEvent)
}

export function createDefaultEvent (data) {
  const {
    auth,
    page = Map(),
    location,
    windowLocation = global.location,
    date,
    app = Map(),
    language = List(),
  } = data

  const userId = auth ? auth.get('uid', 0) : -1

  const newEvent = fromJS({
    timestamp: sentAtDate(date),
    userId,
    context: {
      app: {
        name: app.get('name'),
        version: app.get('version'),
      },
      page: {
        hash: _get(location, 'hash'),
        path: _get(location, 'pathname'),
        search: _get(location, 'search'),
        title: page.get('title'),
        url: _get(windowLocation, 'href', null),
      },
      traits: {
        preferredLanguages: language.toJS(),
      },
    },
  })
  return EVENT_DEFAULT_VALUES.mergeDeep(newEvent)
}

/**
 * Creates an event properties node for tracking events
 * @param  {Immutable.Map} data   map of single-level event properties
 * @return {Immutable.Map}        event-final structured properties
 */
export function createCustomContextProperties (data = Map()) {
  if (data.size > 0) {
    let contentType = data.get('contentType')
    let contentId = data.get('contentId')
    if (data.has('videoId')) {
      contentType = TYPE_CONTENT_VIDEO
      contentId = data.get('videoId')
    } else if (data.has('seriesId')) {
      contentType = TYPE_CONTENT_SERIES
      contentId = data.get('seriesId')
    }
    let properties = fromJS({
      properties: {
        contentType,
        contentId,
        gaiaContext: data,
      },
    })
    if (data.has('videoSpeed')) {
      properties = properties.setIn(
        ['properties', 'videoSpeed'],
        data.get('videoSpeed'),
      )
    }
    if (data.has('isPictureInPictureToggled')) {
      properties = properties.setIn(
        ['properties', 'isPictureInPictureToggled'],
        data.get('isPictureInPictureToggled'),
      )
    }
    return properties
  }
  return Map()
}

export function createDefaultContextProperties (
  data = Map(),
  attributes = Map(),
) {
  if (data.size > 0) {
    const properties = fromJS({
      properties: {
        gaiaContext: data,
        ...attributes,
      },
    })
    return properties
  }
  return Map()
}

/**
 * Creates an event properties node for tracking events
 * @param  {Immutable.Map} data   map of single-level event properties
 * @return {Immutable.Map}        event-final structured properties
 */
export function createGaiaScreenProperties (data = Map()) {
  if (data && data.size > 0) {
    const properties = fromJS({
      properties: {
        gaiaScreen: data,
      },
    })
    return properties
  }

  return Map()
}
