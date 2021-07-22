import { selectAuth, selectActivity, selectAuthForbidden } from 'services/getstream/selectors'
import { Switch, Case, Default } from 'components/Conditionals'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { connect as connectRedux } from 'react-redux'
import Activity from 'components/Getstream/Activity'
import { ReplaceHistory } from 'components/Redirect'
import { Button, TYPES } from 'components/Button.v2'
import React, { useEffect, useState, useCallback } from 'react'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'

function noop () {}

function ActivityDetailPage ({
  setEventUserInteraction,
  removeActivity,
  dismissModal,
  renderModal,
  reactionId,
  streamAuth,
  isWebView,
  forbidden,
  activity, // not currently immutable
}) {
  const userId = streamAuth.get('userId')
  const error = streamAuth.get('error') || activity.error
  const profileImage = streamAuth.getIn(['data', 'profileImage'])
  const processing = !error && (streamAuth.get('processing')
    || activity.processing || !activity.id)
  const communityUrl = isWebView ? '/community?webview=true' : '/community'

  const [deleted, setDeleted] = useState(false)

  const deleteActivity = useCallback(() => {
    removeActivity({ activity, feedId: userId, feedGroup: 'user' })
    setDeleted(true)
  }, [activity, userId])

  useEffect(() => {
    if (activity.id) {
      setEventUserInteraction({
        label: activity.id,
        category: 'community',
        action: 'postPageView',
      })
    }
  }, [activity])

  if (forbidden) {
    return <ReplaceHistory url="/" />
  }

  return (
    <div className="activity-detail">
      <Switch>
        <Case condition={!processing}>
          {() => (
            <div className="activity-detail__activity-container">
              <Button className="activity-detail__view-feed-link" url={communityUrl} type={TYPES.LINK} scrollToTop>
                View Community Feed
              </Button>
              {deleted
                ? <p className="activity-detail__deleted">This content has been deleted.</p>
                : <Activity
                  removeActivity={deleteActivity}
                  highlightReaction={reactionId}
                  onToggleChildReaction={noop}
                  profileImage={profileImage}
                  dismissModal={dismissModal}
                  renderModal={renderModal}
                  onToggleReaction={noop}
                  activity={activity}
                  userId={userId}
                  expandComments
                />}
              {deleted
                ? null
                : <Button className="activity-detail__view-feed-link" url={communityUrl} type={TYPES.LINK} scrollToTop>
                  View Community Feed
                </Button>}
            </div>
          )}
        </Case>
        <Case condition={error}>
          {() => (
            <div>
              <Sherpa />
              <p>{'Looks like we\'re having trouble connecting to the community at the moment.'}</p>
            </div>
          )}
        </Case>
        <Default>
          {() => <Sherpa type={TYPE_LARGE} />}
        </Default>
      </Switch>
    </div>
  )
}

ActivityDetailPage.propTypes = {
  setEventUserInteraction: PropTypes.func.isRequired,
}

export default connectRedux(({ getstream, app }, { activityId }) => ({
  activity: selectActivity(getstream, activityId),
  forbidden: selectAuthForbidden(getstream),
  streamAuth: selectAuth(getstream),
  isWebView: app.get('isWebView', false),
}),
(dispatch) => {
  const { eventTracking, getstream, dialog } = getBoundActions(dispatch)
  return {
    setEventUserInteraction: eventTracking.setEventUserInteraction,
    removeActivity: getstream.removeActivity,
    dismissModal: dialog.dismissModal,
    renderModal: dialog.renderModal,
  }
})(ActivityDetailPage)
