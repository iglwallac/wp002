import { get, create, getPlaceholders } from 'services/comments'
import { Map } from 'immutable'
import { Promise as BluebirdPromise } from 'bluebird'

export const SET_COMMENTS = 'SET_COMMENTS'
export const SET_COMMENTS_VISIBLE = 'SET_COMMENTS_VISIBLE'
export const CREATE_COMMENTS_COMMENT = 'CREATE_COMMENTS_COMMENT'
export const UPDATE_COMMENTS_TMP_COMMENT = 'UPDATE_COMMENTS_TMP_COMMENT'
export const SET_COMMENT_REPLY_VISIBLE = 'SET_COMMENT_REPLY_VISIBLE'
export const SET_COMMENTS_END_STATE_VISIBLE = 'SET_COMMENTS_END_STATE_VISIBLE'
export const SET_COMMENTS_META_DATA = 'SET_COMMENTS_META_DATA'

export function refreshComments (options) {
  const { contentId, commentsId, metadata, visible = true, jwt } = options
  return function refreshCommentsThunk (dispatch) {
    if (commentsId === contentId) {
      dispatch(setCommentsVisible(visible))
      return BluebirdPromise.resolve()
    }
    return dispatch(getComments({ id: contentId, jwt, metadata, visible }))
  }
}

export function setCommentsEndStateVisible (visible) {
  return {
    type: SET_COMMENTS_END_STATE_VISIBLE,
    payload: { visible },
  }
}

export function createCommentsComment (comment) {
  return {
    type: CREATE_COMMENTS_COMMENT,
    payload: { comment },
  }
}

export function updateCommentsTmpComment (tmpComment, comment) {
  return {
    type: UPDATE_COMMENTS_TMP_COMMENT,
    payload: { tmpComment, comment },
  }
}

export function setCommentsVisible (value) {
  return {
    type: SET_COMMENTS_VISIBLE,
    payload: value,
  }
}

export function saveComment (options) {
  const { id, auth = Map(), body, comment = Map(), parent = Map() } = options
  // This is an editable comment of cid exists
  const cid = comment ? comment.get('cid') : undefined
  // This is a reply comment if a parent exists
  const pid = parent ? parent.get('cid') : undefined
  return function saveCommentThunk (dispatch) {
    const subject = ''
    const uid = auth.get('uid')
    const data = { cid, pid, body, subject, uid }
    // The tmp comment is the current comment
    let tmpComment = comment
    if (!cid) {
      // This is a new comment since there is no cid
      tmpComment = Map({
        subject,
        registered_name: auth.get('username'),
        comment: body,
        uid,
        pid,
        cid: -1,
      })
      dispatch(createCommentsComment(tmpComment))
    } else {
      // Update the existing comment quickly without waiting for the repsonse.
      dispatch(
        updateCommentsTmpComment(tmpComment, comment.set('comment', body)),
      )
    }
    return create({ id, auth: auth.get('jwt'), data }).then((
      _data,
    ) => {
      // Update all tmp comments with the server response.
      dispatch(updateCommentsTmpComment(tmpComment, _data))
      return _data
    })
  }
}

export function setComments (comments, processing = false) {
  return {
    type: SET_COMMENTS,
    payload: { comments, processing },
  }
}

export function getComments (options) {
  const {
    id,
    jwt,
    metadata,
    visible = true,
    comments = getPlaceholders(),
  } = options
  return function getCommentsThunk (dispatch) {
    dispatch(setCommentsMetaData(metadata, comments, visible))
    return get({ id, auth: jwt }).then((
      _comments,
    ) => {
      dispatch(setComments(_comments))
      return _comments
    })
  }
}

export function setCommentsMetaData (
  metadata,
  comments,
  visible = true,
  processing = true,
) {
  return {
    type: SET_COMMENTS_META_DATA,
    payload: { metadata, comments, visible, processing },
  }
}
