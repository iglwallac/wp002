import { Map } from 'immutable'
import forEach from 'lodash/forEach'
import _replace from 'lodash/replace'
import get from 'lodash/get'
import pick from 'lodash/pick'
import truncate from 'lodash/truncate'
import { addToasty } from 'services/toasty/actions'
import { setPortalPlaylistData } from 'services/portal/actions'
import { getPrimary as getPrimaryLanguage } from 'services/languages'
import { getNodes } from 'services/node'
import { TYPE_PLAYLIST, TYPE_WATCH_HISTORY, DEFAULT_LIMIT } from 'services/tiles'
import {
  getTilesData,
  getTilesPageData,
  appendTilesDataPlaceholderTitles,
  deleteTilesDataById,
} from 'services/tiles/actions'
import {
  setOverlayDialogVisible,
  setDialogOptions,
  setOverlayCloseOnClick,
  dismissModal,
  RENDER_MODAL,
} from 'services/dialog/actions'
import { TYPE_LOGIN, TYPE_USER_PLAYLIST_ADD } from 'services/dialog'
import {
  saveHideWatched,
} from 'services/hide-watched/actions'
import {
  getHideWatchQueueIds,
} from 'services/hide-watched'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { getAuthIsLoggedIn } from 'services/auth'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { RESOLVER_TYPE_PLAYLIST } from 'services/resolver/types'
import { SET_AUTH_LOGIN_SUCCESS } from 'services/auth/actions'
import { get as getConfig } from 'config'
import { pushHistory } from 'services/navigation/actions'
import { URL_PLAYLIST_WATCH_LATER } from 'services/url/constants'
import {
  BASE_PLAYLISTS,
  getAllUserPlaylists,
  getPlaylistTileStoreKey,
  getPlaylistItem,
  PLAYLIST_PORTAL_LIMIT,
  PLAYLIST_TYPE_HISTORY,
  updatePlaylist,
  updatePlaylistItem,
  createUserPlaylist,
  PLAYLIST_ERROR_EXISTING,
  getDeleteQueueIds,
  deleteItemsFromPlaylist,
  deletePlaylist,
  PLAYLIST_TYPE_DEFAULT,
  renamePlaylist,
} from './'
import {
  GET_USER_PLAYLISTS_TILE_DATA_LOAD_MORE,
  PLAYLIST_BATCH_UPDATE,
  PLAYLIST_GET_ITEM,
  PLAYLIST_UPDATE_ITEM,
  PLAYLIST_UPDATE,
  PLAYLIST_UPDATED_ITEM,
  SET_ACTIVE_USER_PLAYLIST,
  CREATE_NEW_USER_PLAYLIST,
  CREATE_NEW_USER_PLAYLIST_SUCCESS,
  resetUserPlaylists,
  setActiveUserPlaylist,
  setPlaylistItem,
  setUserPlaylists,
  setUserPlaylistsProcessing,
  updatedPlaylistItem,
  updatePlaylistItem as updateItem,
  createUserPlaylistSuccess,
  setNewUserPlaylistError,
  CREATE_NEW_USER_PLAYLIST_AND_ATTACH_ITEM,
  togglePlaylistEditMode,
  TOGGLE_PLAYLIST_EDIT_MODE,
  DELETE_USER_PLAYLIST,
  deletePlaylistQueue,
  setPlaylistProcessing,
  deleteUserPlaylistSuccess,
  DELETE_USER_PLAYLIST_SUCCESS,
  RENAME_USER_PLAYLIST,
  RENAME_USER_PLAYLIST_SUCCESS,
  setRenameUserPlaylistError,
  renameUserPlaylistSuccess,
} from './actions'

const config = getConfig()


