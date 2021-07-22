import React from 'react'
import { Map, List } from 'immutable'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRedux } from 'react-redux'
import { isEntitled, isFeatureAllowedWithSubscription } from 'services/subscription'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import PropTypes from 'prop-types'
import { TYPE_CONTENT_VIDEO, TYPE_CONTENT_EPISODE, TYPE_CONTENT_SERIES } from 'services/content-type'
import { STORE_KEY_DETAIL_FEATURED_EPISODE } from 'services/store-keys'
import Button from 'components/Button'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import ProgressBar, { PROGRESS_BAR_TYPE_GRADIENT } from 'components/ProgressBar'
import Watch, { WATCH_RENDER_TYPE_BUTTON } from 'components/Watch'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import WatchAccess, {
  ACCESS_CHECK_AUTH_FEATURE_GEO,
} from 'components/WatchAccess'
import WithAuth from 'components/WithAuth'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccessDenied from 'components/WatchAccessDenied'
import {
  createUpstreamContext,
  SCREEN_TYPE_DETAIL_SERIES,
  SCREEN_TYPE_DETAIL_VIDEO,
  CONTEXT_TYPE_SERIES_ENTITY,
  CONTEXT_TYPE_VIDEO_ENTITY,
} from 'services/upstream-context'

function FloatingActionToolbar (props) {
  const {
    staticText,
    auth,
    preview,
    feature,
    type,
    path,
    contentId,
    featuredEpisode,
    userInfo,
  } = props
  const featuredEpisodeFeature = featuredEpisode.get('feature')
  const featuredEpisodePreview = featuredEpisode.get('preview')
  const featuredEpisodeExists = featuredEpisode.get('id') && `/${featuredEpisode.get('seriesPath')}` === path
  const featurePosition = userInfo.get('featurePosition', null) ||
    (featuredEpisodeExists ? featuredEpisode.getIn(['userInfo', 'featurePosition'], null) : null)
  const duration = feature.get('duration') || featuredEpisode.getIn(['feature', 'duration'])
  const noPreview = preview.get('id') < 0
  const authToken = auth.get('jwt')

  const getUpstreamContext = () => {
    let upstreamContext = Map()

    if (type === TYPE_CONTENT_SERIES) {
      upstreamContext = createUpstreamContext({
        storeKey: STORE_KEY_DETAIL_FEATURED_EPISODE,
        screenType: SCREEN_TYPE_DETAIL_SERIES,
        contextType: CONTEXT_TYPE_SERIES_ENTITY,
        screenParam: contentId,
      })
    } else if (type === TYPE_CONTENT_EPISODE || type === TYPE_CONTENT_VIDEO) {
      upstreamContext = createUpstreamContext({
        screenType: SCREEN_TYPE_DETAIL_VIDEO,
        contextType: CONTEXT_TYPE_VIDEO_ENTITY,
        screenParam: contentId,
        videoId: contentId,
      })
    }

    return upstreamContext
  }

  const renderProgressBar = () => {
    if (!userInfo || !duration || !userInfo.get('featurePosition')) {
      return null
    }

    return (
      <WithAuth>
        <div className="floating-action-toolbar__progress">
          <ProgressBar
            duration={duration}
            userInfo={userInfo}
            type={PROGRESS_BAR_TYPE_GRADIENT}
          />
        </div>
      </WithAuth>
    )
  }

  const renderFollowSeries = () => {
    if (type !== TYPE_CONTENT_SERIES) {
      return null
    }

    return (
      <WithAuth>
        <div className="floating-action-toolbar__follow-series">
          <NotificationsFollowButton
            subscriptionType={SUBSCRIPTION_TYPES.SERIES}
            contentId={contentId}
            type={BUTTON_TYPES.ROUND}
          />
        </div>
      </WithAuth>
    )
  }

  const renderPreview = () => {
    if (!authToken && noPreview) {
      return (
        <div className="floating-action-toolbar__blurb">
          {staticText.getIn(['data', 'discoverGaia'])}
        </div>
      )
    } else if (authToken && noPreview) {
      return null
    }

    return (
      <Button
        text={
          type === TYPE_CONTENT_EPISODE ? staticText.getIn(['data', 'watchPreview'], '') : staticText.getIn(['data', 'watchTrailer'], '')}
        url={path}
        query={{ fullplayer: 'preview' }}
        buttonClass={[
          'button--secondary',
          'floating-action-toolbar__preview-button',
          'floating-action-toolbar__primary-action--static',
        ]}
      />
    )
  }

  const renderWatch = () => {
    const userHasAnEntitlement = isEntitled(auth.get('subscriptions', List()))
    const featureIsAllowed = isFeatureAllowedWithSubscription(feature, auth)

    if (!userHasAnEntitlement && !featureIsAllowed) {
      return (
        <ButtonSignUp
          text={staticText.getIn(['data', 'signup'], '')}
          buttonClass={['button--primary', 'floating-action-toolbar__primary-action']}
          type={BUTTON_SIGN_UP_TYPE_BUTTON}
          scrollToTop
        />
      )
    } else if (type !== TYPE_CONTENT_SERIES && userHasAnEntitlement && !featureIsAllowed) {
      return (
        <Button
          url={'/account'}
          text={staticText.getIn(['data', 'upgradeToWatch'], '')}
          buttonClass={['button--primary', 'floating-action-toolbar__primary-action']}
        />
      )
    } else if (type === TYPE_CONTENT_SERIES && !featuredEpisodeExists) {
      // wait for the featured episode data to arrive
      return null
    } else if (type === TYPE_CONTENT_SERIES && authToken && !featuredEpisode.getIn(['userInfo', 'id'])) {
      // wait for the userInfo data to arrive if logged in
      return null
    }

    return (
      <Watch
        text={featurePosition > 0 && featurePosition < duration ? staticText.getIn(['data', 'continueWatching']) : null}
        url={featuredEpisodeExists ? `/${featuredEpisode.get('url')}` : path}
        auth={auth}
        feature={featuredEpisodeExists ? featuredEpisodeFeature : feature}
        preview={featuredEpisodeExists ? featuredEpisodePreview : preview}
        renderType={WATCH_RENDER_TYPE_BUTTON}
        upstreamContext={getUpstreamContext()}
        buttonClass={['button--primary', 'floating-action-toolbar__primary-action']}
        iconClass={['icon--play-fill', 'icon--white', 'icon--small', 'floating-action-toolbar__play-icon']}
      />
    )
  }

  return (
    <div className="floating-action-toolbar">
      {renderProgressBar()}
      <div className={'floating-action-toolbar__container'}>
        <WatchAccess
          auth={auth}
          preview={featuredEpisodeExists ? featuredEpisodePreview : preview}
          feature={featuredEpisodeExists ? featuredEpisodeFeature : feature}
          accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
        >
          <WatchAccessAllowed>
            <div className={'floating-action-toolbar__buttons'}>
              {renderWatch()}
              {renderPreview()}
            </div>
          </WatchAccessAllowed>
          <WatchAccessDenied>
            <div className={'floating-action-toolbar__buttons'}>
              {renderPreview()}
            </div>
          </WatchAccessDenied>
        </WatchAccess>
        {renderFollowSeries()}
      </div>
    </div>
  )
}

