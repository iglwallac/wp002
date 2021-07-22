import { setInboundTrackingRfd } from 'services/inbound-tracking/actions'
import { ERROR_EMAIL_INVALID } from 'services/email-signup'
import { addToasty } from 'services/toasty/actions'
import { RESOLVER_TYPE_SHARE } from 'services/resolver/types'
import { setTilesData } from 'services/tiles/actions'
import { setMultipleVideos } from 'services/videos/actions'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { SET_USER_DATA_LANGUAGE } from 'services/user/actions'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { setMediaLang, resetMedia } from 'services/media/actions'
import { Map } from 'immutable'
import get from 'lodash/get'
import * as api from './'
import {
  setShareData,
  CREATE_SHARE,
  CREATED_SHARE,
  GET_USER_SHARES,
  SET_SHARE_DATA,
  SET_USER_SHARES,
  SET_SHARE_SOURCE,
  SET_ACCOUNT_SHARES,
  GET_ACCOUNT_SHARES,
  GET_USER_HAS_SHARED,
  SET_USER_HAS_SHARED,
  SET_SHARE_CONVERSION,
  SET_SHARE_QUALIFIED_VIEW,
  SET_SHARE_PERSONALIZATION,
  DUPLICATE_SHARE_EMAIL_CAPTURE,
  DUPLICATED_SHARE_EMAIL_CAPTURE,
  SET_SHARE_REMOVE_PERSONALIZATION,
} from './actions'

function isSharePage ({ state }) {
  const { resolver } = state
  return resolver.getIn(['data', 'type'])
    === RESOLVER_TYPE_SHARE
}

export function createShare ({ takeFirst }) {
  return takeFirst(
    CREATE_SHARE,
    async ({ action, state }) => {
      const { auth } = state
      const { payload: inputs } = action
      const { personalization, source, type, contentId } = inputs
      const payload = await api.createShare({
        personalization,
        contentId,
        source,
        auth,
        type,
      })
      return {
        type: CREATED_SHARE,
        payload,
      }
    })
}

export function duplicateShareEmailCapture ({ takeFirst }) {
  return takeFirst(
    DUPLICATE_SHARE_EMAIL_CAPTURE,
    async ({ action, state }) => {
      const { user } = state
      const language = user.getIn(['data', 'language', 0], 'en')
      const { payload: inputs } = action
      const { token, email } = inputs
      const data = await api.duplicateShareEmailCapture({
        token,
        email,
        language,
      })
      const payload = { data }
      return {
        type: DUPLICATED_SHARE_EMAIL_CAPTURE,
        payload,
      }
    })
}

// -----------------------------------
// Watcher for toasty when report is made
// -----------------------------------
export function shareEmailCaptureCreateToasty ({ after }) {
  return after([
    DUPLICATED_SHARE_EMAIL_CAPTURE,
  ], async ({ dispatch, state, action }) => {
    const { staticText } = state
    const { payload } = action
    const { data: payloadData } = payload
    const data = payloadData.get('data', Map())
    const success = data.get('success', false)
    const errorCode = data.get('errorCode', undefined)
    const successMsg = staticText.getIn(['data', 'sharePage', 'data', 'successExpiredMessage'])
    const errorMsg = (errorCode && errorCode === ERROR_EMAIL_INVALID)
      ? staticText.getIn(['data', 'sharePage', 'data', 'errorMessageInvalidEmail'])
      : staticText.getIn(['data', 'sharePage', 'data', 'errorMessageRegistrationError'])
    const msg = success ? successMsg : errorMsg
    dispatch(addToasty(msg))
  })
}

export function getHasShared ({ takeMaybe }) {
  return takeMaybe(
    GET_USER_HAS_SHARED,
    ({ state }) => {
      const { auth, share } = state

      if (share.get('hasShared')) {
        return null
      }

      return async function getHasSharedEffect () {
        const payload = await api.getHasShared({ auth })
        return {
          type: SET_USER_HAS_SHARED,
          payload,
        }
      }
    })
}

