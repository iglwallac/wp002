import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, Map } from 'immutable'
import CommentEdit from 'components/CommentEdit'
import Button from 'components/Button'
import { connect } from 'react-redux'

function getChildrenLimitText (props) {
  const { comment, childrenLimit, commentThreadActionsStaticText } = props
  const count = getRepliesCount(comment)
  if (childrenLimit !== -1) {
    return `${commentThreadActionsStaticText.getIn([
      'data',
      'viewAllReplies',
    ])} (${count})`
  }
  return `${commentThreadActionsStaticText.getIn([
    'data',
    'hideAllReplies',
  ])} (${count})`
}

function getRepliesCount (comment) {
  return comment.get('children', List()).size
}

function CommentThreadActions (props) {
  const {
    data,
    auth,
    comment,
    saveComment,
    replyVisible,
    childrenLimited,
    onClickReply,
    onClickChildrenLimit,
    onSubmitComplete,
    commentThreadActionsStaticText,
  } = props
  const replyButtonClass = ['comment-thread-actions__reply-button'].concat(
    replyVisible ? 'comment-thread-actions__reply-button--active' : '',
  )

  return (
    <div className="comment-thread-actions">
      {auth.get('jwt') ? (
        <Button
          buttonClass={replyButtonClass}
          onClick={onClickReply}
          text={commentThreadActionsStaticText.getIn(['data', 'reply'])}
        />
      ) : null}
      {replyVisible ? (
        <CommentEdit
          className={['comment-thread-actions__reply-textarea']}
          data={data}
          auth={auth}
          parent={comment}
          saveComment={saveComment}
          onSubmitComplete={onSubmitComplete}
        />
      ) : null}
      {childrenLimited ? (
        <Button
          buttonClass={['comment-thread-actions__children-limit']}
          onClick={onClickChildrenLimit}
          text={getChildrenLimitText(props)}
        />
      ) : null}
    </div>
  )
}

CommentThreadActions.propTypes = {
  replyVisible: PropTypes.bool.isRequired,
  childrenLimit: PropTypes.number.isRequired,
  childrenLimited: PropTypes.bool.isRequired,
  comment: ImmutablePropTypes.map.isRequired,
  data: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  saveComment: PropTypes.func.isRequired,
  onClickReply: PropTypes.func.isRequired,
  onClickChildrenLimit: PropTypes.func.isRequired,
  onSubmitComplete: PropTypes.func,
  commentThreadActionsStaticText: ImmutablePropTypes.map.isRequired,
}

CommentThreadActions.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connect(state => ({
  commentThreadActionsStaticText: state.staticText.getIn(
    ['data', 'commentThreadActions'],
    Map(),
  ),
}))(CommentThreadActions)
