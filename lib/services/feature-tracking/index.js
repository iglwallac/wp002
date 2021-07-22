/**
 * Features related to feature tracking, which are
 * essentially user settings such as tool tip views
 * and language (language is actually proxied from auth)
 * @module serivices/feature-tracking
 */
import { fromJS } from 'immutable'
import {
  get as apiGet,
  patch as apiPatch,
  post as apiPost,
  del as apiDelete,
  TYPE_BROOKLYN_JSON,
} from 'api-client'
import _get from 'lodash/get'
import _cloneDeep from 'lodash/cloneDeep'
import _size from 'lodash/size'
import { EN } from 'services/languages/constants'
import { get as getConfig } from 'config'

export const MH_SPOTLIGHT_COLLAPSED_KEY = 'mhSpotlightCollapsed'
/**
 * Initial feature tracking data in the default state
 */
const SCHEMA = {
  explainerGiveViews: null,
  explainerMoreDetails: null,
  explainerVideoPlayerComments: null,
  explainerVideoPlayerHearts: null,
  explainerPlaylistEdit: null,
  videoPlayerHeartsVisible: true,
  dismissedProfileChooser: null,
  userLanguages: [],
  disableAutoPlayNext: false,
  disableVideoInfo: false,
  [MH_SPOTLIGHT_COLLAPSED_KEY]: false,
  featureImpressions: {},
  recommendedNotificationsEnabled: true,
  newEpisodeNotificationsEnabled: true,
}

/**
 * Create a feature tracking model instance to be used in state
 * @param {Object} data The data
 * @returns {import('immutable').Map} The feature tracking data
 */
function createModel (data, _dataError) {
  const defaultUserLanguages = [EN]
  const userLanguages = _get(data, 'userLanguages')
  return fromJS({
    _dataError,
    explainerGiveViews: _get(data, 'explainerGiveViews', null),
    explainerMoreDetails: _get(data, 'explainerMoreDetails', null),
    explainerVideoPlayerComments: _get(
      data,
      'explainerVideoPlayerComments',
      null,
    ),
    explainerVideoPlayerHearts: _get(data, 'explainerVideoPlayerHearts', null),
    explainerPlaylistEdit: _get(data, 'explainerPlaylistEdit', null),
    videoPlayerHeartsVisible: _get(data, 'videoPlayerHeartsVisible', true),
    dismissedProfileChooser: _get(data, 'dismissedProfileChooser', null),
    [MH_SPOTLIGHT_COLLAPSED_KEY]: _get(data, MH_SPOTLIGHT_COLLAPSED_KEY,
      SCHEMA[MH_SPOTLIGHT_COLLAPSED_KEY]),
    userLanguages: userLanguages && _size(userLanguages) > 0 ? userLanguages : defaultUserLanguages,
    disableAutoPlayNext: _get(data, 'disableAutoPlayNext', false),
    disableVideoInfo: _get(data, 'disableVideoInfo', false),
    featureImpressions: _get(data, 'featureImpressions', {}),
    recommendedNotificationsEnabled: _get(data, 'recommendedNotificationsEnabled', true),
    newEpisodeNotificationsEnabled: _get(data, 'newEpisodeNotificationsEnabled', true),
    hiddenPmSectionIds: _get(data, 'hiddenPmSectionIds', []),
  })
}

/**
 * Get feature tracking data
 * @param {Object} options The options
 * @param {import('immutable').Map} options.auth Auth data
 * @returns {import('immutable').Map} The feature tracking data
 */
export async function get (options = {}) {
  try {
    const { auth } = options
    const res = await apiGet('v2/feature-tracking', null, { auth }, TYPE_BROOKLYN_JSON)
    return handleGetResponse(res)
  } catch (e) {
    return handleGetResponse({}, true)
  }
}

/**
 * Handle the get api response
 * @param {Object} res An http response
 * @param {Object} res.body The response body
 * @param {Boolean} _dataError Was the response an error
 * @returns {import('immutable').Map} The feature tracking data
 */
export function handleGetResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  return createModel(data, _dataError)
}

/**
 * Save feature tracking data remotely
 * @param {Object} [options={}] The options
 * @param {import('immutable').Map} options.auth Auth data
 * @param {import('immutable').Map|Object} options.data The data to save
 * @returns {Boolean} True if the data saved successfull
 */
export async function set (options = {}) {
  try {
    const { auth, data } = options
    const res = await apiPatch('v2/feature-tracking', data, { auth }, TYPE_BROOKLYN_JSON)
    return _get(res, 'success') === true
  } catch (e) {
    return false
  }
}

/**
 * Remotely reset feature tracking data to the initial state
 * @param {Object} [options={}] The options
 * @param {import('immutable').Map} options.auth Auth data
 * @returns {Boolean} True if the data saved successfull
 */
export async function reset (options = {}) {
  try {
    const { auth } = options
    const data = _cloneDeep(SCHEMA)
    const res = await apiPatch('v2/feature-tracking', data, { auth }, TYPE_BROOKLYN_JSON)
    return _get(res, 'success') === true
  } catch (e) {
    return false
  }
}

/**
 * Remotely increment user feature impression count
 * @param {import('immutable').Map} options.auth Auth data
 * @param {Object} featureName The feature name
 * @param {Object} res An http response
 */
export async function incrementImpressionCount (featureName, auth) {
  const res = await apiPost(`/v2/feature-tracking/impressions/${featureName}`, {}, { auth }, TYPE_BROOKLYN_JSON)
  return _get(res, 'body')
}

/**
 * Remotely reset user feature impression count to the initial state
 * @param {import('immutable').Map} options.auth Auth data
 * @param {Object} featureName The feature name
 * @param {Object} res An http response
 */
export async function resetImpressionCount (featureName, auth) {
  const res = await apiDelete(`/v2/feature-tracking/impressions/${featureName}`, {}, { auth }, TYPE_BROOKLYN_JSON)
  return _get(res, 'body')
}

/**
 * Checks if user meets criteria for a member customization tooltip
 * @param {Object} featureTrackingStore featureTracking store
 * @param {Object} userStore user store
 * @param {String} featureName feature name
 */
export function isMemberCustomizationToolTipEligible (featureTrackingStore,
  userStore, featureName) {
  const config = getConfig()
  const eligibilityDate = new Date(_get(config, 'features.memberCustomizationTooltips.eligibilityDate'))
  const createdAtDate = new Date(userStore.getIn(['data', 'created_at']))
  const featureImpressions = featureTrackingStore.getIn(
    ['data', 'featureImpressions', featureName],
    0)
  return createdAtDate < eligibilityDate && featureImpressions < 1
}
