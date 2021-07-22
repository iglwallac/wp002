import { RESOLVER_TYPE_COMMUNITY_ACTIVITY } from 'services/resolver/types'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { setJumbotronData } from 'services/jumbotron/actions'
import { STORE_KEY_SUBCATEGORY } from 'services/store-keys'
import { BOOTSTRAP_PHASE_COMPLETE } from 'services/app'
import { SET_AUTH_DATA } from 'services/auth/actions'
import { addToasty } from 'services/toasty/actions'
import { isCommunityPage } from 'services/url'
import { map as bluebirdMap } from 'bluebird'
import capitalize from 'lodash/capitalize'
import startsWith from 'lodash/startsWith'
import { get as getConfig } from 'config'
import { List, fromJS } from 'immutable'
import isString from 'lodash/isString'
import toLower from 'lodash/toLower'
import reduce from 'lodash/reduce'
import set from 'lodash/set'
import get from 'lodash/get'

import * as selectors from './selectors'
import * as actions from './actions'
import * as draft from './draft'
import * as api from './'

/**
 * watcher for Community page visit/load
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

      if (isCommunityPage(pathname)) {
        // sadly, we need to set the static community jumbotron data in the store due to
        // the component requiring the data to be connected,
        // rather than passing the necessary data via prop.
        dispatch(setJumbotronData(STORE_KEY_SUBCATEGORY,
          { description: api.COMMUNITY_PAGE_HERO_TEXT }))
      } else if (type === RESOLVER_TYPE_COMMUNITY_ACTIVITY) {
        const uuid = resolver.getIn(['data', 'params', 'activityId'])
        dispatch(actions.getActivity({ uuid }))
      }
    }
  })
}

/**
 * watcher for getting an activity
 */
export function watchGetActivity ({ after }) {
  return after(actions.COMMUNITY_GET_ACTIVITY,
    async ({ state, dispatch, action }) => {
      const { payload } = action
      const { uuid } = payload
      const { auth } = state

      try {
        const data = await api.getActivity({ uuid, auth })
        dispatch({
          type: actions.COMMUNITY_SET_ACTIVITY,
          payload: { data },
        })
      } catch (error) {
        const data = { errors: [{ status: error.status }] }
        dispatch(addToasty('Could not get activity.'))
        dispatch({
          type: actions.COMMUNITY_SET_ACTIVITY,
          payload: { data },
        })
      }
    })
}

/**
 * watcher for the SET_AUTH_DATA action
 * which fires anytime a login or profile change occurs.
 * for existing logged in users, we hydrate from the server,
 * just like auth and user data, so no need to watch for anything.
 */
export function watchAuthChange ({ after }) {
  return after(SET_AUTH_DATA,
    async ({ state, dispatch, prevState }) => {
      const { auth: prev } = prevState
      const { auth: next, resolver } = state
      const nextUuid = next.get('uuid')
      const prevUuid = prev.get('uuid')
      const type = resolver.getIn(['data', 'type'])
      const pathname = resolver.getIn(['data', 'path'])
      if (getConfig().features.community.v2 && prevUuid !== nextUuid) {
        if (isCommunityPage(pathname)) {
          dispatch(actions.connectFeed({ id: 'main' }))
        } else if (type === RESOLVER_TYPE_COMMUNITY_ACTIVITY) {
          const uuid = resolver.getIn(['data', 'params', 'activityId'])
          dispatch(actions.getActivity({ uuid }))
        }
      }
    })
}

/**
 * watcher for connecting a feed
 */
export function watchConnectFeed ({ after }) {
  return after([
    actions.COMMUNITY_CONNECT_FEED,
  ], async ({ state, action, dispatch }) => {
    const { payload } = action
    const { id } = payload
    const { auth } = state
    const data = await api.connectFeed({ id, auth })
    dispatch({
      type: actions.COMMUNITY_SET_FEED,
      payload: { data, id },
    })
  })
}

/**
 * watcher for fetching a feed activities
 */
export function watchFetchFeedActivities ({ after }) {
  return after([
    actions.COMMUNITY_FETCH_ACTIVITIES,
  ], async ({ state, action, dispatch }) => {
    const { payload } = action
    const { feedId, activityId } = payload
    const { auth } = state
    const data = await api.fetchActivities({ feedId, activityId, auth })
    dispatch({
      type: actions.COMMUNITY_SET_ACTIVITIES,
      payload: { data, feedId },
    })
  })
}

/**
 * watcher for page change away from Community
 * and will cleanup any data we no longer need in the store
 */
export function watchPageUnmount ({ before }) {
  return before(SET_RESOLVER_DATA, async ({ state, action, dispatch }) => {
    const { resolver } = state
    const nextPath = get(action, 'payload.data.path')
    const path = resolver.getIn(['data', 'path'])
    const activityDetailType = resolver.getIn(['data', 'type']) === RESOLVER_TYPE_COMMUNITY_ACTIVITY
    const nextType = startsWith(nextPath, '/community/activity/')
    if ((isCommunityPage(path) && !isCommunityPage(nextPath))
      || (activityDetailType && !nextType)) {
      dispatch(actions.unmountPage())
    }
  })
}

