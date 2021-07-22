import { selectDraft, selectAuth } from 'services/getstream/selectors'
import { ACTIVITY, ACTIVITY_VERBS } from 'services/getstream/activity'
import { connect as connectRedux } from 'react-redux'
import UniqueId from 'components/UniqueId'
import React, { useCallback } from 'react'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import PropTypes from 'prop-types'
import Form from './_Form'

function ActivityForm (props) {
  const {
    addActivity,
    feedGroup,
    uniqueId,
    activity,
    feedId,
  } = props

  const onSubmit = useCallback(() => {
    if (activity.get('object')) {
      addActivity({
        draftId: uniqueId,
        feedGroup,
        feedId,
      })
    }
  }, [
    feedGroup,
    uniqueId,
    activity,
    feedId,
  ])
  return (
    <Form
      {...props}
      onSubmit={onSubmit}
      draft={activity}
    />
  )
}

ActivityForm.defaultProps = {
  photoUpload: false,
  openGraph: false,
}

ActivityForm.propTypes = {
  deleteDraftOpenGraph: PropTypes.func.isRequired,
  deleteDraftAttachment: PropTypes.func.isRequired,
  targetFeeds: PropTypes.arrayOf(PropTypes.string),
  deleteDraft: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
  addActivity: PropTypes.func.isRequired,
  uniqueId: PropTypes.string.isRequired,
  photoUpload: PropTypes.bool,
  openGraph: PropTypes.bool,
  verb: PropTypes.oneOf([
    ACTIVITY_VERBS.POST,
  ]).isRequired,
}

export default compose(
  UniqueId('activity-form'),
  connectRedux(
    ({ getstream }, { uniqueId: draftId }) => ({
      activity: selectDraft(getstream, draftId, ACTIVITY),
      streamAuth: selectAuth(getstream),
    }),
    (dispatch) => {
      const { getstream } = getBoundActions(dispatch)
      return {
        deleteDraftAttachment: getstream.deleteDraftAttachment,
        deleteDraftOpenGraph: getstream.deleteDraftOpenGraph,
        updateDraft: getstream.updateDraft,
        deleteDraft: getstream.deleteDraft,
        addActivity: getstream.addActivity,
      }
    },
  ),
)(ActivityForm)
