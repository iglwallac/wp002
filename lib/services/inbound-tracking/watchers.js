import { Map, fromJS } from 'immutable'
import { setInboundTrackingData, SET_INBOUND_TRACKING } from './actions'
import { get, set } from './index'


// -----------------------------------
// Watcher for SET_INBOUND_TRACKING
// -----------------------------------
export default function watchSetInboundTracking ({ after }) {
  return after(SET_INBOUND_TRACKING, async ({ state, action, dispatch }) => {
    const { payload } = action
    const { auth } = state
    const uid = auth.get('uid')
    try {
      const data = await get({ uid })
      const next = data.merge(fromJS(payload))
      const inboundTrackingData = await set({ uid, auth, data: next })
      dispatch(setInboundTrackingData(inboundTrackingData, false))
    } catch (e) {
      dispatch(setInboundTrackingData(Map(), false))
    }
  })
}
