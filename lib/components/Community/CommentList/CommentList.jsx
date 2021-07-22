import { getElementToWindowTopOffset } from 'services/dom'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { requestAnimationFrame } from 'services/animate'
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

import Activity from '../Activity'

function CommentListFooter (props) {
  const {
    toggleExpandComments,
    expandedComments,
    activityRef,
    viewMore,
    comments,
  } = props

  const contractCommentList = useCallback(() => {
    const commentListLength = comments.size
    toggleExpandComments()
    // scroll to top of activity if many comments
    if (commentListLength > 3) {
      const offset = getElementToWindowTopOffset(activityRef.current) || 0
      requestAnimationFrame(() => global.scrollTo(0, offset))
    }
  }, [comments, expandedComments, activityRef, toggleExpandComments])

  const commentListLength = comments.size
  if (!expandedComments && viewMore) return renderViewMore(commentListLength, toggleExpandComments)
  return (
    <React.Fragment>
      {expandedComments && viewMore && commentListLength > 1
        ? <div
          className={'comment-list__view-more'}
          onClick={contractCommentList}
        >
          {'Show less comments'}
        </div>
        : null}
    </React.Fragment>
  )
}

function CommentsContent (props) {
  const {
    startingCommentCount,
    highlightReaction,
    expandedComments,
    removeActivity,
    removeReaction,
    dismissModal,
    addReaction,
    renderModal,
    canReply,
    comments,
    included,
    userUuid,
  } = props

  return (
    <ul className="comment-list__list">
      {startingCommentCount ? (
        comments.slice(0, startingCommentCount).map((comment) => {
          const commentUuid = comment.get('uuid')
          return (
            <Activity
              highlightReaction={highlightReaction}
              removeActivity={removeActivity}
              removeReaction={removeReaction}
              dismissModal={dismissModal}
              expanded={expandedComments}
              renderModal={renderModal}
              addReaction={addReaction}
              userUuid={userUuid}
              canReply={canReply}
              included={included}
              key={commentUuid}
              data={comment}
            />
          )
        })
      ) : null}
      {expandedComments ? (
        comments.slice(startingCommentCount, comments.size).map((comment) => {
          const commentUuid = comment.get('uuid')
          return (
            <Activity
              highlightReaction={highlightReaction}
              removeActivity={removeActivity}
              removeReaction={removeReaction}
              dismissModal={dismissModal}
              expanded={expandedComments}
              renderModal={renderModal}
              addReaction={addReaction}
              userUuid={userUuid}
              canReply={canReply}
              included={included}
              key={commentUuid}
              data={comment}
            />
          )
        })
      ) : null}
    </ul>
  )
}


function renderMoreCommentNum (commentListLength) {
  if (commentListLength > 21) return 'View 20 + more comments'
  return `View ${commentListLength - 1} more comments`
}

function renderViewMore (commentListLength, toggleExpandComments) {
  if (commentListLength === 2) {
    return (
      <div
        className={'comment-list__view-more'}
        onClick={toggleExpandComments}
      >
        {'View 1 more comment'}
      </div>
    )
  }
  if (commentListLength > 2) {
    return (
      <div
        className={'comment-list__view-more'}
        onClick={toggleExpandComments}
      >
        {renderMoreCommentNum(commentListLength)}
      </div>
    )
  }
  return null
}

export default function CommentList (props) {
  const {
    startingCommentCount,
    toggleExpandComments,
    highlightReaction,
    expandedComments,
    removeActivity,
    removeReaction,
    dismissModal,
    addReaction,
    renderModal,
    activityRef,
    viewMore,
    comments,
    included,
    canReply,
    userUuid,
  } = props

  return (
    <React.Fragment>
      {(comments && comments.size > 0)
        ? (
          <div className={'comment-list'}>
            <CommentsContent
              startingCommentCount={startingCommentCount}
              highlightReaction={highlightReaction}
              expandedComments={expandedComments}
              removeActivity={removeActivity}
              removeReaction={removeReaction}
              dismissModal={dismissModal}
              addReaction={addReaction}
              renderModal={renderModal}
              canReply={canReply}
              comments={comments}
              included={included}
              userUuid={userUuid}
            />
            <CommentListFooter
              toggleExpandComments={toggleExpandComments}
              expandedComments={expandedComments}
              activityRef={activityRef}
              viewMore={viewMore}
              comments={comments}
            />
          </div>
        )
        : null
      }
    </React.Fragment>
  )
}

CommentList.propTypes = {
  toggleExpandComments: PropTypes.func.isRequired,
  comments: ImmutablePropTypes.list.isRequired,
  included: ImmutablePropTypes.list.isRequired,
  removeActivity: PropTypes.func.isRequired,
  removeReaction: PropTypes.func.isRequired,
  dismissModal: PropTypes.func.isRequired,
  addReaction: PropTypes.func.isRequired,
  renderModal: PropTypes.func.isRequired,
  startingCommentCount: PropTypes.number,
  highlightReaction: PropTypes.string,
  expandedComments: PropTypes.bool,
  activityRef: PropTypes.object,
  userUuid: PropTypes.string,
  viewMore: PropTypes.bool,
  canReply: PropTypes.bool,
}
