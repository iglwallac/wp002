import get from 'lodash/get'
import reduce from 'lodash/reduce'
import filter from 'lodash/filter'
import toLower from 'lodash/toLower'
import isString from 'lodash/isString'
import { List, fromJS } from 'immutable'
import { get as getConfig } from 'config'
import { isCommunityPage } from 'services/url'
import { addToasty } from 'services/toasty/actions'
import { SET_AUTH_DATA } from 'services/auth/actions'
import { BOOTSTRAP_PHASE_COMPLETE } from 'services/app'
import { STORE_KEY_SUBCATEGORY } from 'services/store-keys'
import { setJumbotronData } from 'services/jumbotron/actions'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { RESOLVER_TYPE_COMMUNITY_ACTIVITY } from 'services/resolver/types'
import { selectDraft, selectAuth, selectFeed, selectActivity, selectActivityOGs } from './selectors'
import { toJS as toJSActivity, ACTIVITY } from './activity'
import { toJS as toJSReaction, REACTION } from './reaction'

import {
  getActivityReactions as getActivityReactionsAction,
  GETSTREAM_GET_ACTIVITY_REACTIONS_REQUEST,
  GETSTREAM_GET_ACTIVITY_REACTIONS_SUCCESS,
  GETSTREAM_GET_ACTIVITY_REACTIONS_ERROR,
  GETSTREAM_DO_CHILD_REACTION_REQUEST,
  GETSTREAM_GET_NOTIFICATIONS_REQUEST,
  GETSTREAM_GET_NOTIFICATIONS_SUCCESS,
  GETSTREAM_DELETE_DRAFT_ATTACHMENT,
  GETSTREAM_SET_NOTIFICATIONS_SEEN,
  GETSTREAM_PUT_NOTIFICATIONS_SEEN,
  GETSTREAM_SET_NOTIFICATION_READ,
  GETSTREAM_DELETE_DRAFT_OPENGRAPH,
  GETSTREAM_PUT_NOTIFICATION_READ,
  GETSTREAM_ADD_DRAFT_OPENGRAPHS,
  GETSTREAM_ADD_DRAFT_PHOTOS,
  GETSTREAM_REMOVE_REACTION,
  GETSTREAM_REMOVE_ACTIVITY,
  GETSTREAM_CREATE_SESSION,
  GETSTREAM_ADD_REACTION,
  GETSTREAM_ADD_ACTIVITY,
  GETSTREAM_UPDATE_DRAFT,
  GETSTREAM_GET_ACTIVITY,
  GETSTREAM_SET_SESSION,
  getActivityReactions,
  GETSTREAM_GET_FEED,
  addDraftOpenGraphs,
  addDraftPhotos,
  createSession,
  putActivity,
  getActivity,
  unmountPage,
  deleteDraft,
  putDraft,
  getFeed,
  putFeed,
} from './actions'

import {
  getDraftType,
  setText,
  setData,
  setVerb,
  FORM_TYPES,
  setKind,
  setActivityId,
  setTargetFeeds,
  mergeAttachments,
  deleteAttachment,
  addAttachments,
  setPhotosProcessing,
  setAttachments,
  setProcessing,
  // updateDraft,
  createDraft,
  setObject,
} from './draft'

import {
  createSession as apiCreateSession,
  getActivity as apiGetActivity,
  getActivityReactionsRequest,
  toggleChildReactionRequest,
  openGraph as apiOpenGraph,
  COMMUNITY_PAGE_HERO_TEXT,
  getFeed as apiGetFeed,
  setNotificationsSeen,
  setNotificationRead,
  getNotifications,
  removeActivity,
  removeReaction,
  addReaction,
  addActivity,
  uploadFiles,
  removeFiles,
  FEED_TYPES,
  parseURLs,
  prepFiles,
} from './'

/**
 * watchest for Community page visit/load
 * to fetch the main feed data
 */
export function watchPageMount ({ after }) {
  return after([
    SET_APP_BOOTSTRAP_PHASE,
    SET_RESOLVER_DATA,
  ], async ({ state, dispatch }) => {
    const { app, resolver } = state
    if (app.get('bootstrapPhase') === BOOTSTRAP_PHASE_COMPLETE) {
      const type = resolver.getIn(['data', 'type'])
      const pathname = resolver.getIn(['data', 'path'])
      // if (!getConfig().features.community.v2) {
      if (isCommunityPage(pathname)) {
        // sadly, we need to set the static community jumbotron data in the store due to
        // the component requiring the data to be connected,
        // rather than passing the necessary data via prop.
        dispatch(setJumbotronData(STORE_KEY_SUBCATEGORY,
          { description: COMMUNITY_PAGE_HERO_TEXT }))
        dispatch(getFeed({ type: FEED_TYPES.MAIN, key: 'main' }))
      } else if (type === RESOLVER_TYPE_COMMUNITY_ACTIVITY) {
        const id = resolver.getIn(['data', 'params', 'activityId'])
        dispatch(getActivity({ id }))
      }
      // }
    }
  })
}