function getToastyMessage (text, added, error, isPortal, contentTitle = '', playlistName) {
  /* eslint-disable no-template-curly-in-string */
  if (error) {
    if (added) {
      return isPortal
        ? _replace(text.get('addToPortalError'), '${ playlistPortalLimit }', PLAYLIST_PORTAL_LIMIT)
        : text.get('addToPlaylistError')
    }
    return isPortal
      ? text.get('removedFromPortalError')
      : text.get('removedFromPlaylistError')
  }

  // Custom messages for multiple playlists.
  if (config.features.multiplePlaylists) {
    const truncatedPlaylistName = truncate(playlistName, { length: 25 })
    if (added) {
      return isPortal
        ? text.get('addToPortalSuccess')
        : `${contentTitle} ${text.get('addedTo')} ${truncatedPlaylistName}.`
    }
    return isPortal
      ? text.get('removedFromPortalSuccess')
      : `${contentTitle} ${text.get('removedFrom')} ${truncatedPlaylistName}.`
  }

  if (added) {
    return isPortal
      ? text.get('addToPortalSuccess')
      : `${contentTitle} ${text.get('addedToYourPlaylist')}`
  }
  return isPortal
    ? text.get('removedFromPortalSuccess')
    : `${contentTitle} ${text.get('removedFromYourPlaylist')}`
}

function userIsLoggedIn ({ state }) {
  const { auth } = state

  return (
    auth.get('jwt')
  )
}

export function playlistAddToasty ({ after }) {
  return after(PLAYLIST_UPDATED_ITEM, async ({ action, state, dispatch }) => {
    const { payload } = action
    const { staticText, user, videos } = state
    const { error, type, add, name } = payload
    const text = staticText.getIn(['data', 'playlistAddRemove', 'data'])
    const languages = user.getIn(['data', 'language'])
    const userLanguage = getPrimaryLanguage(languages)
    const videoTitle = videos.getIn([payload.contentId, userLanguage, 'data', 'title'])
    const message = getToastyMessage(text, add, error, type === 'portal', videoTitle, name)
    dispatch(addToasty(message))
  })
}

export function playlistGetItem ({ takeEvery }) {
  return takeEvery(PLAYLIST_GET_ITEM, async ({ action, state }) => {
    const { payload } = action
    const { auth, playlist } = state
    const { contentId, componentId } = payload
    const exists = playlist.getIn(['meta', contentId, 'data'])

    if (exists) {
      return setPlaylistItem({ componentId, contentId })
    }

    const data = await getPlaylistItem({ contentId, auth })
    return setPlaylistItem({ componentId, contentId, data })
  })
    .when(userIsLoggedIn)
    .catch(({ action }) => {
      const { payload } = action
      const { contentId } = payload
      return setPlaylistItem({
        error: true,
        contentId,
      })
    })
}

export function playlistUpdate ({ takeLatest }) {
  return takeLatest(PLAYLIST_UPDATE, async ({ action, state }) => {
    const { payload } = action
    const { auth } = state
    const { name } = payload
    // For now this is hardcoded for portals, but could be converted
    const { playlistName } = await updatePlaylist({ type: 'portal', name, auth })
    return setPortalPlaylistData({ playlistName })
  })
    .debounce(1000)
}

export function playlistUpdateItem ({ before }) {
  return before(PLAYLIST_UPDATE_ITEM, async ({ action, state, dispatch }) => {
    const { auth } = state
    const { payload } = action
    const { contentId, add, type, name } = payload

    await updatePlaylistItem({ contentId, type, auth, add })
    dispatch(updatedPlaylistItem({ contentId, type, add, name }))
  })
    .catch(({ action, dispatch }) => {
      const { payload } = action
      const { contentId, type, add, name } = payload
      dispatch(updatedPlaylistItem({
        error: true,
        contentId,
        type,
        add,
        name,
      }))
    })
}

export function playlistBatchUpdate ({ after }) {
  return after(PLAYLIST_BATCH_UPDATE, async ({ state, action, dispatch }) => {
    const { payload } = action
    const { auth, user } = state
    const { ids = [], type, add } = payload

    const languages = user.getIn(['data', 'language'])
    const nodes = await getNodes({
      language: getPrimaryLanguage(languages),
      asTile: false,
      auth,
      ids,
    })

    forEach(nodes, async (node) => {
      if (node.nid && node.nid > 0) {
        dispatch(updateItem({
          contentId: node.nid,
          type,
          add,
        }))
      }
    })
  })
}

function isMultiplePlaylists ({ state }) {
  const { resolver } = state
  return resolver.getIn(['data', 'type']) === RESOLVER_TYPE_PLAYLIST
}

