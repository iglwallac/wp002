import { Map } from 'immutable'
import { get, set, parseQuery, queryContainsTracking } from './index'

export const SET_INBOUND_TRACKING = 'SET_INBOUND_TRACKING'
export const SET_INBOUND_TRACKING_PATH = 'SET_INBOUND_TRACKING_PATH'
export const SET_INBOUND_TRACKING_DATA = 'SET_INBOUND_TRACKING_DATA'
export const SET_INBOUND_TRACKING_DATA_INITIALIZED =
  'SET_INBOUND_TRACKING_DATA_INITIALIZED'
export const SET_INBOUND_TRACKING_PROCESSING = 'SET_INBOUND_TRACKING_PROCESSING'
export const SET_INBOUND_TRACKING_INITIALIZED =
  'SET_INBOUND_TRACKING_INITIALIZED'

export function parseInboundTrackingUrl (options) {
  return function parseInboundTrackingUrlThunk (dispatch) {
    const { uid, query, timestamp, path, auth } = options
    if (!queryContainsTracking(query)) {
      dispatch(setInboundTrackingPath(path, false))
    } else {
      dispatch(setInboundTrackingPath(path, true))
    }
    const persistentTracking = {
      uid,
      data: parseQuery(query, timestamp),
      auth,
    }
    set(persistentTracking).then((inboundTrackingData) => {
      dispatch(setInboundTrackingData(inboundTrackingData, false))
      return inboundTrackingData
    })
  }
}

export function setInboundTrackingRfd (options) {
  return async function setInboundTrackingPersistentThunk (dispatch) {
    dispatch(setInboundTrackingProcessing(true))
    const { auth, rfd, source = 'REFERRAL', sourceId } = options
    const uid = auth.get('uid')
    try {
      const trackingData = await get({ uid })
      const trackingDataJS = (trackingData || Map()).toJS()
      const updatedTracking = {
        uid,
        data: { ...trackingDataJS, rfd, source, sourceId },
      }
      const inboundTrackingData = await set(updatedTracking)
      dispatch(setInboundTrackingData(inboundTrackingData, false))
    } catch (e) {
      dispatch(setInboundTrackingData(Map(), false))
    }
  }
}

export function getInboundTrackingPersistent (options) {
  return function getInboundTrackingPersistentThunk (dispatch) {
    dispatch(setInboundTrackingProcessing(true))
    const { auth } = options
    get({ uid: auth.get('uid') })
      .then((inboundTracking) => {
        dispatch(
          setInboundTrackingDataInitialized(inboundTracking, true, false),
        )
        return inboundTracking
      })
      .catch(() => {
        dispatch(setInboundTrackingDataInitialized(Map(), true, false))
      })
  }
}

export function setInboundTrackingContentImpression (options) {
  return async function setContentImpressionThunk (dispatch, getState) {
    // eslint-disable-next-line camelcase
    const { uid, ci_type, ci_id } = options
    const { inboundTracking } = getState()
    const inboundTrackingData = inboundTracking.get('data') || Map()
    const userId = uid || -1

    try {
      const trackingData = await get({ uid: userId })
      const trackingDataJS = (trackingData || Map()).toJS()
      // inboundTrackingData is being used due to the cookie banner
      // if someone does not accept the cookie banner, we need to pass along what is in
      // redux to keep things in sync
      const inboundTrackingStateJS = (inboundTrackingData || Map()).toJS()
      let data = Map()

      if (trackingData.size === 0 && inboundTrackingData.size > 0) {
        data = inboundTrackingStateJS
      } else if (trackingData.size > 0) {
        data = trackingDataJS
      }

      const updatedTracking = {
        uid: userId,
        data: { ...data, ci_type, ci_id },
      }

      const updatedInboundTrackingData = await set(updatedTracking)
      dispatch(setInboundTrackingData(updatedInboundTrackingData, false))
    } catch (e) {
      // do nothing for now
    }
  }
}

export function setInboundTrackingPath (path, processing = false) {
  return {
    type: SET_INBOUND_TRACKING_PATH,
    payload: { path, processing },
  }
}

// Deprecated, please use setInboundTracking
export function setInboundTrackingData (data, processing = false) {
  return {
    type: SET_INBOUND_TRACKING_DATA,
    payload: { data, processing },
  }
}

export function setInboundTracking (data) {
  return {
    type: SET_INBOUND_TRACKING,
    payload: data,
  }
}

export function setInboundTrackingDataInitialized (
  data,
  initialized = true,
  processing = false,
) {
  return {
    type: SET_INBOUND_TRACKING_DATA_INITIALIZED,
    payload: { data, initialized, processing },
  }
}

export function setInboundTrackingInitialized (value, processing = false) {
  return {
    type: SET_INBOUND_TRACKING_INITIALIZED,
    payload: { value, processing },
  }
}

export function setInboundTrackingProcessing (value) {
  return {
    type: SET_INBOUND_TRACKING_PROCESSING,
    payload: value,
  }
}