/**
 * watchest for page change away from Community
 * and will cleanup any data we no longer need in the store
 */
export function watchPageUnmount ({ before }) {
  return before(SET_RESOLVER_DATA, async ({ state, action, dispatch }) => {
    const { resolver } = state
    const next = get(action, 'payload.data.path')
    const path = resolver.getIn(['data', 'path'])
    if (isCommunityPage(path)
      && !isCommunityPage(next)) {
      dispatch(unmountPage())
    }
  })
}

/**
 * watchest for the SET_AUTH_DATA action
 * which fires anytime a login or profile change occurs.
 * for existing logged in users, we hydrate from the server,
 * just like auth and user data, so no need to watch for anything.
 */
export function watchAuthChange ({ after }) {
  return after(SET_AUTH_DATA,
    async ({ state, dispatch, prevState }) => {
      const { auth: prev } = prevState
      const { auth: next } = state
      const nextUuid = next.get('uuid')
      const prevUuid = prev.get('uuid')
      if (!getConfig().features.community.v2 && prevUuid !== nextUuid) {
        dispatch(createSession(next))
      }
    })
}

/**
 * watchest for the GETSTREAM_CREATE_SESSION action
 * and creates a Getsream user and auth token in response.
 * If there is a current session in progress, we end the session first.
 */
export function watchCreateSession ({ after }) {
  return after(GETSTREAM_CREATE_SESSION,
    async ({ action, dispatch }) => {
      const auth = get(action, 'payload.auth')
      const jwt = auth.get('jwt')
      const data = await apiCreateSession(jwt)
      dispatch({
        type: GETSTREAM_SET_SESSION,
        payload: data,
      })
    })
}

/**
 * watchest for the GETSTREAM_GET_FEED action
 * and fetches feed meta data
 */
export function watchGetFeed ({ after }) {
  return after(GETSTREAM_GET_FEED, async ({ state, action, dispatch }) => {
    const { getstream } = state
    const key = get(action, 'payload.key')
    const feed = selectFeed(getstream, key)
    if (!feed.get('id')) {
      const { auth } = state
      const jwt = auth.get('jwt')
      const type = get(action, 'payload.type')
      const data = await apiGetFeed({ auth: jwt, type })
      dispatch(putFeed({ key, data }))
    }
  })
}

export function doToggleChildReaction ({ takeEvery }) {
  return takeEvery(
    GETSTREAM_DO_CHILD_REACTION_REQUEST,
    async ({ state, action }) => {
      const { payload } = action
      const { kind, reaction } = payload
      const token = selectAuth(state.getstream)
      const response = await toggleChildReactionRequest({
        apiKey: token.get('apiKey'),
        userId: token.get('userId'),
        appId: token.get('appId'),
        token: token.get('token'),
        reaction,
        kind,
      })
      if (response.error) {
        return {
          type: GETSTREAM_GET_ACTIVITY_REACTIONS_ERROR,
          payload: response,
        }
      }
      if (response && global.dataLayer) {
        global.dataLayer.push({
          event: 'customEvent',
          eventCategory: 'community',
          eventAction: 'favorite',
          eventLabel: reaction.id, // comments id, not likes own id
        })
      }
      return {
        type: GETSTREAM_GET_ACTIVITY_REACTIONS_SUCCESS,
        payload: { activity: response.activity, results: response.results.reverse() },
      }
    })
}

export function watchGetActivityReactions ({ takeEvery }) {
  return takeEvery(
    GETSTREAM_GET_ACTIVITY_REACTIONS_REQUEST,
    async ({ state, action }) => {
      const { payload } = action
      const { activityId, type } = payload
      const token = selectAuth(state.getstream)
      const response = await getActivityReactionsRequest({
        apiKey: token.get('apiKey'),
        appId: token.get('appId'),
        token: token.get('token'),
        kind: type,
        activityId,
      })
      if (response.error) {
        return {
          type: GETSTREAM_GET_ACTIVITY_REACTIONS_ERROR,
          payload: response,
        }
      }
      return {
        type: GETSTREAM_GET_ACTIVITY_REACTIONS_SUCCESS,
        payload: { activity: response.activity, results: response.results.reverse() },
      }
    })
}

