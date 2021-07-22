import CommentItem from 'components/Getstream/CommentItem'
import { getElementToWindowTopOffset } from 'services/dom'
import { selectAuth } from 'services/getstream/selectors'
import { requestAnimationFrame } from 'services/animate'
import { connect as connectRedux } from 'react-redux'
import React, { PureComponent } from 'react'
import { getBoundActions } from 'actions'
import { Map } from 'immutable'
import _map from 'lodash/map'

function renderMoreCommentNum (commentListLength) {
  if (commentListLength > 21) return 'View 20 + more comments'
  return `View ${commentListLength - 1} more comments`
}

class CommentsList extends PureComponent {
//
  componentDidMount () {
    const { activity, getActivityReactions } = this.props
    getActivityReactions({ activityId: activity.id, type: 'comment' })
  }

  contractCommentsList = () => {
    const { props } = this
    const { activityRef, feedComments, activity, toggleExpandComments } = props
    const commentList = feedComments.get(`${activity.id}`)
    const commentListLength = commentList.length

    toggleExpandComments()

    // scroll to top of activity if many comments
    if (commentListLength > 3) {
      const offset = getElementToWindowTopOffset(activityRef.current) || 0
      requestAnimationFrame(() => global.scrollTo(0, offset))
    }
  }

  renderShowcasedComment = () => {
    const {
      doToggleChildReactions,
      highlightReaction,
      onToggleReaction,
      removeReaction,
      feedComments,
      dismissModal,
      renderModal,
      streamAuth,
      expanded,
      activity,
    } = this.props
    const userId = streamAuth.get('userId')
    const activityCommentData = feedComments.get(`${activity.id}`)
    const comment = activityCommentData[activityCommentData.length - 1]
    const highlight = comment.id === highlightReaction
    if (!expanded) {
      return (
        <CommentItem
          onToggleChildReaction={doToggleChildReactions}
          onToggleReaction={onToggleReaction}
          removeReaction={removeReaction}
          dismissModal={dismissModal}
          renderModal={renderModal}
          highlight={highlight}
          activity={activity}
          comment={comment}
          key={comment.id}
          userId={userId}
          avatarSize={40}
        />
      )
    }
    return (
      <div />
    )
  }

  renderExpandableComments = () => {
    const {
      doToggleChildReactions,
      toggleExpandComments,
      highlightReaction,
      onToggleReaction,
      removeReaction,
      feedComments,
      dismissModal,
      renderModal,
      streamAuth,
      expanded,
      activity,
    } = this.props
    const userId = streamAuth.get('userId')
    const commentList = feedComments.get(`${activity.id}`)
    const commentListLength = commentList.length

    if (expanded) {
      return (
        <div>
          {_map(commentList, comment => (
            <CommentItem
              onToggleChildReaction={doToggleChildReactions}
              highlight={comment.id === highlightReaction}
              onToggleReaction={onToggleReaction}
              removeReaction={removeReaction}
              dismissModal={dismissModal}
              renderModal={renderModal}
              activity={activity}
              comment={comment}
              key={comment.id}
              userId={userId}
              avatarSize={40}
            />
          ))}
          {commentListLength > 1
            ? <div
              className={'comments-list__view-more'}
              onClick={this.contractCommentsList}
            >
              {'Show less comments'}
            </div>
            : null}
        </div>
      )
    } else if (commentListLength === 2) {
      return (
        <div
          className={'comments-list__view-more'}
          onClick={toggleExpandComments}
        >
          {'View 1 more comment'}
        </div>
      )
    } else if (commentListLength > 2) {
      return (
        <div
          className={'comments-list__view-more'}
          onClick={toggleExpandComments}
        >
          {renderMoreCommentNum(commentListLength)}
        </div>
      )
    }
    return (
      <div />
    )
  }

  renderComments = () => {
    const { feedComments, activity } = this.props
    const commentList = feedComments.get(`${activity.id}`)
    if (feedComments.size > 0 && commentList && commentList.length) {
      return (
        <div className={'comments-list__comments'}>
          {this.renderShowcasedComment()}
          {this.renderExpandableComments()}
        </div>
      )
    }
    return (
      <div />
    )
  }

  render () {
    return (
      <div className="comments-list">
        {this.renderComments()}
      </div>
    )
  }
}

export default connectRedux((state) => {
  const getstream = state.getstream
  return {
    feedComments: getstream.get('feedComments', Map()),
    streamAuth: selectAuth(getstream),
  }
},
(dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    doToggleChildReactions: actions.getstream.doToggleChildReactions,
    getActivityReactions: actions.getstream.getActivityReactions,
    removeReaction: actions.getstream.removeReaction,
    dismissModal: actions.dialog.dismissModal,
    renderModal: actions.dialog.renderModal,
  }
},
)(CommentsList)
