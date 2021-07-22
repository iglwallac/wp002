import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _reduce from 'lodash/reduce'
import { Map, List } from 'immutable'
import {
  GEO_AVAILABILITY_BLOCKED_IN,
  GEO_AVAILABILITY_ALLOWED_IN,
} from 'services/geo-restrictions'
import { EN } from 'services/languages/constants'

const MEDIA_IS_FREE = 'free'
const MEDIA_ONLY_WITH = 'onlyWith'

const SCHEMA = {
  id: null,
  _dataError: null,
  bcHLS: null,
  mediaLang: null,
  byLang: {},
  textTracks: {
    captions: {},
    subtitles: {},
  },
}

/**
 * Call media info endpoint to get media info for playback
 * @param {Object} options The options
 * @param {String|Number} options.id The media id
 * @param {Object|import('immutable').Map} options.auth The auth data
 * @param {import('immutable').Map} options.user The user data
 * @returns The media info
 */
export async function get (options) {
  const { id, auth, user = Map() } = options
  if (id === -1) {
    return null
  }
  try {
    const languages = user.getIn(['data', 'language']) || List()
    const res = await apiGet(`v1/media-info/${id}`, { language: languages.first() || EN }, { auth }, TYPE_BROOKLYN)
    return handleResponse(res, id)
  } catch (e) {
    return handleResponse({}, id, true)
  }
}

export function handleResponse (res, id, _dataError) {
  const data = _get(res, 'body', {})
  const mediaLang = _get(data, ['mediaUrls', 'language'], null)
  let byLang = _get(data, ['mediaUrls', 'byLang'], null)
  const bcHLS = _get(data, ['mediaUrls', 'bcHLS'])
  if (byLang) {
    byLang = _reduce(byLang, (result, value, key) => {
      Object.assign(result, { [key]: value })
      return result
    }, {})
  }
  const expiresDate = new Date()
  // After the time below the media urls will be expired and
  // media info needs to be refreshed
  expiresDate.setHours(expiresDate.getHours() + 6)
  return _assign(_cloneDeep(SCHEMA), {
    id,
    _dataError,
    bcHLS,
    byLang,
    mediaLang,
    expiresTime: expiresDate.getTime(),
    textTracks: {
      captions: _get(data, ['textTracks', 'captions'], {}),
      subtitles: _get(data, ['textTracks', 'subtitles'], {}),
      thumbnail: _get(data, ['textTracks', 'thumbnail'], null),
    },
    isShareable: _get(data, 'isShareable', false),
  })
}

/**
 * Returns true when the media is available for playback
 * @todo refactor and remove duplicates after member home test
 */
function mediaIsAvailable (media, availability, userSubscriptions) {
  const subscriptions = media.getIn(['offerings', 'subscriptions']) || List()
  if (availability === MEDIA_IS_FREE) {
    return true
  }
  if (availability === MEDIA_ONLY_WITH) {
    // if user subscription doesn't match any media subscriptions, return false
    if (!subscriptions.some(v => userSubscriptions.includes(v))) {
      return false
    }
  }
  return true
}

export const mediaIsGeoRestricted = (media, userCountry) => {
  const geoAvailability = media.getIn(['georestrictions', 'availability'], null)
  const geoCountries = media.getIn(['georestrictions', 'countries']) || List()

  if (geoAvailability === GEO_AVAILABILITY_ALLOWED_IN) {
    return !geoCountries.includes(userCountry)
  }
  if (geoAvailability === GEO_AVAILABILITY_BLOCKED_IN) {
    return geoCountries.includes(userCountry)
  }
  // This is for worldwide
  return false
}

export const getWatchAccess = ({ media, country, userSubscriptions }) => {
  const mediaId = media.get('id')
  const availability = media.getIn(['offerings', 'availability'], null)
  const isAvailable = mediaIsAvailable(media, availability, userSubscriptions)
  const isGeoRestricted = mediaIsGeoRestricted(media, country)
  if (mediaId && isAvailable && !isGeoRestricted) {
    return true
  }
  return false
}
