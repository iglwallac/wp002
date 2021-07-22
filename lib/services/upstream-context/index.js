import _get from 'lodash/get'
import _assign from 'lodash/assign'
import _keys from 'lodash/keys'
import _split from 'lodash/split'
import { get as getConfig } from 'config'
import { fromJS } from 'immutable'
import {
  STORE_KEY_EPISODE_DETAIL_NEXT,
  STORE_KEY_DETAIL_VIDEO_RELATED,
  STORE_KEY_DETAIL_EPISODE_RELATED,
  STORE_KEY_DETAIL_SERIES_SEASON,
  STORE_KEY_DETAIL_FEATURED_EPISODE,
  STORE_KEY_SEARCH,
  STORE_KEY_PLAYLIST,
  STORE_KEY_PLAYLIST_DEFAULT,
  STORE_KEY_RECENTLY_ADDED,
} from 'services/store-keys'

const config = getConfig()

export const CONTEXT_NAME_ADMIN_TITLE = 'adminTitle'

/**
 * values for gaiaContext.element
 */
export const CONTEXT_TYPE_TEACHERS_STYLES_LIST = 'teachers-styles-list'
export const CONTEXT_TYPE_TEACHERS_LIST = 'teachers-list'
export const CONTEXT_TYPE_TEACHERS_PRACTICES_ENTITY = 'teachers-practices-entity'
export const CONTEXT_TYPE_TEACHER_MODAL = 'teacher-modal'
export const CONTEXT_TYPE_ARTICLES = 'articles-list'

// Yoga and fitness share the same term id between all environments
export const ALL_YOGA_PRACTICES_ID = 26711
export const YOGA_FITNESS_ID = 26716
export const ALL_FILMS_ID = 26681
// Newer terms differ by environment so must come from config
export const RECIPES_ID = _get(config, 'features.recipes.categoryTermId')

/**
 * values for gaiaContext.element
 */
export const THUMBNAIL = 'thumbnail'
export const PLAY_BUTTON = 'play-button' // circle with play icon
export const WATCH_BUTTON = 'watch-button' // 'watch now' buttons
export const MORE_BUTTON = 'more-button'
export const SERIES_BUTTON = 'series-button'
export const SERIES_TITLE = 'series-title'
export const VIDEO_TITLE = 'video-title'
export const BANNER = 'banner'
export const SHELF_BUTTON = 'shelf-button'

/**
 * values for gaiaContext.screenType
 */
export const SCREEN_TYPE_MEMBER_HOME = 'member-home'
export const SCREEN_TYPE_CENTERS = 'centers'
export const SCREEN_TYPE_WATCH_HISTORY = 'recently-watched'
export const SCREEN_TYPE_SUBCATEGORY = 'subcategory'
export const SCREEN_TYPE_CLASSIC_FACET = 'classic-facet'
export const SCREEN_TYPE_DETAIL_VIDEO = 'video-detail'
export const SCREEN_TYPE_DETAIL_SERIES = 'series-detail'
export const SCREEN_TYPE_SEARCH_PAGE = 'search'
export const SCREEN_TYPE_PLAYLIST = 'playlist'
export const SCREEN_TYPE_RECENTLY_ADDED = 'recently-added'
export const SCREEN_TYPE_SITE_SEGMENT = 'site-segment'
export const SCREEN_TYPE_VIDEO_PLAYER = 'video-player'
export const SCREEN_TYPE_YOGA_TEACHERS = 'yoga-teachers'
export const SCREEN_TYPE_CLE = 'cle'
export const SCREEN_TYPE_YOGA_HOME = 'yoga-home'
export const SCREEN_TYPE_HEADER = 'header'
export const SCREEN_TYPE_FOOTER = 'footer'
export const SCREEN_TYPE_GUIDES = 'guides'

/**
 * values for gaiaContext.contextType
 */
