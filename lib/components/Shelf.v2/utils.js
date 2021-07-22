import { Map } from 'immutable'

export function getClassName (inputClassName, isVisible) {
  const className = ['shelf-v2'].concat(inputClassName || [])

  if (isVisible) {
    className.push('shelf-v2--visible')
  }
  return className.join(' ')
}

export function getShelfComments (props) {
  const { comments, shelf, auth, refreshComments } = props

  refreshComments({
    contentId: shelf.getIn(['data', 'id']),
    commentsId: comments.getIn(['data', 'id']),
    metadata: shelf.get('data', Map()).toJS(),
    jwt: auth.get('jwt'),
    visible: !comments.get('visible', false),
  })
}

export function updateCommentsIfOpen (props, commentsVisible, commentsId) {
  const { shelf, auth } = props
  const data = shelf.get('data')
  const shelfId = data.get('id')
  const jwt = auth.get('jwt')

  if (commentsVisible) {
    getShelfComments(props, data, commentsId, shelfId, jwt)
  }
}
