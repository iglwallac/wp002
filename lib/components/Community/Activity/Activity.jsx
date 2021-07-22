import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import React from 'react'

import Comment from './_Comment'
import Post from './_Post'

export const TYPES = {
  COMMENT: 'COMMENT',
  POST: 'POST',
}

function Activity ({
  toggleExpandComments,
  startingCommentCount,
  highlightReaction,
  expandedComments,
  removeReaction,
  removeActivity,
  dismissModal,
  activityRef,
  addReaction,
  renderModal,
  included,
  userUuid,
  canReply,
  viewMore,
  data,
  key,
}) {
  //
  const type = data.get('type')

  if (type === TYPES.POST) {
    return (
      <Post
        highlightReaction={highlightReaction}
        expandedComments={expandedComments}
        removeActivity={removeActivity}
        removeReaction={removeReaction}
        dismissModal={dismissModal}
        addReaction={addReaction}
        renderModal={renderModal}
        included={included}
        userUuid={userUuid}
        data={data}
        key={key}
      />
    )
  }

  if (type === TYPES.COMMENT) {
    return (
      <Comment
        toggleExpandComments={toggleExpandComments}
        startingCommentCount={startingCommentCount}
        highlightReaction={highlightReaction}
        expandedComments={expandedComments}
        removeActivity={removeActivity}
        removeReaction={removeReaction}
        dismissModal={dismissModal}
        addReaction={addReaction}
        renderModal={renderModal}
        activityRef={activityRef}
        canReply={canReply}
        viewMore={viewMore}
        included={included}
        userUuid={userUuid}
        data={data}
        key={key}
      />
    )
  }

  return null
}

Post.defaultProps = {
  expandComments: false,
  highlightReaction: '',
}

Post.propTypes = {
  included: ImmutablePropTypes.list.isRequired,
  removeActivity: PropTypes.func.isRequired,
  removeReaction: PropTypes.func.isRequired,
  data: ImmutablePropTypes.map.isRequired,
  dismissModal: PropTypes.func.isRequired,
  addReaction: PropTypes.func.isRequired,
  renderModal: PropTypes.func.isRequired,
  userUuid: PropTypes.string.isRequired,
  toggleExpandComments: PropTypes.func,
  startingCommentCount: PropTypes.bool,
  highlightReaction: PropTypes.string,
  expandedComments: PropTypes.bool,
  activityRef: PropTypes.object,
  canReply: PropTypes.bool,
  key: PropTypes.string,
}

export default connectRedux(({ auth }) => {
  return {
    userUuid: auth.get('uuid'),
  }
},
(dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    removeActivity: actions.community.removeActivity,
    removeReaction: actions.community.removeReaction,
    addReaction: actions.community.addReaction,
    dismissModal: actions.dialog.dismissModal,
    renderModal: actions.dialog.renderModal,
  }
},
)(Activity)