function getActiveUserPlaylist (customPlaylists, state) {
  const { resolver, staticText } = state
  const currentPath = resolver.getIn(['data', 'path'])

  let playlist = BASE_PLAYLISTS.find(pl => pl.url === currentPath)
  if (playlist) {
    const name = staticText.getIn(['data', 'multiplePlaylistsPage', 'data', playlist.staticTextKey])
    return {
      name,
      type: playlist.type,
    }
  }

  playlist = customPlaylists
    ? customPlaylists.playlists.find(pl => `/playlist/${pl.type}` === currentPath)
    : null

  if (playlist) {
    return pick(playlist, ['name', 'type'])
  }

  return {}
}

/**
 * Watcher for Multiple Playlists page "/playlist/:id"
 * when the page is mounted.
 */
export function watchMultiplePlaylistPageMount ({ after }) {
  return after([
    SET_APP_BOOTSTRAP_PHASE,
    SET_RESOLVER_DATA,
    SET_AUTH_LOGIN_SUCCESS,
  ],
  async ({ dispatch, state, prevState, action }) => {
    const { app, auth, resolver, staticText } = state
    const { app: prevApp, resolver: prevResolver } = prevState
    const prevBootstrapComplete = prevApp.get('bootstrapComplete')
    const bootstrapComplete = app.get('bootstrapComplete')
    const prevResolverType = prevResolver.getIn(['data', 'type'])
    const prevPath = prevResolver.getIn(['data', 'path'])
    const resolverType = resolver.getIn(['data', 'type'])
    const path = resolver.getIn(['data', 'path'])

    // Validations depending the situation
    // SET_APP_BOOTSTRAP_PHASE: when the page loads directly on the browser
    // SET_RESOLVER_DATA: a link in a different page redirected to the playlist page
    // SET_AUTH_LOGIN_SUCCESS: login was performed in the playlist page
    const validations = {
      [SET_APP_BOOTSTRAP_PHASE]: bootstrapComplete && prevBootstrapComplete !== bootstrapComplete,
      [SET_RESOLVER_DATA]: resolverType !== prevResolverType ||
        (resolverType === prevResolverType && path !== prevPath),
      [SET_AUTH_LOGIN_SUCCESS]: true,
    }
    const shouldExecute = validations[action.type] || false

    if (!shouldExecute) {
      return
    }

    if (getAuthIsLoggedIn(auth)) {
      // Start fetching custom playlists
      dispatch(setUserPlaylistsProcessing(true))

      try {
        const userPlaylists = await getAllUserPlaylists({ auth })
        const activePlaylist = getActiveUserPlaylist(userPlaylists, { resolver, staticText })
        dispatch(setUserPlaylists(userPlaylists))
        dispatch(setActiveUserPlaylist(activePlaylist))
      } catch (e) {
        dispatch(setUserPlaylistsProcessing(false))
      }
    } else {
      // Opening the login modal
      dispatch(setOverlayDialogVisible(TYPE_LOGIN))
      dispatch(setDialogOptions(null, true))
      dispatch(setOverlayCloseOnClick(false))
    }
  })
    .when(isMultiplePlaylists)
}


/**
 * Watcher for Multiple Playlists page "/playlist/:id"
 * when the page is unmounted.
 */
export function watchMultiplePlaylistsPageUnmount ({ before }) {
  return before(SET_RESOLVER_DATA, async ({ action, dispatch, state }) => {
    const next = get(action, 'payload.data.type')
    const { playlist } = state
    const playlistType = playlist.getIn(['userPlaylists', 'activePlaylist', 'type'])
    const storeKey = getPlaylistTileStoreKey(playlistType)
    const editMode = playlist.getIn(
      [storeKey, 'editMode'],
      false,
    )

    // Turn edit mode off
    if (editMode) {
      dispatch(togglePlaylistEditMode(storeKey))
    }

    // Reset playlists data if leaving the page.
    if (next !== RESOLVER_TYPE_PLAYLIST) {
      dispatch(resetUserPlaylists())
    }
  }).when(isMultiplePlaylists)
}


/**
 * Watcher for Multiple Playlists page when a new Active Playlist is set
 */
export function watchActiveUserPlaylistUpdate ({ after }) {
  return after([
    SET_ACTIVE_USER_PLAYLIST,
  ],
  async ({ dispatch, state, prevState }) => {
    const { playlist: prevPlaylist } = prevState
    const { playlist } = state
    const activePlaylistType = playlist.getIn(['userPlaylists', 'activePlaylist', 'type'])
    const prevActivePlaylistType = prevPlaylist.getIn(['userPlaylists', 'activePlaylist', 'type'])

    if (activePlaylistType && activePlaylistType !== prevActivePlaylistType) {
      fetchInitialTilesData({ dispatch, state })
    }
  })
    .when(isMultiplePlaylists)
}