/**
 * watchest for the GETSTREAM_GET_ACTIVITY action
 * to fetch an activity details. This does not currently include reactions.
 */
export function watchGetActivity ({ after }) {
  return after(
    GETSTREAM_GET_ACTIVITY,
    async ({ state, action, dispatch }) => {
      const token = selectAuth(state.getstream)
      const activityId = get(action, 'payload.id')
      const existing = selectActivity(state.getstream, activityId)
      // activities are not currently immutable
      if (!existing.id) {
        const activity = await apiGetActivity({
          apiKey: token.get('apiKey'),
          appId: token.get('appId'),
          token: token.get('token'),
          activityId,
        })
        dispatch(putActivity(
          activityId, activity))
      }
    })
}

export function watchAddActivity ({ after }) {
  return after(
    GETSTREAM_ADD_ACTIVITY,
    async ({ state, action, dispatch }) => {
      const { getstream } = state
      const { payload } = action
      const { feedGroup, draftId, feedId } = payload
      const activity = selectDraft(getstream, draftId, ACTIVITY)
      const jwt = selectAuth(getstream)
      const verb = activity.get('verb')

      if (activity.get('processing')) {
        return
      }

      dispatch(putDraft(
        draftId, setProcessing(activity, true)))

      try {
        const response = await addActivity({
          activity: toJSActivity(activity),
          apiKey: jwt.get('apiKey'),
          token: jwt.get('token'),
          appId: jwt.get('appId'),
          feedGroup,
          feedId,
        })
        if (response && global.dataLayer) {
          global.dataLayer.push({
            event: 'customEvent',
            eventCategory: 'community',
            eventAction: 'post',
            eventLabel: response.id,
          })
        }
        dispatch(addToasty(`${verb} successfully created!`))
        dispatch(deleteDraft(draftId))
      } catch (_) {
        dispatch(addToasty(`Could not create ${verb}.`))
        dispatch(putDraft(
          draftId, setProcessing(activity, false)))
      }
    })
}

export function watchAddReaction ({ after }) {
  return after(
    GETSTREAM_ADD_REACTION,
    async ({ state, action, dispatch }) => {
      const { getstream } = state
      const { payload } = action
      const { draftId } = payload
      const reaction = selectDraft(getstream, draftId, REACTION)
      const activityId = reaction.get('activityId')
      const kind = reaction.get('kind')
      const jwt = selectAuth(getstream)

      if (reaction.get('processing')) {
        return
      }

      dispatch(putDraft(
        draftId, setProcessing(reaction, true)))


      try {
        const response = await addReaction({
          reaction: toJSReaction(reaction),
          apiKey: jwt.get('apiKey'),
          token: jwt.get('token'),
          appId: jwt.get('appId'),
        })
        if (response && global.dataLayer) {
          global.dataLayer.push({
            event: 'customEvent',
            eventCategory: 'community',
            eventAction: 'reply',
            eventLabel: response.id,
          })
        }
        dispatch(getActivityReactionsAction({ activityId, type: kind }))
        dispatch(deleteDraft(draftId))
        dispatch(addToasty(`${toLower(kind)} successfully created!`))
      } catch (_) {
        dispatch(addToasty(`Could not create ${toLower(kind)}.`))
        dispatch(putDraft(
          draftId, setProcessing(reaction, false)))
      }
    })
}

export function watchRemoveActivity ({ after }) {
  return after(
    GETSTREAM_REMOVE_ACTIVITY,
    async ({ state, action, dispatch }) => {
      const { payload } = action
      const { getstream } = state
      const { activity, feedGroup, feedId } = payload
      const jwt = selectAuth(getstream)
      const apiKey = jwt.get('apiKey')
      const token = jwt.get('token')
      const appId = jwt.get('appId')

      try {
        await removeActivity({
          activityId: activity.id,
          feedGroup,
          feedId,
          apiKey,
          token,
          appId,
        })
        dispatch(addToasty(`${toLower(activity.verb)} successfully deleted!`))
      } catch (_) {
        dispatch(addToasty(`Could not delete ${toLower(activity.verb)}.`))
      }
    })
}

export function watchRemoveReaction ({ after }) {
  return after(
    GETSTREAM_REMOVE_REACTION,
    async ({ state, action, dispatch }) => {
      const { payload } = action
      const { getstream } = state
      const { activity, userReaction } = payload
      const jwt = selectAuth(getstream)
      const apiKey = jwt.get('apiKey')
      const token = jwt.get('token')
      const appId = jwt.get('appId')

      try {
        await removeReaction({
          userReaction,
          apiKey,
          token,
          appId,
        })
        dispatch(getActivityReactions({ activityId: activity.id, type: 'comment' }))
        dispatch(addToasty(`${toLower(userReaction.kind)} successfully deleted!`))
      } catch (_) {
        dispatch(addToasty(`Could not delete ${toLower(userReaction.kind)}.`))
      }
    })
}

