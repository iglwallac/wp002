import PropTypes from 'prop-types'
import React from 'react'
import { Map, List } from 'immutable'
import _partial from 'lodash/partial'
import _isFunction from 'lodash/isFunction'
import CommentsHeader from 'components/CommentsHeader'
import CommentThread from 'components/CommentThread'
import CommentsEmpty from 'components/CommentsEmpty'
import Icon from 'components/Icon'
import ImmutablePropTypes from 'react-immutable-proptypes'

function renderCommentThread (props) {
  /* eslint-disable react/no-array-index-key */
  const { auth, comments, saveComment } = props
  return comments
    .getIn(['data', 'comments'], List())
    .map((comment, index) => (
      <CommentThread
        comment={comment}
        key={`comments-${index}`}
        auth={auth}
        data={comments.get('metadata', Map())}
        saveComment={saveComment}
      />
    ))
  /* eslint-enable react/no-array-index-key */
}

function getClassName (props) {
  const { comments } = props
  const className = ['comments']
  if (comments.get('visible')) {
    className.push('comments--open')
  }
  return className.join(' ')
}

function handleOnClickClose (props) {
  const { onClickClose, setCommentsVisible } = props
  setCommentsVisible(false)
  if (_isFunction(onClickClose)) {
    onClickClose()
  }
}

function Comments (props) {
  const { comments, auth, saveComment } = props
  const commentsList = comments.getIn(['data', 'comments'], List())
  return (
    <aside className={getClassName(props)}>
      <Icon
        iconClass={['comments__icon--close', 'icon--close', 'icon--action']}
        onClick={_partial(handleOnClickClose, props)}
      />
      <div className="comments__body">
        <CommentsHeader
          auth={auth}
          data={comments.get('metadata', Map())}
          saveComment={saveComment}
        />
        {commentsList.size === 0 ? (
          <CommentsEmpty />
        ) : (
          <div className="comments__list">{renderCommentThread(props)}</div>
        )}
      </div>
    </aside>
  )
}

Comments.propTypes = {
  comments: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  saveComment: PropTypes.func.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  onClickClose: PropTypes.func,
}

export default Comments
