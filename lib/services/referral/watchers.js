import { SET_RESOLVER_DATA, SET_RESOLVER_LOCATION } from 'services/resolver/actions'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_USER_DATA_LANGUAGE } from 'services/user/actions'
import { AUTH_CHANGE_PROFILE, SET_AUTH_LOGIN_SUCCESS } from 'services/auth/actions'
import { isRefer, isReferJoin } from 'services/url'
import { TYPE_LOGIN } from 'services/dialog'
import { Map } from 'immutable'
import _toUpper from 'lodash/toUpper'
import _assign from 'lodash/assign'
import {
  setOverlayDialogVisible,
  setOverlayCloseOnClick,
  setDialogOptions,
} from 'services/dialog/actions'
import * as ACTIONS from './actions'
import * as api from './'

function shouldLoadReferralData ({ state }) {
  const { resolver } = state
  const path = resolver.getIn(['path'])
  return isRefer(path)
}

function shouldLoadReferJoinData ({ state }) {
  const { resolver } = state
  const path = resolver.getIn(['path'])
  return isReferJoin(path)
}

function getReferralDataOrPresentLogin (state, dispatch) {
  const { resolver, auth } = state
  const p = parseInt(resolver.getIn(['query', 'p'], 1), 10)
  const field = resolver.getIn(['query', 'field'], 'createdAt')
  const order = resolver.getIn(['query', 'order'], 'DESC')

  if (auth.get('jwt')) {
    const { getUserReferralData } = ACTIONS
    dispatch(getUserReferralData({ field, order, p }))
    return
  }
  dispatch(setOverlayDialogVisible(TYPE_LOGIN))
  dispatch(setDialogOptions(null, true))
  dispatch(setOverlayCloseOnClick(false))
}

async function getInviteFriendTileData (dispatch, auth, language, rfd) {
  try {
    const result = await api.getInviteFriendTiles(auth, language, rfd)
    dispatch(ACTIONS.setInviteFriendTileData(result))
  } catch (e) {
    // do nothing for now
  }
}

export function pageChangeAndLogin ({ after }) {
  return after([
    SET_AUTH_LOGIN_SUCCESS,
    SET_RESOLVER_LOCATION,
  ], async ({ state, dispatch }) => {
    getReferralDataOrPresentLogin(state, dispatch)
  }).when(shouldLoadReferralData)
}

export function pageMount ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state, prevState }) => {
    const { app } = state
    const { app: prevApp } = prevState
    const bootstrapComplete = app.get('bootstrapComplete')
    const prevBootstrapComplete = prevApp.get('bootstrapComplete')
    if (bootstrapComplete && bootstrapComplete !== prevBootstrapComplete) {
      getReferralDataOrPresentLogin(state, dispatch)
    }
  }).when(shouldLoadReferralData)
}

export function pageUnmount ({ after }) {
  return after(SET_RESOLVER_LOCATION, async ({ dispatch }) => {
    dispatch(ACTIONS.removeUserReferralData())
  }).when(({ prevState, state }) => {
    const prevPath = prevState.resolver.get('path')
    const path = state.resolver.get('path')
    return isRefer(prevPath) && !isRefer(path)
  })
}

export function watchSetInviteFriendReferralData ({ after }) {
  return after(ACTIONS.SHOW_INVITE_FRIEND_POPUP, async ({ dispatch, state }) => {
    const { auth, userReferrals } = state
    const data = userReferrals.getIn(['data'], Map())
    if (auth.get('jwt') && data.size <= 0) {
      const { getUserReferralData } = ACTIONS
      dispatch(getUserReferralData())
    }
  })
}

export function setInviteFriendTileData ({ after }) {
  return after([
    SET_RESOLVER_DATA,
    SET_USER_DATA_LANGUAGE,
  ], async ({ dispatch, state }) => {
    const { auth, user, inboundTracking } = state
    const rfd = inboundTracking.getIn(['data', 'rfd'])
    const language = user.getIn(['data', 'language', 0])
    getInviteFriendTileData(dispatch, auth, language, rfd)
  }).when(shouldLoadReferJoinData)
}

export function inviteFriendTileDataMount ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state, prevState }) => {
    const { auth, user, inboundTracking, app } = state
    const { app: prevApp } = prevState

    const rfd = inboundTracking.getIn(['data', 'rfd'])
    const language = user.getIn(['data', 'language', 0])
    const bootstrapComplete = app.get('bootstrapComplete')
    const prevBootstrapComplete = prevApp.get('bootstrapComplete')

    if (bootstrapComplete && bootstrapComplete !== prevBootstrapComplete) {
      getInviteFriendTileData(dispatch, auth, language, rfd)
    }
  }).when(shouldLoadReferJoinData)
}

export function getReferralData ({ takeMaybe }) {
  return takeMaybe(ACTIONS.GET_USER_REFERRAL_DATA, ({ action, state }) => {
    const { payload = {} } = action
    const { field, order, p } = payload
    const { auth, userReferrals: uf } = state
    const pp = api.REFERRAL_ITEMS_PER_PAGE

    if (!uf.get('data')
      || p !== uf.getIn(['data', 'p'])
      || field !== uf.getIn(['data', 'field'])
      || order !== uf.getIn(['data', 'order'])) {
      return async () => {
        const res = await api.getReferralData({ [field]: _toUpper(order), auth, pp, p })
        return ACTIONS.setUserReferralData(
          _assign({}, payload, { data: res, pp }),
        )
      }
    }
    return null
  })
}

export function watchLogout ({ before }) {
  return before(AUTH_CHANGE_PROFILE, ({ dispatch }) => {
    dispatch(ACTIONS.removeUserReferralData())
  })
}
