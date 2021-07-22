import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import _partial from 'lodash/partial'
import { TYPE_PLACEHOLDER as COMMENT_TYPE_PLACEHOLDER } from 'services/comments'
import Comment from 'components/Comment'
import CommentPlaceholder from 'components/CommentPlaceholder'
import CommentThreadActions from 'components/CommentThreadActions'

const DEFAULT_CHILDREN_LIMIT = 2

function renderThreadRoot (props) {
  const { data, auth, comment, saveComment } = props
  if (comment.get('type') === COMMENT_TYPE_PLACEHOLDER) {
    return <CommentPlaceholder />
  }
  return (
    <Comment
      data={data}
      auth={auth}
      comment={comment}
      saveComment={saveComment}
    />
  )
}

function renderCommentThreadActions (
  props,
  state,
  setReplyVisible,
  setChildrenLimit,
) {
  const { data, auth, comment, saveComment } = props
  const { replyVisible, childrenLimit } = state
  if (comment.get('type') === COMMENT_TYPE_PLACEHOLDER) {
    return null
  }
  return (
    <CommentThreadActions
      data={data}
      auth={auth}
      comment={comment}
      saveComment={saveComment}
      replyVisible={replyVisible}
      childrenLimit={childrenLimit}
      childrenLimited={getChildrenCount(comment) > DEFAULT_CHILDREN_LIMIT}
      onClickReply={_partial(setReplyVisible, !replyVisible)}
      onSubmitComplete={_partial(setReplyVisible, false)}
      onClickChildrenLimit={_partial(
        setChildrenLimit,
        childrenLimit === -1 ? DEFAULT_CHILDREN_LIMIT : -1,
      )}
    />
  )
}

function renderThreadChildren (props, state) {
  /* eslint-disable react/no-array-index-key */
  const { data, auth, comment, saveComment } = props
  const { childrenLimit } = state
  const commentChildren = comment.get('children', List())
  const children =
    childrenLimit === -1
      ? commentChildren
      : commentChildren.takeLast(childrenLimit)
  return children.map((child, index) => (
    <Comment
      key={`comment-thread-${child.get('cid')}-${index}`}
      data={data}
      auth={auth}
      comment={child}
      saveComment={saveComment}
    />
  ))
  /* eslint-enable react/no-array-index-key */
}

function getClassName (props) {
  const { comment } = props
  const hasPlaceholders = comment.get('type') === COMMENT_TYPE_PLACEHOLDER
  return ['comment-thread']
    .concat(hasPlaceholders ? ['comment-thread--placeholders'] : [])
    .join(' ')
}

function getChildrenLimit (comment) {
  const count = getChildrenCount(comment)
  return count > DEFAULT_CHILDREN_LIMIT ? DEFAULT_CHILDREN_LIMIT : -1
}

function getChildrenCount (comment) {
  return comment.get('children', List()).size
}

class CommentThread extends PureComponent {
  constructor (props) {
    super(props)
    const { comment } = props
    this.state = {
      replyVisible: false,
      childrenLimit: getChildrenLimit(comment),
    }
  }

  setReplyVisible = (replyVisible) => {
    this.setState(() => ({ replyVisible }))
  }

  setChildrenLimit = (childrenLimit) => {
    this.setState(() => ({ childrenLimit }))
  }

  render () {
    const { props, state } = this
    return (
      <div className={getClassName(props)}>
        {renderThreadRoot(props)}
        {renderCommentThreadActions(
          props,
          state,
          this.setReplyVisible,
          this.setChildrenLimit,
        )}
        <div className="comment-thread__replies">
          {renderThreadChildren(props, state)}
        </div>
      </div>
    )
  }
}

CommentThread.propTypes = {
  comment: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  data: ImmutablePropTypes.map.isRequired,
  saveComment: PropTypes.func.isRequired,
}

export default CommentThread