export const CONTEXT_TYPE_HEADER = 'header'
export const CONTEXT_TYPE_NAV_PRIMARY = 'nav-primary'
export const CONTEXT_TYPE_FOOTER = 'footer'
export const CONTEXT_TYPE_RELATED_VIDEOS = 'related-videos-list'
export const CONTEXT_TYPE_NEXT_VIDEOS = 'next-videos-list'
export const CONTEXT_TYPE_EPISODE_VIDEOS = 'season-episodes-list'
export const CONTEXT_TYPE_SUBCATEGORY_ENTITY = 'subcategory-entity'
export const CONTEXT_TYPE_SUBCATEGORY_LIST = 'subcategory-list'
export const CONTEXT_TYPE_FEATURED_EPISODE = 'featured-episode'
export const CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET_ENTITY = 'yoga-classic-facet-entity'
export const CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET = 'yoga-classic-facet'
export const CONTEXT_TYPE_SUBCATEGORY_FITNESS_CLASSIC_FACET_ENTITY = 'fitness-classic-facet-entity'
export const CONTEXT_TYPE_SUBCATEGORY_FITNESSE_CLASSIC_FACET = 'fitnesse-classic-facet'
export const CONTEXT_TYPE_SUBCATEGORY_INTERVIEW_CLASSIC_FACET_ENTITY = 'interview-classic-facet-entity'
export const CONTEXT_TYPE_SUBCATEGORY_INTERVIEW_CLASSIC_FACET = 'interview-classic-facet'
export const CONTEXT_TYPE_SEARCH_RESULTS_LIST = 'search-results-list'
export const CONTEXT_TYPE_SEARCH_INPUT = 'search-input'
export const CONTEXT_TYPE_PLAYLIST_LIST = 'playlist-list'
export const CONTEXT_TYPE_RECENTLY_ADDED_LIST = 'recently-added-list'
export const CONTEXT_TYPE_SITE_SEGMENT_CENTER = 'site-segment-center'
export const CONTEXT_TYPE_VIDEO_ENTITY = 'video-entity'
export const CONTEXT_TYPE_VIDEO_END_STATE = 'video-end-state'
export const CONTEXT_TYPE_SERIES_ENTITY = 'series-entity'
export const CONTEXT_TYPE_CLASSIC_FACET_SPOTLIGHT = 'classic-facet-spotlight'
export const CONTEXT_TYPE_CLE = 'cle'
export const CONTEXT_TYPE_SHARE_VIEW = 'share-view'
export const CONTEXT_TYPE_GUIDES = 'guides'

// shelf video entity contextTypes
export const CONTEXT_TYPE_SHELF_VIDEO_ENTITY = 'shelf/video-entity'
export const CONTEXT_TYPE_SHELF_RELATED_VIDEOS_LIST = 'shelf/related-videos-list'
export const CONTEXT_TYPE_SHELF_NEXT_VIDEOS_LIST = 'shelf/next-videos-list'

// shelf series entity contextTypes
export const CONTEXT_TYPE_SHELF_SERIES_ENTITY = 'shelf/series-entity'
export const CONTEXT_TYPE_SHELF_FEATURED_EPISODE = 'shelf/featured-episode'
export const CONTEXT_TYPE_SHELF_SEASON_EPISODES_LIST = 'shelf/season-episodes-list'

export const CATEGORY_SECTION_STATISTIC_PLAY_COUNT = 'play-count'
export const CATEGORY_SECTION_STATISTIC_MOMENT_COUNT = 'moment-count'
export const CATEGORY_SECTION_STATISTIC_VOTE_COUNT = 'vote-count'
export const CATEGORY_SECTION_STATISTIC_COMMENT_COUNT = 'comment-count'