export function getShare ({ after }) {
  return after([
    SET_RESOLVER_DATA,
    SET_USER_DATA_LANGUAGE,
  ], async ({ dispatch, state }) => {
    const { auth, user, resolver } = state
    const language = user.getIn(['data', 'language', 0])
    const token = resolver.getIn(['data', 'params', 'token'], '')
    const result = await api.hydrateShare({ language, token, auth })
    const { shareData = Map(), error = false, videosData, tilesData, videoIds } = result

    dispatch(setShareData({
      data: shareData.get('data') || Map(),
      error,
    }))
    if (tilesData) {
      dispatch(setTilesData('share', tilesData))
      dispatch(setMultipleVideos(videoIds, language, videosData))
    }
  }).when(({ state }) => {
    const { resolver } = state
    return resolver.getIn(['data', 'type'])
      === RESOLVER_TYPE_SHARE
  })
}

export function getUserShares ({ takeEvery }) {
  return takeEvery(
    GET_USER_SHARES,
    async ({ state }) => {
      const { auth } = state
      const payload = await api.getUserShares({ auth })
      return {
        type: SET_USER_SHARES,
        payload,
      }
    })
}

export function getAccountShares ({ takeEvery }) {
  return takeEvery(
    GET_ACCOUNT_SHARES,
    async ({ state }) => {
      const { auth } = state
      const payload = await api.getAccountShares({ auth })
      return {
        type: SET_ACCOUNT_SHARES,
        payload,
      }
    })
}

export function setQualifiedView ({ after }) {
  return after(
    SET_SHARE_QUALIFIED_VIEW,
    async ({ action }) => {
      const token = get(action, ['payload', 'token'])
      await api.setQualifiedView({ token })
    })
}

export function addSource ({ after }) {
  return after(
    SET_SHARE_SOURCE,
    async ({ state, action }) => {
      const { auth } = state
      const token = get(action, ['payload', 'token'])
      const source = get(action, ['payload', 'source'])
      await api.setShareSource({ auth, token, source })
    })
}

export function setConversion ({ after }) {
  return after(
    SET_SHARE_CONVERSION,
    async ({ action }) => {
      const token = get(action, ['payload', 'token'])
      await api.setConversion({ token })
    })
}

export function addPersonalization ({ takeLatest }) {
  return takeLatest(
    SET_SHARE_PERSONALIZATION,
    async ({ state, action }) => {
      const { auth } = state
      const { payload } = action
      const { personalization, token } = payload
      await api.addPersonalization({ auth, token, personalization })
    })
}

export function removePersonalization ({ takeLatest }) {
  return takeLatest(
    SET_SHARE_REMOVE_PERSONALIZATION,
    async ({ action, state }) => {
      const { auth } = state
      const { payload } = action
      const { token } = payload
      await api.removePersonalization({ auth, token })
    })
}

// -----------------------------------
// Watcher when share data is ready.
// -----------------------------------
export function watchSetShare ({ after }) {
  return after([
    SET_SHARE_DATA,
    SET_APP_BOOTSTRAP_PHASE,
  ],
  async ({ dispatch, state }) => {
    const { app, auth, share, inboundTracking, media } = state
    if (app.get('bootstrapComplete')) {
      const existingRfd = ['PORTAL', 'SHARE'].includes(inboundTracking.getIn(['data', 'source']))
      const existingMediaLanguage = media.getIn(['data', 'mediaLang'])
      const shareLanguage = share.getIn(['data', 'fullMedia', 'mediaUrls', 'language'])

      // only set RFD if one doesn't already exist
      if (!existingRfd) {
        dispatch(setInboundTrackingRfd({
          rfd: share.getIn(['data', 'userReferralId']),
          source: 'SHARE',
          sourceId: share.getIn(['data', 'id']),
          auth,
        }))
      }

      // Set the mediaLanguage from share store if has not been populated.
      if (shareLanguage && !existingMediaLanguage) {
        dispatch(setMediaLang(shareLanguage))
      }
    }
  })
    .when(isSharePage)
}

// -----------------------------------
// Watcher when share page is unmounted.
// -----------------------------------
export function watchSharePageUnmount ({ before }) {
  return before(SET_RESOLVER_DATA, async ({ action, dispatch }) => {
    const next = get(action, 'payload.data.path')

    // Reset the media if leaving the page.
    if (next !== RESOLVER_TYPE_SHARE) {
      dispatch(resetMedia())
    }
  }).when(isSharePage)
}