FloatingActionToolbar.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map,
  featuredEpisode: ImmutablePropTypes.map.isRequired,
  feature: ImmutablePropTypes.map.isRequired,
  preview: ImmutablePropTypes.map.isRequired,
  userInfo: ImmutablePropTypes.map.isRequired,
  path: PropTypes.string.isRequired,
  contentId: PropTypes.number.isRequired,
  type: PropTypes.oneOf([
    TYPE_CONTENT_VIDEO,
    TYPE_CONTENT_EPISODE,
    TYPE_CONTENT_SERIES,
  ]),
}

FloatingActionToolbar.defaultProps = {
  featuredEpisode: Map(),
  userInfo: Map(),
}

export default compose(
  connectRedux(
    (state) => {
      return {
        featuredEpisode: state.tiles.getIn([STORE_KEY_DETAIL_FEATURED_EPISODE, 'data', 'titles', 0]),
        auth: state.auth,
        preview: state.detail.getIn(['data', 'preview']),
        feature: state.detail.getIn(['data', 'feature']),
        path: state.detail.get('path'),
        contentId: state.detail.getIn(['data', 'id']),
        userInfo: state.jumbotron.getIn(['detail', 'data', 'userInfo']),
      }
    },
  ),
  connectStaticText({ storeKey: 'floatingActionToolbar' }),
)(FloatingActionToolbar)