export function mapStoreKeyToPositionContextType (key) {
  switch (key) {
    case STORE_KEY_DETAIL_VIDEO_RELATED:
    case STORE_KEY_DETAIL_EPISODE_RELATED:
      return CONTEXT_TYPE_RELATED_VIDEOS
    case STORE_KEY_EPISODE_DETAIL_NEXT:
      return CONTEXT_TYPE_NEXT_VIDEOS
    case STORE_KEY_DETAIL_SERIES_SEASON:
      return CONTEXT_TYPE_EPISODE_VIDEOS
    case STORE_KEY_DETAIL_FEATURED_EPISODE:
      return CONTEXT_TYPE_FEATURED_EPISODE
    case STORE_KEY_SEARCH:
      return CONTEXT_TYPE_SEARCH_RESULTS_LIST
    case STORE_KEY_PLAYLIST:
    case STORE_KEY_PLAYLIST_DEFAULT:
      return CONTEXT_TYPE_PLAYLIST_LIST
    case STORE_KEY_RECENTLY_ADDED:
      return CONTEXT_TYPE_RECENTLY_ADDED_LIST
    default:
      return null
  }
}

/**
 * used to set element on upstream context and then set it in redux
 * event tracking methods should check redux.upstreamContext
 *
 * @param {object} evt - js event
 * @param {object} options
 */
export function upstreamContextOnClick (evt, options) {
  const { upstreamContext, setUpstreamContext } = options

  if (!upstreamContext || upstreamContext.size === 0) {
    return
  }
  let aggregatedUpstreamContext = upstreamContext
  if (evt) {
    const element = evt.target.getAttribute('data-element') ||
    evt.currentTarget.getAttribute('data-element') ||
    upstreamContext.get('element')
    aggregatedUpstreamContext = upstreamContext.set('element', element)
  }

  setUpstreamContext(aggregatedUpstreamContext)
}

/**
 * Create a data-element title value based on url
 * - handle potential url forms:
 *   1. if url = '/{series/video}/{name}' - urlArray = ['', {series/video}, {name}]
 *   2. if url = '{series/video}/{name}' - urlArray = [{series/video}, {name}]
 * - we care about {series/video}
 * @param {String} url
 * @returns Return ${prefix}-title
 */
export function getTitleElementTypeByUrl (url) {
  const urlArray = _split(url || '', '/')
  const prefix = _get(urlArray, 0) || _get(urlArray, 1) || 'unknown'

  return `${prefix}-title`
}

/**
 * Custom tracking event properties transformer for properties.gaiaContext
 * Null values are removed
 * @param {Object} options   context data
 * @returns {import('immutable').Map} immutable representation of context data
 */
export function createUpstreamContext (options) {
  const {
    storeKey,
    contextType,
  } = options
  const data = _assign({}, options, {
    contextType: mapStoreKeyToPositionContextType(storeKey) || contextType,
  })

  // Cleanup null values
  if (!_get(options, 'screenParam')) {
    data.screenParam = undefined
    delete data.screenParam
  }

  if (!_get(options, 'filters')) {
    data.filters = undefined
    delete data.filters
  }

  if (!_get(options, 'sort')) {
    data.sort = undefined
    delete data.sort
  }

  if (!_get(options, 'campaignId')) {
    data.campaignId = undefined
    delete data.campaignId
  }

  if (!_get(options, 'source')) {
    data.source = undefined
    data.score = undefined
    delete data.source
    delete data.score
  }

  if (!_get(options, 'videoTasteSegment')) {
    data.videoTasteSegment = undefined
    delete data.videoTasteSegment
  }

  if (!_get(options, 'merchEventId')) {
    data.merchEventId = undefined
    delete data.merchEventId
  }

  return fromJS(data)
}

export function updateUpstreamContext (context, name, value) {
  if (!name || !value) {
    return context
  }
  if (!context) {
    return fromJS({ [name]: value })
  }
  return context.set(name, value)
}

export function updateUpstreamContextFromObject (context, values) {
  const keys = _keys(values)
  if (!keys.length) {
    return context
  }
  if (!context) {
    return fromJS(values)
  }
  return context.mergeDeep(fromJS(values))
}
