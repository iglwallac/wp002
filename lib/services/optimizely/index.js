import _get from 'lodash/get'
import _isFunction from 'lodash/isFunction'
import _isUndefined from 'lodash/isUndefined'
import _includes from 'lodash/includes'

export const OPTIMIZELY_VARIABLE_NAME = 'optimizely'
export const SCRIPT_URL = 'https://cdn.optimizely.com/js/401751626.js'

export function getApi (_window = global) {
  if (!process.env.BROWSER) {
    return []
  }
  if (_isUndefined(_window[OPTIMIZELY_VARIABLE_NAME])) {
    // eslint-disable-next-line no-param-reassign
    _window[OPTIMIZELY_VARIABLE_NAME] = []
  }
  return _window[OPTIMIZELY_VARIABLE_NAME]
}

export function addListener (handler) {
  getApi().push({ type: 'addListener', handler })
}

export function activatePage (pageName) {
  return getApi().push({ type: 'page', pageName, isActive: true })
}

export function deactivatePage (pageName) {
  return getApi().push({ type: 'page', pageName, isActive: false })
}

export function reactivatePage (pageName) {
  deactivatePage(pageName)
  return activatePage(pageName)
}

export function activate () {
  return getApi().push({ type: 'activate' })
}

export function triggerEvent (eventName, tags = {}) {
  return getApi().push({ type: 'event', eventName, tags })
}

export function addUserAttributes (attributes) {
  return getApi().push({ type: 'user', attributes })
}

export function isExperimentVariationActive (experimentId, variantId) {
  const api = getApi()
  if (!_isFunction(_get(api, 'get'))) {
    return null
  }
  if (!isExperimentActive(experimentId)) {
    return null
  }
  const variation = _get(api.get('state').getExperimentStates(), [
    experimentId,
    'variation',
  ])

  if (!variation) {
    return null
  }
  return _get(variation, 'id') === variantId
}

export function isExperimentActive (experimentId) {
  const api = getApi()
  if (!_isFunction(_get(api, 'get'))) {
    return null
  }
  const activeExperimentIds = api.get('state').getActiveExperimentIds() || []
  return _includes(activeExperimentIds, experimentId)
}
