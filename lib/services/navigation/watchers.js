import { requestAnimationFrame } from 'services/animate'
import { NAVIGATION_HISTORY_PUSH, NAVIGATION_HISTORY_REPLACE } from './actions'
import { historyRedirect, HISTORY_METHOD_PUSH, HISTORY_METHOD_REPLACE } from './'

/**
 * configures history watchers
 * @param {Object} history The application history object from npm history package
 * @returns {Object} An object of watcher functions
 */
export default function createWatchers (history) {
  //
  if (!history) {
    throw new Error('The history param is required.')
  }

  function watchHistory ({ before }) {
    return before([
      NAVIGATION_HISTORY_PUSH,
      NAVIGATION_HISTORY_REPLACE,
    ], ({ action, state }) => {
      //
      const { user, auth } = state
      const { payload = {}, type } = action
      const { url, query, scrollToTop = true, timeout = 100 } = payload

      const language = user.getIn(['data', 'language'])
      const historyMethod = type === NAVIGATION_HISTORY_REPLACE
        ? HISTORY_METHOD_REPLACE
        : HISTORY_METHOD_PUSH

      historyRedirect({
        historyMethod,
        language,
        timeout,
        history,
        query,
        auth,
        url,
      })

      // scroll to the top of the page on every redirect
      if (global && global.scrollTo && scrollToTop) {
        requestAnimationFrame(() => global.scrollTo(0, 0))
      }
    })
  }
  // ------------------------------------
  // can add more navigation watchers here.
  // just return them in the object below:
  // ------------------------------------
  return { watchHistory }
}
