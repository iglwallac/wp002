// ----------------------------------------
// General Setup
// ----------------------------------------
export const PORTAL_SET_USER_ACCESS = 'PORTAL_SET_USER_ACCESS'
export const PORTAL_GET_RESOURCES = 'PORTAL_GET_RESOURCES'
export const PORTAL_SET_RESOURCES = 'PORTAL_SET_RESOURCES'
export const PORTAL_UNMOUNT = 'PORTAL_UNMOUNT'
// ----------------------------------------
// Profile
// ----------------------------------------
export const SET_USER_PORTAL_PROFILE_PICTURE = 'SET_USER_PORTAL_PROFILE_PICTURE'
// ----------------------------------------
// Sharing
// ----------------------------------------
export const PORTAL_GET_SHARE = 'PORTAL_GET_SHARE'
export const PORTAL_SET_SHARE = 'PORTAL_SET_SHARE'
// ----------------------------------------
// Tags
// ----------------------------------------
export const PORTAL_GET_TAG_OPTIONS = 'PORTAL_GET_TAG_OPTIONS'
export const PORTAL_SET_TAG_OPTIONS = 'PORTAL_SET_TAG_OPTIONS'
// ----------------------------------------
// Followers/Following
// ----------------------------------------
export const PORTAL_COMMUNITY_PM_GET = 'PORTAL_COMMUNITY_PM_GET'
export const PORTAL_COMMUNITY_PM_SET = 'PORTAL_COMMUNITY_PM_SET'
export const PORTAL_V2_SET_VIEWALL = 'PORTAL_V2_SET_VIEWALL'
export const PORTAL_V2_UPDATE_VIEWALL_PAGINATION = 'PORTAL_V2_UPDATE_VIEWALL_PAGINATION'
// ----------------------------------------
// Page Manager
// ----------------------------------------
export const PORTAL_SET_PM_PLAYLIST = 'PORTAL_SET_PM_PLAYLIST'
export const PORTAL_REMOVE_PM_PLAYLIST = 'PORTAL_REMOVE_PM_PLAYLIST'
// ----------------------------------------
// Modes + Editor
// ----------------------------------------
export const PORTAL_V2_UPDATE = 'PORTAL_V2_UPDATE'
export const PORTAL_V2_SET_MODE = 'PORTAL_V2_SET_MODE'
export const PORTAL_V2_SET_PREV_MODE = 'PORTAL_V2_SET_PREV_MODE'
export const PORTAL_V2_CREATE_EDITOR = 'PORTAL_V2_CREATE_EDITOR'
export const PORTAL_V2_REMOVE_EDITOR = 'PORTAL_V2_REMOVE_EDITOR'
export const PORTAL_V2_UPDATE_EDITOR = 'PORTAL_V2_UPDATE_EDITOR'
export const PORTAL_V2_APPLY_UPDATES = 'PORTAL_V2_APPLY_UPDATES'
// ----------------------------------------
// Playlist
// ----------------------------------------
export const PORTAL_V2_GET_PLAYLIST = 'PORTAL_V2_GET_PLAYLIST'
export const PORTAL_V2_SET_PLAYLIST = 'PORTAL_V2_SET_PLAYLIST'
export const PORTAL_V2_ADD_VIDEO_TO_PLAYLIST = 'PORTAL_V2_ADD_VIDEO_TO_PLAYLIST'
export const PORTAL_V2_REMOVE_VIDEO_FROM_PLAYLIST = 'PORTAL_V2_REMOVE_VIDEO_FROM_PLAYLIST'
export const SET_PORTAL_PLAYLIST_DATA = 'SET_PORTAL_PLAYLIST_DATA'
export const RESET_PORTAL_PLAYLIST_DATA = 'RESET_PORTAL_PLAYLIST_DATA'
// ----------------------------------------
// Playlist Editing - Search Content/Filter by Playlist
// ----------------------------------------
export const PORTAL_V2_PL_EDIT_GET_SEARCH = 'PORTAL_V2_PL_EDIT_GET_SEARCH'
export const PORTAL_V2_PL_EDIT_SET_SEARCH = 'PORTAL_V2_PL_EDIT_SET_SEARCH'
export const PORTAL_V2_PL_EDIT_GET_PLAYLIST = 'PORTAL_V2_PL_EDIT_GET_PLAYLIST'
export const PORTAL_V2_PL_EDIT_SET_PLAYLIST = 'PORTAL_V2_PL_EDIT_SET_PLAYLIST'
export const PORTAL_V2_PL_EDIT_SET_PAGINATION = 'PORTAL_V2_PL_EDIT_SET_PAGINATION'

// ----------------------------------------
// General actions
// ----------------------------------------
export function setMode (mode) {
  return {
    type: PORTAL_V2_SET_MODE,
    payload: mode,
  }
}

export function updatePortal (data) {
  return {
    type: PORTAL_V2_UPDATE,
    payload: data,
  }
}

export function updateEditor (key, value) {
  return {
    type: PORTAL_V2_UPDATE_EDITOR,
    payload: { key, value },
  }
}

// ----------------------------------------
// Profile actions
// ----------------------------------------
export function setUserPortalProfilePicture (data) {
  return {
    type: SET_USER_PORTAL_PROFILE_PICTURE,
    payload: { data },
  }
}

export function getTagOptions (data) {
  return {
    type: PORTAL_GET_TAG_OPTIONS,
    payload: { data },
  }
}

// ----------------------------------------
// Playlist Fetching
// ----------------------------------------
export function resetPortalPlaylistData (data) {
  return {
    type: RESET_PORTAL_PLAYLIST_DATA,
    payload: { data },
  }
}

export function setPortalPlaylistData (data) {
  return {
    type: SET_PORTAL_PLAYLIST_DATA,
    payload: { data },
  }
}

// ----------------------------------------
// Playlist Editing
// ----------------------------------------
export function addVideoToPlaylist (contentId) {
  return {
    type: PORTAL_V2_ADD_VIDEO_TO_PLAYLIST,
    payload: { contentId },
  }
}

export function removeVideoFromPlaylist (contentId) {
  return {
    type: PORTAL_V2_REMOVE_VIDEO_FROM_PLAYLIST,
    payload: { contentId },
  }
}

export function getPlaylistEditFilter ({ playlistType, page, limit }) {
  return {
    type: PORTAL_V2_PL_EDIT_GET_PLAYLIST,
    payload: { playlistType, page, limit },
  }
}

export function getPlaylistEditSearch ({ contentType, page, searchTerm, limit }) {
  return {
    type: PORTAL_V2_PL_EDIT_GET_SEARCH,
    payload: { contentType, searchTerm, limit, page },
  }
}

export function updatePlaylistEditPagination ({ page, limit }) {
  return {
    type: PORTAL_V2_PL_EDIT_SET_PAGINATION,
    payload: { page, limit },
  }
}

// ----------------------------------------
// Community (Followers/Following) Viewall
// ----------------------------------------
export function updateViewAllPagination (page) {
  return {
    type: PORTAL_V2_UPDATE_VIEWALL_PAGINATION,
    payload: { page },
  }
}

// ----------------------------------------
// Sharing
// ----------------------------------------
export function getPortalShare (data) {
  return {
    type: PORTAL_GET_SHARE,
    payload: { data },
  }
}

// ----------------------------------------
// Page Manager
// ----------------------------------------
export function getPortalCommunityPM (data) { // uuids
  return {
    type: PORTAL_COMMUNITY_PM_GET,
    payload: { data },
  }
}
