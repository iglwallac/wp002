import { get as apiGet, post as apiPost, put as apiPut, TYPE_BROOKLYN, REQUEST_TYPE_APPLICATION_JSON } from 'api-client'
import { fromNow } from 'services/date-time'
import strictUriEncode from 'strict-uri-encode'
import _set from 'lodash/set'
import _get from 'lodash/get'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _isArray from 'lodash/isArray'
import _parseInt from 'lodash/parseInt'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _findIndex from 'lodash/findIndex'
import _filter from 'lodash/filter'
import _times from 'lodash/times'
import _concat from 'lodash/concat'

const SCHEMA_COMMENT = {
  cid: null,
  comment: null,
  format: null,
  homepage: null,
  mail: null,
  name: null,
  picture: null,
  pid: null,
  registered_name: null,
  signature: null,
  signature_format: null,
  status: null,
  subject: null,
  thread: null,
  timestamp: null,
  uid: null,
}

export const TYPE_PLACEHOLDER = 'TYPE_PLACEHOLDER'

const SCHEMA = {
  currentPage: null,
  totalCount: null,
  comments: [SCHEMA_COMMENT],
}

export async function get (options) {
  const { id, auth, page = 0, limit = 250 } = options
  const apiQuery = {
    p: page,
    pp: limit,
  }
  const res = await apiGet(
    `s/node/comments/${strictUriEncode(id)}`,
    apiQuery,
    { auth },
    TYPE_BROOKLYN,
  )
  return handleGetResponse(res, id)
}

export function handleGetResponse (res, id, _dataError) {
  const data = _get(res, 'body', {})
  const comments = _isArray(_get(data, 'comments'))
    ? _get(data, 'comments')
    : []
  const commentsSorted = _map(comments, formatCommentResponse).sort(
    sortComments,
  )
  const parentComments = _filter(commentsSorted, { pid: 0 })
  const childrenComments = _filter(
    commentsSorted,
    comment => _get(comment, 'pid') > 0,
  )
  return _assign(_cloneDeep(SCHEMA), {
    currentPage: _parseInt(_get(data, 'currentPage', 1)),
    totalCount: _parseInt(_get(data, 'totalCount', 0)),
    id,
    _dataError,
    comments: _reduce(
      childrenComments,
      reduceChildrenToParentThreads,
      parentComments,
    ),
  })
}

function reduceChildrenToParentThreads (parents, child) {
  const pid = _get(child, 'pid')
  const parentIndex = _findIndex(parents, { cid: pid })
  // Find a parent and attach the child, removing the child from the flat list
  if (parentIndex > -1) {
    const children = _get(parents, [parentIndex, 'children'], [])
    _set(parents, [parentIndex, 'children'], _concat(children, child))
  }
  return parents
}

function sortComments (commentA, commentB) {
  const timestampA = _get(commentA, ['timestamp'])
  const timestampB = _get(commentB, ['timestamp'])
  if (timestampA < timestampB) {
    return 1
  }
  return -1
}

export async function create (options) {
  const { id, auth, data } = options
  const cid = _get(data, 'cid')
  // editing a comment
  if (cid) {
    const comment = _get(data, 'body')
    const uid = _get(data, 'uid')
    const putData = {
      comment,
      status: 0,
      uid,
    }
    const putOptions = {
      auth,
      reqType: REQUEST_TYPE_APPLICATION_JSON,
    }
    apiPut(
      `v1/comments/${cid}`,
      putData,
      putOptions,
      TYPE_BROOKLYN,
    )
    return null
  }

  const res = await apiPost(`s/node/comments/${strictUriEncode(id)}`, data, { auth }, TYPE_BROOKLYN)
  return handleCreateResponse(res)
}

function handleCreateResponse (res) {
  const commentData = _get(res, ['body', 'comment'], {})
  _set(commentData, 'registered_name', _get(commentData, 'name', ''))
  return formatCommentResponse(commentData)
}

function formatCommentResponse (comment) {
  const timestamp = _parseInt(_get(comment, 'timestamp', 0)) * 1000
  return _assign(_cloneDeep(SCHEMA_COMMENT), comment, {
    timestamp,
    createdDateTimeText: fromNow(timestamp),
    uid: _parseInt(_get(comment, 'uid', -1)),
    pid: _parseInt(_get(comment, 'pid', -1)),
    cid: _parseInt(_get(comment, 'cid', -1)),
    contentId: _parseInt(_get(comment, 'nid', -1)),
  })
}

export function getPlaceholders (count = 2) {
  return _times(count, () => _assign(_cloneDeep(SCHEMA_COMMENT), {
    comment: '',
    type: TYPE_PLACEHOLDER,
    pid: 0,
    cid: -1,
  }))
}