export function watchUpdateDraft ({ after }) {
  return after(
    GETSTREAM_UPDATE_DRAFT,
    async ({ state, action, dispatch }) => {
      const { payload } = action
      const { getstream } = state
      const { draftId, attributes } = payload
      const { activityId, openGraph, photos, kind, verb, text } = attributes
      const type = kind || verb

      const fallback = createDraft(type)
      const prev = selectDraft(getstream, draftId, fallback)

      const draft = prev.withMutations((d) => {
        const isReaction = getDraftType(type) === FORM_TYPES.REACTION
        setTargetFeeds(d, attributes.targetFeeds)
        setText(d, text)
        if (isReaction) {
          setActivityId(d, activityId)
          setKind(d, kind)
          setData(d)
        } else {
          setVerb(d, verb)
        }
        setObject(d)
      })

      dispatch(putDraft(
        draftId, draft))

      if (photos && photos.length) {
        dispatch(addDraftPhotos(
          draftId, { type, photos }))
      }

      if (openGraph && isString(text)) {
        dispatch(addDraftOpenGraphs(
          draftId, { type, text }))
      }
    })
    .catch(() => (
      addToasty('Unable to upload files.')
    ))
}

export function watchDraftOpenGraph ({ after }) {
  return after(
    GETSTREAM_ADD_DRAFT_OPENGRAPHS,
    async ({ action, dispatch, getState }) => {
      const { payload } = action
      const { type, draftId, text } = payload

      if (isString(text)) {
        const fallback = createDraft(type)
        const { getstream } = getState()

        let draft = selectDraft(getstream, draftId, fallback)
        const prevOGs = selectActivityOGs(draft)

        if (text.length < 1) {
          const filteredOGs = prevOGs.filter(og => (
            og.get('render') && og.get('valid')
          ))
          draft = setAttachments(draft, 'og', filteredOGs)
          dispatch(putDraft(draftId, draft))
          return
        }

        const matches = parseURLs(text)
        const nextOGs = reduce(matches, (out, match) => {
          const src = get(match, 'source')
          const prev = prevOGs.find(u => (
            u.get('source') === src
          ))
          if (prev) {
            const locs = get(match, 'locations')
            const next = prev.set('locations', fromJS(locs))
            out.push(next)
          } else {
            out.push(match)
          }
          return out
        }, [])
        const ungraphedURLs = filter(matches, ({ source }) => (
          !prevOGs.find(u => u.get('source') === source)
        ))
        draft = draft.withMutations((d) => {
          setProcessing(d, ungraphedURLs.length > 0)
          setAttachments(d, 'og', nextOGs)
        })

        dispatch(putDraft(
          draftId, draft))

        if (ungraphedURLs) {
          const jwt = selectAuth(getstream)
          const graphs = await apiOpenGraph({
            apiKey: jwt.get('apiKey'),
            token: jwt.get('token'),
            appId: jwt.get('appId'),
            urls: ungraphedURLs,
          })
          const { getstream: nextState } = getState()
          draft = selectDraft(nextState, draftId, fallback)
          draft = draft.withMutations((d) => {
            mergeAttachments(d, 'og', graphs)
            const ogs = selectActivityOGs(d)
            const uniqueOGs = ogs.reduce((out, og) => {
              const url = og.get('url')
              const index = out.findIndex(o => o.get('url') === url)
              if (index > -1) {
                const existing = out.get(index)
                const locations = existing.get('locations', List())
                const nextLocations = locations.concat(
                  og.get('locations'))
                const next = existing.set('locations', nextLocations)
                return out.set(index, next)
              }
              return out.push(og)
            }, List())
            setAttachments(d, 'og', uniqueOGs)
            setProcessing(d, false)
            setObject(d)
          })
          dispatch(putDraft(
            draftId, draft))
        }
      }
    })
}

