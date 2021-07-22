import { CUSTOM_ROW_IMPRESSION_EVENT } from 'services/event-tracking'

export const TYPE_CONTENT_LIST = 'content-list'
export const TYPE_PEOPLE_LIST = 'people-list'
export const TYPE_PLACEMENT = 'placement'
export const TYPE_CONTINUE_WATCHING = 'continue-watching'
export const TYPE_RECOMMENDED_CONTENT = 'recommended-content'
export const TYPE_MY_SERIES = 'my-series'
export const TYPE_RECENTLY_ADDED = 'recently-added'
export const TYPE_PLAYLIST = 'playlist'
export const TYPE_PORTALS = 'portals'
export const TYPE_EXPLORE_BY_TOPIC = 'explore-by-topic'
export const TYPE_FEATURED_VIDEOS = 'featured-videos'
export const TYPE_PRACTICE_PICKER = 'practice-picker'
export const TYPE_RECOMMENDED_SERIES = 'recommended-series'
export const TYPE_RECOMMENDED_PRACTICES = 'recommended-practices'
export const TYPE_SERIES_FOLLOWING = 'followed-series'
export const MAX_ROW_ITEMS = 12

function itemHasData (item, language, videos, series, terms) {
  const itemId = item.get('contentId')
  const itemType = item.get('contentType')
  if (itemType === 'video' && videos) {
    return videos.hasIn([Number(itemId), language, 'data'])
  }
  if (itemType === 'series' && series) {
    return series.hasIn([Number(itemId), language, 'data'])
  }
  if (itemType === 'person' && terms) {
    return terms.hasIn([Number(itemId), language, 'data'])
  }
  if (itemType === 'tag' && terms) {
    return terms.hasIn([Number(itemId), language, 'data'])
  }
  return false
}

export function itemsHaveData (items, videos, series, language, terms) {
  return items.every(item => itemHasData(item, language, videos, series, terms))
}

export function getTitleForCustomRows (item, language, videos, series, terms) {
  const itemId = item.get('contentId')
  const itemType = item.get('contentType')
  let store
  switch (itemType) {
    case 'video':
      store = videos
      break
    case 'series':
      store = series
      break
    case 'person':
      store = terms
      break
    case 'tag':
      store = terms
      break
    default:
  }

  const title = store && store.getIn([Number(itemId), language, 'data', ['person', 'tag'].includes(itemType) ? 'name' : 'title'])
  return `${itemId} | ${title}`
}

export const sendCustomRowImpressionGAEvent = (setDefaultGaEvent, unsetIndexes,
  items, adminTitle, language, videoStore, seriesStore, termsStore) => {
  const tileInfos = unsetIndexes.map((index) => {
    const item = items.get(index)
    return getTitleForCustomRows(item, language, videoStore, seriesStore, termsStore)
  })

  const eventData = CUSTOM_ROW_IMPRESSION_EVENT
    .set('eventLabel', adminTitle)
    .set('contentInfo', tileInfos.join(' | '))
    .set('totalImpressions', unsetIndexes.length)

  setDefaultGaEvent(eventData)
}
