import {
  INTERSTITIAL_PREFLIGHT,
  INTERSTITIAL_REMOVE,
  INTERSTITIAL_SET,
} from './actions'

// minimum number of milliseconds an interstitial should be visible
// this is because if we show/remove too quickly, it looks unintentional to users
const MIN_TIME_VISIBLE = 2000

let timerLeaving = null
let timerRemove = null

async function removeInterstitial (view, interstitial, dispatch) {
  const renderedAt = interstitial.get('renderedAt')
  const isLeaving = interstitial.get('leaving')
  const currentView = interstitial.get('view')
  // 1. if there is no current interstitial OR the interstitial is already leaving
  // 2. if we were provided a 'view' BUT that view is not the same as the current one
  if ((!currentView || isLeaving)
    || (view && view !== currentView)) {
    return
  }

  const now = (new Date()).getTime()
  const diff = (renderedAt && (now - renderedAt)) || MIN_TIME_VISIBLE
  const delay = diff < MIN_TIME_VISIBLE
    ? MIN_TIME_VISIBLE - diff
    : 0

  timerLeaving = setTimeout(() => {
    // time to let the UI know the interstitil is leaving
    // we do this so it has time to fade out properly
    dispatch({ type: INTERSTITIAL_SET, payload: { leaving: true } })
    // we're putting this in a timer
    // so that async actions have the ability to cancel
    // the interstitial removal if needed. We also know that
    // there calling removeInterstitial() will not cause the code to come
    // into this block again, since 'leaving' has already been set
    timerRemove = setTimeout(() => {
      dispatch({ type: INTERSTITIAL_REMOVE })
    }, 600) // amount of time for ui fade out transition
  }, delay)
}

async function addInterstitial (view, dispatch) {
  // clear any existing timeouts
  clearTimeout(timerLeaving)
  clearTimeout(timerRemove)
  // reset variables
  timerLeaving = null
  timerRemove = null
  // launch interstitial view
  dispatch({
    type: INTERSTITIAL_SET,
    payload: {
      renderedAt: (new Date()).getTime(),
      leaving: false,
      view,
    },
  })
}

// eslint-disable-next-line import/prefer-default-export
export function watchPreflight ({ after }) {
  return after(INTERSTITIAL_PREFLIGHT, async ({ state, action, dispatch }) => {
    const { interstitial } = state
    const { payload } = action
    const { view, remove } = payload
    if (remove) {
      await removeInterstitial(view, interstitial, dispatch)
      return
    }
    await addInterstitial(view, dispatch)
  })
}
