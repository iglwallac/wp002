import { Map } from 'immutable'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import React, { useCallback } from 'react'
import { connect as connectRedux } from 'react-redux'
import { COMMUNITY_PAGE_HERO_TEXT } from 'services/getstream'
import { StreamApp, FeedPlaceholder, FlatFeed, InifiniteScrollPaginator } from 'react-activity-feed'
import { selectAuth, selectMainFeed, selectAuthForbidden } from 'services/getstream/selectors'
import { StreamActivityForm, ACTIVITY_VERBS } from 'components/Getstream/StreamForm'
import { Switch, Case, Default } from 'components/Conditionals'
import Jumbotron from 'components/JumbotronSubcategory'
import { ReplaceHistory } from 'components/Redirect'
import Activity from 'components/Getstream/Activity'
import Sherpa from 'components/Sherpa'

const HERO_IMAGE = Map({
  small: 'https://brooklyn.gaia.com/v1/image-render/ed43a2a9-b841-4341-8ec7-8caf0da1a259/community-banner-768.jpg',
  large: 'https://brooklyn.gaia.com/v1/image-render/6f029dec-e06a-45d1-91e6-f3910e2bfef5/community-banner-1440.jpg',
})

function CommunityFeedPage ({
  setOverlayDialogVisible,
  doToggleChildReactions,
  removeActivity,
  dismissModal,
  renderModal,
  streamAuth,
  forbidden,
  feed,
  auth,
}) {
  const userId = streamAuth.get('userId')
  const apiKey = streamAuth.get('apiKey')
  const token = streamAuth.get('token')
  const appId = streamAuth.get('appId')
  const feedId = feed.get('id')

  const error = streamAuth.get('error')
    || feed.get('error')

  const profileImage = streamAuth.getIn(
    ['data', 'profileImage'], '')

  const renderActivity = useCallback(({
    onToggleReaction,
    activity,
  }) => (
    <Activity
      onToggleChildReaction={doToggleChildReactions}
      onToggleReaction={onToggleReaction}
      removeActivity={removeActivity}
      profileImage={profileImage}
      dismissModal={dismissModal}
      renderModal={renderModal}
      activity={activity}
      userId={userId}
    />
  ), [userId, profileImage])

  if (forbidden) {
    return <ReplaceHistory url="/" />
  }

  return (
    <div className="community-feed-page">
      <Jumbotron
        setOverlayDialogVisible={setOverlayDialogVisible}
        description={COMMUNITY_PAGE_HERO_TEXT}
        truncateDescription={false}
        heroImage={HERO_IMAGE}
        title="Community"
        auth={auth}
      />
      <div className="community-feed-page__container">
        <Switch>
          <Case condition={token && feedId}>
            {() => (
              <StreamApp
                apiKey={apiKey}
                appId={appId}
                token={token}
              >
                <StreamActivityForm
                  verb={ACTIVITY_VERBS.POST}
                  targetFeeds={[feedId]}
                  feedGroup="user"
                  feedId={userId}
                  photoUpload
                  openGraph
                />
                <FlatFeed
                  Paginator={InifiniteScrollPaginator}
                  Placeholder={FeedPlaceholder}
                  feedGroup={feed.get('slug')}
                  userId={feed.get('userId')}
                  Activity={renderActivity}
                  notify
                />
              </StreamApp>
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
            {() => <Sherpa />}
          </Default>
        </Switch>
      </div>
    </div>
  )
}

CommunityFeedPage.propTypes = {
  apiKey: PropTypes.string,
  appId: PropTypes.string,
}

export default connectRedux(({ auth, getstream }) => ({
  forbidden: selectAuthForbidden(getstream),
  streamAuth: selectAuth(getstream),
  feed: selectMainFeed(getstream),
  auth,
}),
(dispatch) => {
  const actions = getBoundActions(dispatch)

  return {
    setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
    doToggleChildReactions: actions.getstream.doToggleChildReactions,
    removeActivity: actions.getstream.removeActivity,
    dismissModal: actions.dialog.dismissModal,
    renderModal: actions.dialog.renderModal,
  }
})(CommunityFeedPage)