/**
 * Watcher for Multiple Playlists page when a user click "Load More"
 */
export function watchGetPlaylistTilesLoadMore ({ after }) {
  return after([
    GET_USER_PLAYLISTS_TILE_DATA_LOAD_MORE,
  ],
  async ({ dispatch, state }) => {
    fetchMoreTilesData({ dispatch, state })
  })
    .when(isMultiplePlaylists)
}


/**
 * Watcher for attempt to create a new playlist.
 */
export function watchCreateNewUserPlaylist ({ after }) {
  return after([
    CREATE_NEW_USER_PLAYLIST,
    CREATE_NEW_USER_PLAYLIST_AND_ATTACH_ITEM,
  ],
  async ({ dispatch, state, action }) => {
    const { auth } = state
    const { payload, type } = action

    const params = {
      name: payload.playlistName,
    }

    try {
      const playlistData = await createUserPlaylist({ auth, params })
      if (playlistData.existing) {
        dispatch(setNewUserPlaylistError(PLAYLIST_ERROR_EXISTING))
        return
      }

      if (type === CREATE_NEW_USER_PLAYLIST_AND_ATTACH_ITEM) {
        // Attach contentId to the recently created playlist.
        dispatch(updateItem({
          contentId: payload.contentId,
          type: playlistData.data.playlistType,
          name: playlistData.data.playlistName,
          add: true,
        }))
      }

      dispatch(createUserPlaylistSuccess())
      if (payload.successMessage) {
        dispatch(addToasty(payload.successMessage))
      }
      dispatch(dismissModal())
    } catch (e) {
      dispatch(setNewUserPlaylistError(e.message))
    }
  })
}


/**
 * Watcher to fetch user playlists (different to the page mount).
 *
 */
export function watchMultiplePlaylistsFetch ({ after }) {
  return after([
    CREATE_NEW_USER_PLAYLIST_SUCCESS,
    DELETE_USER_PLAYLIST_SUCCESS,
    RENAME_USER_PLAYLIST_SUCCESS,
    RENDER_MODAL,
  ],
  async ({ dispatch, state, action }) => {
    const { auth } = state
    const { type, payload } = action

    // Fetch data when the modal was opened.
    if (type === RENDER_MODAL && payload.name !== TYPE_USER_PLAYLIST_ADD) {
      return
    }

    try {
      dispatch(setUserPlaylistsProcessing(true))
      const userPlaylists = await getAllUserPlaylists({ auth })
      dispatch(setUserPlaylists(userPlaylists))
    } catch (e) {
      dispatch(setUserPlaylistsProcessing(false))
    }
  })
}

/**
 * Fetch Tiles
 *
 */
function fetchInitialTilesData ({ dispatch, state }) {
  const { auth, user, resolver, playlist } = state
  const languages = user.getIn(['data', 'language'])
  const userLanguage = getPrimaryLanguage(languages)
  const location = resolver.get('location')
  const activePlaylistType = playlist.getIn(['userPlaylists', 'activePlaylist', 'type'])
  const activePlaylistTileStoreKey = getPlaylistTileStoreKey(activePlaylistType)
  const tileType = activePlaylistType === PLAYLIST_TYPE_HISTORY ? TYPE_WATCH_HISTORY : TYPE_PLAYLIST

  dispatch(getTilesData(
    activePlaylistTileStoreKey,
    activePlaylistType,
    Map({
      language: userLanguage,
      type: tileType,
      playlistType: activePlaylistType,
    }),
    0,
    DEFAULT_LIMIT,
    null,
    location,
    auth.get('uid'),
    auth.get('jwt'),
    null,
  ))
}

