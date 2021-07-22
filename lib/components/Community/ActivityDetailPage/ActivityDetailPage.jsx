import { selectActivityNode, selectActivity } from 'services/community/selectors'
import { Switch, Case, Default } from 'components/Conditionals'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { connect as connectRedux } from 'react-redux'
import Activity from 'components/Community/Activity'
import { Button, TYPES } from 'components/Button.v2'
import { ReplaceHistory } from 'components/Redirect'
import { getBoundActions } from 'actions'
import React, { useEffect } from 'react'
import { Map, List } from 'immutable'
import PropTypes from 'prop-types'


function ActivityDetailPage (props) {
  const {
    setEventUserInteraction,
    forbidden,
    isWebView,
    activity,
    error,
  } = props

  const communityUrl = isWebView ? '/community?webview=true' : '/community'
  const activityId = activity.getIn(['data', 'uuid'], '')
  const included = activity.get('included', List())
  const data = activity.get('data', Map())
  const root = data.getIn(['relationships', 'root'], null) || data
  const node = selectActivityNode(root, included)
  const deleted = node && !node.get('published')

  if (forbidden) {
    return <ReplaceHistory url="/" />
  }

  useEffect(() => {
    if (activity.size > 0) {
      setEventUserInteraction({
        label: activityId,
        category: 'community',
        action: 'postPageView',
      })
    }
  }, [activity])


  return (
    <div className="activity-detail">
      <Switch>
        <Case condition={!error && activity.size > 0}>
          {() => (
            <div className="activity-detail__activity-container">
              <Button
                className="activity-detail__view-feed-link"
                url={communityUrl}
                type={TYPES.LINK}
                scrollToTop
              >
                View Community Feed
              </Button>
              {deleted
                ? <p className="activity-detail__text">This post has been deleted.</p>
                : (
                  <React.Fragment>
                    <Activity
                      highlightReaction={activityId}
                      included={included}
                      expandedComments
                      data={root}
                    />
                    <Button
                      className="activity-detail__view-feed-link"
                      url={communityUrl}
                      type={TYPES.LINK}
                      scrollToTop
                    >
                    View Community Feed
                    </Button>
                  </React.Fragment>
                )}
            </div>
          )}
        </Case>
        <Case condition={error}>
          {() => (
            <div className="activity-detail__activity-container">
              <Button
                className="activity-detail__view-feed-link"
                url={communityUrl}
                type={TYPES.LINK}
                scrollToTop
              >
                View Community Feed
              </Button>
              <p className="activity-detail__text">This activity could not be found.</p>
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
  activity: ImmutablePropTypes.map.isRequired,
  isWebView: PropTypes.bool.isRequired,
  forbidden: PropTypes.bool,
  error: PropTypes.number,
}

export default connectRedux(({ community, app }, { activityId }) => {
  const error = community.getIn(['errors', 0, 'status'])
  return {
    activity: selectActivity(community, activityId),
    forbidden: error === 403 || error === 401,
    isWebView: app.get('isWebView', false),
    error,
  }
},
(dispatch) => {
  const { eventTracking } = getBoundActions(dispatch)
  return {
    setEventUserInteraction: eventTracking.setEventUserInteraction,
  }
})(ActivityDetailPage)