export function watchAddActivity ({ after }) {
  return after(
    actions.COMMUNITY_ADD_ACTIVITY,
    async ({ state, action, dispatch }) => {
      const { community, auth, resolver } = state
      const { payload } = action
      const { draftId, feedId } = payload
      const activity = selectors.selectDraft(community, draftId)
      const type = resolver.getIn(['data', 'type'])
      const pathname = resolver.getIn(['data', 'path'])

      if (activity.get('processing')) {
        return
      }

      dispatch(actions.setDraft(
        draftId, draft.setProcessing(activity, true)))

      try {
        // later will take id for feed (we may have more than main)
        const response = await api.addActivity({ auth, activity })
        if (response && global.dataLayer) {
          global.dataLayer.push({
            event: 'customEvent',
            eventCategory: 'community',
            eventAction: 'post',
            eventLabel: response.uuid,
          })
        }

        dispatch(addToasty(`${capitalize(activity.get('type'))} successfully created!`))
        dispatch(actions.deleteDraft(draftId))
        if (isCommunityPage(pathname)) {
          dispatch(actions.fetchActivities({ feedId }))
        } else if (type === RESOLVER_TYPE_COMMUNITY_ACTIVITY) {
          const uuid = resolver.getIn(['data', 'params', 'activityId'])
          dispatch(actions.getActivity({ uuid }))
        }
      } catch (error) {
        const status413 = error.status === 413
        const errorMessage = `Could not create ${toLower(activity.get('type'))}.${status413
          ? ' Max payload size exceeded.'
          : ''}`
        dispatch(addToasty(errorMessage))
        dispatch(actions.setDraft(
          draftId, draft.setProcessing(activity, false)))
      }
    })
}


export function watchRemoveActivity ({ after }) {
  return after(
    actions.COMMUNITY_REMOVE_ACTIVITY,
    async ({ state, action, dispatch }) => {
      const { payload } = action
      const { auth, resolver } = state
      const { activityId, type, feedId } = payload
      const resolverType = resolver.getIn(['data', 'type'])
      const pathname = resolver.getIn(['data', 'path'])
      try {
        await api.removeActivity({
          activityId,
          auth,
        })
        dispatch(addToasty(`${toLower(type)} successfully deleted!`))
        if (isCommunityPage(pathname)) {
          dispatch(actions.fetchActivities({ feedId }))
        } else if (resolverType === RESOLVER_TYPE_COMMUNITY_ACTIVITY) {
          const uuid = resolver.getIn(['data', 'params', 'activityId'])
          dispatch(actions.getActivity({ uuid }))
        }
      } catch (_) {
        dispatch(addToasty(`Could not delete ${toLower(type)}.`))
      }
    })
}

export function watchAddReaction ({ after }) {
  return after(
    actions.COMMUNITY_ADD_REACTION,
    async ({ state, action, dispatch }) => {
      const { auth, resolver } = state
      const { payload } = action
      const { uuid, type, feedId } = payload
      const resolverType = resolver.getIn(['data', 'type'])
      const pathname = resolver.getIn(['data', 'path'])

      try {
        const response = await api.addReaction({ auth, activity: uuid, type })
        if (response && global.dataLayer) {
          global.dataLayer.push({
            event: 'customEvent',
            eventCategory: 'community',
            eventAction: 'favorite',
            eventLabel: response.uuid,
          })
        }

        dispatch(addToasty('Reaction successfully created!'))
        if (isCommunityPage(pathname)) {
          dispatch(actions.fetchActivities({ feedId }))
        } else if (resolverType === RESOLVER_TYPE_COMMUNITY_ACTIVITY) {
          const activityUuid = resolver.getIn(['data', 'params', 'activityId'])
          dispatch(actions.getActivity({ uuid: activityUuid }))
        }
      } catch (_) {
        dispatch(addToasty('Could not create reaction.'))
      }
    })
}

export function watchRemoveReaction ({ after }) {
  return after(
    actions.COMMUNITY_REMOVE_REACTION,
    async ({ state, action, dispatch }) => {
      const { payload } = action
      const { auth, resolver } = state
      const { activityUuid, feedId } = payload
      const type = resolver.getIn(['data', 'type'])
      const pathname = resolver.getIn(['data', 'path'])
      try {
        await api.removeReaction({
          activityUuid,
          auth,
        })
        dispatch(addToasty('Reaction successfully deleted!'))
        if (isCommunityPage(pathname)) {
          dispatch(actions.fetchActivities({ feedId }))
        } else if (type === RESOLVER_TYPE_COMMUNITY_ACTIVITY) {
          const uuid = resolver.getIn(['data', 'params', 'activityId'])
          dispatch(actions.getActivity({ uuid }))
        }
      } catch (_) {
        dispatch(addToasty('Could not delete reaction.'))
      }
    })
}

