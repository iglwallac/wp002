/* eslint-disable no-template-curly-in-string */
/* eslint-disable import/prefer-default-export */
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_RESOLVER_LOCATION } from 'services/resolver/actions'
import { isContentPreferences } from 'services/url'
import { addToasty } from 'services/toasty/actions'
import { EN } from 'services/languages/constants'
import { getPrimary } from 'services/languages'
import { fromJS, Map, List } from 'immutable'
import * as actions from './actions'
import * as api from '.'

function isContentPreferencesPage ({ state }) {
  const { resolver } = state
  return isContentPreferences(resolver.get('path'))
}

// -----------------------------------
// Watcher for componentDidMount/DidUpdate
// -----------------------------------
export function getHiddenContentPreferences ({ after }) {
  return after(
    [
      SET_APP_BOOTSTRAP_PHASE,
      SET_RESOLVER_LOCATION,
      actions.GET_HIDDEN_CONTENT,
    ], async ({ action, dispatch, state }) => {
      const { payload } = action
      const { p, pp } = payload
      const { auth } = state
      let options = { auth }


      if (p && pp) {
        options = { auth, p, pp }
      } else {
        options = { auth, p: 0, pp: api.PP_DEFAULT }
      }
      const data = fromJS(await api.getUserHiddenContent(options))
      dispatch({
        type: actions.SET_HIDDEN_CONTENT,
        payload: data,
      })
    })
    .when(isContentPreferencesPage)
}

// -----------------------------------
// Watcher for post
// -----------------------------------
export function postHiddenContentPreferences ({ takeEvery }) {
  return takeEvery(actions.HIDE_CONTENT, async ({ action, state }) => {
    const { auth } = state
    const content = action.payload
    const result = await api.postHiddenContent(content, auth)
    const { data: resData, _dataError: error } = result
    return {
      type: actions.SET_HIDDEN_CONTENT_ADD,
      payload: {
        error,
        data: fromJS(resData),
      },
    }
  })
}

export function watchHiddenContentActivity ({ after }) {
  return after(actions.SET_HIDDEN_CONTENT_ADD,
    async ({ state, action, dispatch }) => {
      const { payload } = action
      const { data } = payload
      const { videos, user, staticText } = state
      const contentId = data.get('contentId')
      const userLanguage = getPrimary(user.getIn(['data', 'language'], List([EN])))
      let contentTitle = videos.getIn([contentId, userLanguage, 'data', 'title'])
      if (!contentTitle) {
        contentTitle = staticText.getIn(['data', 'myAccountSettingsV2', 'data', 'thisContent'])
      }
      const message = staticText.getIn(
        ['data', 'myAccountSettingsV2', 'data', 'hideContentConfirmation'],
      ).replace('${ contentTitle }', contentTitle)
      dispatch(addToasty(message))
    })
}

// -----------------------------------
// Watcher for delete
// -----------------------------------
export function deleteHiddenContentPreferences ({ takeEvery }) {
  return takeEvery(actions.UNHIDE_CONTENT, async ({ action, state }) => {
    const { auth } = state
    const { id, contentId } = action.payload
    await api.deleteHiddenContent(id, auth)

    return {
      type: actions.SET_HIDDEN_CONTENT_REMOVE,
      payload: { contentId },
    }
  })
}

export function setHiddenContentPreferenceProcessing ({ takeEvery }) {
  return takeEvery([actions.HIDE_CONTENT, actions.UNHIDE_CONTENT], async ({ action }) => {
    const contentId = action.payload.contentId
    return {
      type: actions.SET_HIDDEN_CONTENT_PROCESSING,
      payload: { processing: true, contentId },
    }
  })
}

export function removeHiddenContentPreferenceProcessing ({ takeEvery }) {
  return takeEvery([
    actions.SET_HIDDEN_CONTENT_REMOVE, actions.SET_HIDDEN_CONTENT_ADD], async ({ action }) => {
    const { data = Map() } = action.payload
    const contentId = action.payload.contentId || data.get('contentId')
    return {
      type: actions.SET_HIDDEN_CONTENT_PROCESSING,
      payload: { processing: false, contentId },
    }
  })
}