function fetchMoreTilesData ({ dispatch, state }) {
  const { auth, user, resolver, playlist, tiles } = state
  const location = resolver.get('location')
  const playlistType = playlist.getIn(['userPlaylists', 'activePlaylist', 'type'])
  const storeKey = getPlaylistTileStoreKey(playlistType)
  const activeTiles = tiles.get(storeKey)
  const type = playlistType === PLAYLIST_TYPE_HISTORY ? TYPE_WATCH_HISTORY : TYPE_PLAYLIST
  const page = activeTiles ? activeTiles.get('page', 0) + 1 : 0

  dispatch(appendTilesDataPlaceholderTitles(storeKey))
  dispatch(getTilesPageData({
    auth,
    storeKey,
    resolver,
    location,
    page,
    playlistType,
    id: playlistType,
    type,
    locale: null,
    updateData: true,
    user,
  }))
}

/**
 * Save a playlist from multiple playlist page
 *
 */
export function watchPlaylistSave ({ before }) {
  return before([
    TOGGLE_PLAYLIST_EDIT_MODE,
  ],
  async ({ dispatch, state }) => {
    const { auth, playlist, hideWatched } = state
    const playlistType = playlist.getIn(['userPlaylists', 'activePlaylist', 'type'])
    const playlistName = playlist.getIn(['userPlaylists', 'activePlaylist', 'name'])
    const storeKey = getPlaylistTileStoreKey(playlistType)
    const editMode = playlist.getIn(
      [storeKey, 'editMode'],
      false,
    )

    if (editMode) {
      const isWatchHistory = playlistType === PLAYLIST_TYPE_HISTORY
      const deleteIds = isWatchHistory
        ? getHideWatchQueueIds(hideWatched)
        : getDeleteQueueIds(storeKey, playlist)

      try {
        if (deleteIds.size > 0) {
          dispatch(setPlaylistProcessing(storeKey, true))

          if (isWatchHistory) {
            dispatch(saveHideWatched())
          } else {
            dispatch(deletePlaylistQueue(storeKey))
            await deleteItemsFromPlaylist({
              deleteIds,
              auth,
              playlistType,
            })
          }

          dispatch(deleteTilesDataById(storeKey, deleteIds))
          dispatch(setPlaylistProcessing(storeKey, false))
          dispatch(addToasty(`Successfully Saved ${playlistName}`))
        }
      } catch (e) {
        dispatch(addToasty('Could not save your playlist. Please try again'))
      }
    }
  })
    .when(isMultiplePlaylists)
}


/**
 * Watcher to delete a playlist.
 *
 */
export function watchPlaylistDelete ({ after }) {
  return after([
    DELETE_USER_PLAYLIST,
  ],
  async ({ dispatch, state, action }) => {
    const { auth, staticText } = state
    const { payload } = action
    const deleteText = staticText.getIn(['data', 'multiplePlaylistsDeleteModal'])

    try {
      await deletePlaylist({ auth, playlistType: payload })
      // Go to default playlist since the current one was deleted.
      dispatch(pushHistory({
        url: URL_PLAYLIST_WATCH_LATER,
      }))
      // Fetch the playlists & set active playlist.
      dispatch(deleteUserPlaylistSuccess())
      dispatch(setActiveUserPlaylist({
        name: staticText.getIn(['data', 'multiplePlaylistsPage', 'data', 'watchLater']),
        type: PLAYLIST_TYPE_DEFAULT,
      }))
      dispatch(addToasty(deleteText.getIn(['data', 'successMessage'])))
    } catch (e) {
      dispatch(dismissModal())
      dispatch(addToasty(deleteText.getIn(['data', 'errorMessage'])))
    }
  })
    .when(isMultiplePlaylists)
}


/**
 * Watcher for renaming playlist.
 */
export function watchRenameUserPlaylist ({ after }) {
  return after([
    RENAME_USER_PLAYLIST,
  ],
  async ({ dispatch, state, action }) => {
    const { auth } = state
    const { payload: { playlistName, playlistType, successMessage } } = action

    try {
      const playlistData = await renamePlaylist({ auth, playlistName, playlistType })
      if (playlistData.existing) {
        dispatch(setRenameUserPlaylistError(PLAYLIST_ERROR_EXISTING))
        return
      }

      dispatch(renameUserPlaylistSuccess(
        playlistData.data.playlistName,
        playlistData.data.playlistType,
      ))

      if (successMessage) {
        dispatch(addToasty(successMessage))
      }

      dispatch(dismissModal())
    } catch (e) {
      dispatch(setRenameUserPlaylistError(e.message))
    }
  })
    .when(isMultiplePlaylists)
}