export function watchUpdateDraft ({ after }) {
  return after(
    actions.COMMUNITY_UPDATE_DRAFT,
    async ({ state, action, dispatch }) => {
      const { payload } = action
      const { community } = state
      const { draftId, attributes } = payload
      const { parent, openGraph, photoUpload, photos, type, value } = attributes
      const prev = selectors.selectDraft(community, draftId, parent, type)
      const activityDraft = prev.withMutations((d) => {
        draft.setValue(d, value)
      })

      dispatch(actions.setDraft(
        draftId, activityDraft))

      if (photoUpload && photos && photos.length) {
        dispatch(actions.addDraftPhotos(
          draftId, { photos }))
      }

      if (openGraph && isString(value)) {
        dispatch(actions.addDraftOpenGraphs(
          draftId, { type, value }))
      }
    })
    .catch(() => (
      addToasty('Unable to upload files.')
    ))
}

export function watchDraftOpenGraph ({ after }) {
  let timer
  return after(
    actions.COMMUNITY_ADD_DRAFT_OPENGRAPHS,
    async ({ action, dispatch, getState }) => {
      const { payload } = action
      const { draftId, value } = payload

      if (isString(value)) {
        const { community, auth } = getState()
        let workingDraft = selectors.selectDraft(community, draftId)
        const prevOGs = selectors.selectDraftOpengraphs(workingDraft)

        if (value.length < 1) { // allows deleting text while keeping ogs
          const filteredOGs = prevOGs.filter(og => (
            og.get('render') && og.get('valid')
          ))
          workingDraft = draft.setAttachments(workingDraft, 'opengraph', filteredOGs)
          dispatch(actions.setDraft(draftId, workingDraft))
          return
        }

        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        const matches = api.parseURLs(value)
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

        const ungraphedURLs = reduce(matches, (acc, match) => {
          const existing = prevOGs.find(u => u.get('source') === match.source)
          if (existing && !existing.get('verified')) {
            set(match, 'id', existing.get('id'))
            acc.push(match)
          } else if (!existing) {
            acc.push(match)
          }
          return acc
        }, [])
        workingDraft = workingDraft.withMutations((d) => {
          draft.setProcessing(d, ungraphedURLs.length > 0)
          draft.setAttachments(d, 'opengraph', nextOGs)
        })

        dispatch(actions.setDraft(
          draftId, workingDraft))

        if (ungraphedURLs.length) {
          timer = setTimeout(async () => {
            const graphs = await api.openGraph({
              urls: [].concat(ungraphedURLs),
              auth,
            })

            const { community: nextState } = getState()
            workingDraft = selectors.selectDraft(nextState, draftId)
            workingDraft = workingDraft.withMutations((d) => {
              draft.mergeAttachments(d, 'opengraph', graphs)
              const ogs = selectors.selectDraftOpengraphs(d)
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

              draft.setAttachments(d, 'opengraph', uniqueOGs)
              draft.setProcessing(d, false)
              draft.setObject(d)
            })
            dispatch(actions.setDraft(
              draftId, workingDraft))
          }, 500)
        }
      }
    })
}


export function watchAddDraftPhotos ({ after }) {
  return after(
    actions.COMMUNITY_ADD_DRAFT_PHOTOS,
    async ({ action, getState, dispatch }) => {
      const { payload } = action
      const { draftId, photos } = payload

      if (photos.length) {
        const { community } = getState()

        let workingDraft = selectors.selectDraft(community, draftId)

        const images = await bluebirdMap(photos, async photo => (
          api.createDataUri(photo)
        ))

        workingDraft = workingDraft.withMutations((d) => {
          draft.addAttachments(d, 'images', images)
        })

        dispatch(actions.setDraft(
          draftId, workingDraft))
      }
    })
}

export function watchDeleteDraftOpenGraph ({ after }) {
  return after(
    actions.COMMUNITY_DELETE_DRAFT_OPENGRAPH,
    async ({ action, state, dispatch }) => {
      const { payload } = action
      const { community } = state
      const { draftId, graphId } = payload
      const workingDraft = selectors.selectDraft(community, draftId)

      if (workingDraft) {
        const graphs = selectors.selectDraftOpengraphs(workingDraft)
        const nextGraphs = graphs.map((graph) => {
          const id = graph.get('id')
          if (id === graphId) {
            return graph.set('render', false)
          }
          return graph
        })
        const nextDraft = workingDraft.withMutations((d) => {
          draft.setAttachments(d, 'opengraph', nextGraphs)
          draft.setObject(d)
        })
        dispatch(actions.setDraft(draftId, nextDraft))
      }
    })
}

export function watchDeleteDraftAttachment ({ after }) {
  return after(
    actions.COMMUNITY_DELETE_DRAFT_ATTACHMENT,
    async ({ state, action, dispatch }) => {
      const { payload } = action
      const { community } = state
      const { draftId, attachmentId, path } = payload

      const activity = selectors.selectDraft(community, draftId)
      const next = draft.deleteAttachment(activity, path, attachmentId)

      dispatch(actions.setDraft(
        draftId, draft.setObject(next)))
    })
    .catch(() => {
      /* silent fail */
    })
}

