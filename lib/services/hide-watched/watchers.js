import strictUriEncode from 'strict-uri-encode'
import { List } from 'immutable'
import { post as apiPost, TYPE_BROOKLYN_JSON } from 'api-client'
import { setDefaultGaEvent } from 'services/event-tracking/actions'
import { HIDE_WATCHED_EVENT } from 'services/event-tracking'
import {
  SAVE_HIDE_WATCHED,
  DONE_SAVE_HIDE_WATCHED,
} from './actions'

export default function batchSaveHideWatched ({ after }) {
  return after(SAVE_HIDE_WATCHED, async ({ state, dispatch }) => {
    const { auth, hideWatched } = state
    const promises = hideWatched.get('data', List())
      .map((item) => {
        const event = HIDE_WATCHED_EVENT
          .set('eventLabel', item.title)
        dispatch(setDefaultGaEvent(event))
        return apiPost(`user/flag-watched/${strictUriEncode(item.id)}`,
          { hiddenByUser: true }, { auth }, TYPE_BROOKLYN_JSON)
      })
    await Promise.all(promises)
    dispatch({ type: DONE_SAVE_HIDE_WATCHED })
  })
}

