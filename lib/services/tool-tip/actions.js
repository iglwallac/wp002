import {
  getLocalPreferences,
  setLocalPreferences,
} from 'services/local-preferences'
import _isObject from 'lodash/isObject'
import { Map, fromJS, List } from 'immutable'

const EXCLUDE_KEYS_LOCAL_STORAGE = List([
  'processing',
  'initialized',
  'initializedLocalStorage',
  'initializedFeatureTracking',
])

export const RESET_TOOL_TIP = 'RESET_TOOL_TIP'
export const SET_TOOL_TIP_VISIBLE = 'SET_TOOL_TIP_VISIBLE'
export const TOGGLE_TOOL_TIP_VISIBLE = 'TOGGLE_TOOL_TIP_VISIBLE'
export const SET_TOOL_TIP_PROCESSING = 'SET_TOOL_TIP_PROCESSING'
export const INIT_TOOL_TIP = 'INIT_TOOL_TIP'
export const INIT_TOOL_TIP_FEATURE_TRACKING = 'INIT_TOOL_TIP_FEATURE_TRACKING'

export function resetToolTip () {
  return {
    type: RESET_TOOL_TIP,
  }
}

export function setToolTipVisible (storeKey, visible) {
  return {
    type: SET_TOOL_TIP_VISIBLE,
    payload: { storeKey, visible },
  }
}

export function toggleToolTipVisible (storeKey) {
  return {
    type: TOGGLE_TOOL_TIP_VISIBLE,
    payload: { storeKey },
  }
}

export function setToolTipProcessing (processing) {
  return {
    type: SET_TOOL_TIP_PROCESSING,
    payload: { processing },
  }
}

export function initToolTip (data, processing = false) {
  return {
    type: INIT_TOOL_TIP,
    payload: { data, processing },
  }
}

export function initToolTipFeatureTracking (data, processing = false) {
  return {
    type: INIT_TOOL_TIP_FEATURE_TRACKING,
    payload: { data, processing },
  }
}

export function setToolTipVisiblePersistent (storeKey, auth, visible) {
  return function setToolTipVisiblePersistentThunk (dispatch, getState) {
    let { toolTip } = getState()
    if (toolTip.getIn([storeKey, 'visible']) === visible) {
      return
    }
    toolTip = toolTip.update(storeKey, Map(), item =>
      item.set('visible', visible),
    )
    setLocalPreferences(
      auth.get('uid', -1),
      'tooltip',
      toolTip
        .filterNot((value, key) => EXCLUDE_KEYS_LOCAL_STORAGE.includes(key))
        .toJS(),
      auth,
    )
  }
}

export function getToolTipPersistent (options) {
  const { auth } = options
  return function getToolTipPersistentThunk (dispatch) {
    dispatch(setToolTipProcessing(true))
    const storageToolTip = getLocalPreferences(auth.get('uid', -1), 'tooltip')
    const tooltip = fromJS(
      _isObject(storageToolTip) ? storageToolTip : {},
    ).filterNot((value, key) => EXCLUDE_KEYS_LOCAL_STORAGE.includes(key))
    dispatch(initToolTip(tooltip))
  }
}