export function watchAddDraftPhotos ({ after }) {
  return after(
    GETSTREAM_ADD_DRAFT_PHOTOS,
    async ({ action, getState, dispatch }) => {
      const { payload } = action
      const { type, draftId, photos: files } = payload
      const photos = prepFiles(files)

      if (photos.length) {
        const { getstream } = getState()
        const jwt = selectAuth(getstream)
        const fallback = createDraft(type)

        let draft = selectDraft(getstream, draftId, fallback)

        draft = draft.withMutations((d) => {
          addAttachments(d, 'images', photos)
          setPhotosProcessing(d)
        })

        dispatch(putDraft(
          draftId, draft))

        const uploads = await uploadFiles({
          apiKey: jwt.get('apiKey'),
          token: jwt.get('token'),
          appId: jwt.get('appId'),
          files: photos,
        })
        // get the most recent state of the store
        // we don't want to use the previous state variable
        // because it could be out of sync
        const { getstream: nextState } = getState()
        draft = selectDraft(nextState, draftId, fallback)
        draft = draft.withMutations((d) => {
          mergeAttachments(d, 'images', uploads)
          setPhotosProcessing(d)
          setObject(d)
        })
        dispatch(putDraft(
          draftId, draft))
      }
    })
}

export function watchDeleteDraftOpenGraph ({ after }) {
  return after(
    GETSTREAM_DELETE_DRAFT_OPENGRAPH,
    async ({ action, state, dispatch }) => {
      const { payload } = action
      const { getstream } = state
      const { draftId, graphId } = payload
      const draft = selectDraft(getstream, draftId)

      if (draft) {
        const graphs = selectActivityOGs(draft)
        const nextGraphs = graphs.map((graph) => {
          const id = graph.get('id')
          if (id === graphId) {
            return graph.set('render', false)
          }
          return graph
        })
        const nextDraft = draft.withMutations((d) => {
          setAttachments(d, 'og', nextGraphs)
          setObject(d)
        })
        dispatch(putDraft(draftId, nextDraft))
      }
    })
}

export function watchDeleteDraftAttachment ({ after }) {
  return after(
    GETSTREAM_DELETE_DRAFT_ATTACHMENT,
    async ({ state, action, dispatch }) => {
      const { payload } = action
      const { getstream } = state
      const { draftId, attachmentId, path, src } = payload

      const jwt = selectAuth(getstream)
      const activity = selectDraft(getstream, draftId, ACTIVITY)
      const next = deleteAttachment(activity, path, attachmentId)

      dispatch(putDraft(
        draftId, setObject(next)))

      await removeFiles({
        apiKey: jwt.get('apiKey'),
        token: jwt.get('token'),
        appId: jwt.get('appId'),
        files: [{ file: src }],
      })
    })
    .catch(() => {
      /* silent fail */
    })
}

export function watchGetNotifications ({ takeEvery }) {
  return takeEvery(
    GETSTREAM_GET_NOTIFICATIONS_REQUEST,
    async ({ state }) => {
      const { auth } = state
      const response = await getNotifications({ auth })
      if (response.error) {
        addToasty(`Unable to get getstream notifications, message: ${response.error.message}`)
      }
      return {
        type: GETSTREAM_GET_NOTIFICATIONS_SUCCESS,
        payload: { results: response.results, unseen: response.unseen, unread: response.unread },
      }
    })
}

export function watchSetNotificationsSeen ({ takeEvery }) {
  return takeEvery(
    GETSTREAM_SET_NOTIFICATIONS_SEEN,
    async ({ state }) => {
      const { getstream } = state
      const jwt = selectAuth(getstream)
      const response = await setNotificationsSeen({
        feedId: getstream.getIn(['auth', 'userId']),
        apiKey: jwt.get('apiKey'),
        token: jwt.get('token'),
        appId: jwt.get('appId'),
      })
      if (response.error) {
        addToasty(`Unable to mark notifications seen, message: ${response.error.message}`)
      }
      return {
        type: GETSTREAM_PUT_NOTIFICATIONS_SEEN,
        // cannot replace results that come from getstream because of the post-processing we do
        // ie: the stuff that lives in brooklyn.
        payload: { unseen: response.unseen, unread: response.unread },
      }
    })
}

export function watchSetNotificationsRead ({ takeEvery }) {
  return takeEvery(
    GETSTREAM_SET_NOTIFICATION_READ,
    async ({ state, action }) => {
      const { getstream } = state
      const { payload } = action
      const jwt = selectAuth(getstream)
      const response = await setNotificationRead({
        feedId: getstream.getIn(['auth', 'userId']),
        apiKey: jwt.get('apiKey'),
        token: jwt.get('token'),
        appId: jwt.get('appId'),
        notificationId: payload.notificationId,
      })
      if (response.error) {
        addToasty(`Unable to mark notification read, message: ${response.error.message}`)
      }
      return {
        type: GETSTREAM_PUT_NOTIFICATION_READ,
        payload: {
          notificationId: payload.notificationId,
          unread: response.unread,
        },
      }
    })
}
