import { selectDraft, selectAuth } from 'services/getstream/selectors'
import { REACTION, REACTION_KINDS } from 'services/getstream/reaction'
import { connect as connectRedux } from 'react-redux'
import UniqueId from 'components/UniqueId'
import React, { useCallback } from 'react'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import PropTypes from 'prop-types'

import Form from './_Form'

function ReactionForm (props) {
  const {
    addReaction,
    uniqueId,
    reaction,
  } = props

  const onSubmit = useCallback(() => {
    if (reaction.get('object')) {
      addReaction({
        draftId: uniqueId,
      })
    }
  }, [
    uniqueId,
    reaction,
  ])

  return (
    <Form
      {...props}
      onSubmit={onSubmit}
      openGraph={false}
      draft={reaction}
    />
  )
}

ReactionForm.defaultProps = {
  photoUpload: false,
  openGraph: false,
}

ReactionForm.propTypes = {
  deleteDraftOpenGraph: PropTypes.func.isRequired,
  deleteDraftAttachment: PropTypes.func.isRequired,
  targetFeeds: PropTypes.arrayOf(PropTypes.string),
  activityId: PropTypes.string.isRequired,
  deleteDraft: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
  addReaction: PropTypes.func.isRequired,
  uniqueId: PropTypes.string.isRequired,
  photoUpload: PropTypes.bool,
  openGraph: PropTypes.bool,
  kind: PropTypes.oneOf([
    REACTION_KINDS.COMMENT,
    REACTION_KINDS.REPLY,
  ]).isRequired,
}

export default compose(
  UniqueId('reaction-form'),
  connectRedux(
    ({ getstream }, { uniqueId: draftId }) => ({
      reaction: selectDraft(getstream, draftId, REACTION),
      streamAuth: selectAuth(getstream),
    }),
    (dispatch) => {
      const { getstream } = getBoundActions(dispatch)
      return {
        deleteDraftAttachment: getstream.deleteDraftAttachment,
        deleteDraftOpenGraph: getstream.deleteDraftOpenGraph,
        updateDraft: getstream.updateDraft,
        deleteDraft: getstream.deleteDraft,
        addReaction: getstream.addReaction,
      }
    },
  ),
)(ReactionForm)
