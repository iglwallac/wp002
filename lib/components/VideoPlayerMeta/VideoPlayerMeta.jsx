import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import _concat from 'lodash/concat'
import _join from 'lodash/join'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import Button from 'components/Button'
import TextSeasonEpisode from 'components/TextSeasonEpisode'
import {
  isTypeYogaFitnessEpisode,
  isTypeYogaFitnessVideo,
} from 'services/content-type'
import {
  NotificationsFollowButton,
  BUTTON_TYPES,
} from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import WithAuth from 'components/WithAuth'
import { TYPE_SHARE_V2_SHARE } from 'services/dialog'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, Map } from 'immutable'
import { isEntitled } from 'services/subscription'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import { formatDuration } from 'theme/web-app'
import { H3, H2 } from 'components/Heading'


function closeShareDialog (props) {
  const { clearShare } = props
  clearShare()
}

function getClassName (props) {
  const className = _concat(['video-player-meta'], props.className || [])
  if (props.visible) {
    className.push('video-player-meta--visible')
  }
  return _join(className, ' ')
}

function VideoPlayerMeta (props) {
  const {
    seriesId,
    title,
    series,
    copyright,
    contentType,
    season,
    episode,
    isShareable,
    staticText,
    playerPlayOrPause,
    playerPlay,
    playerPause,
    isPlaying,
    auth,
    id,
    upstreamContext,
    duration,
    clearUpstreamContext,
    refreshComments,
    comments,
    video,
    videoPlayerInfoDisabled,
  } = props

  const [mobileVisibility, setMobileVisibility] = useState('__invisible')
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const isYogaFitnessMeditationEpisode = isTypeYogaFitnessEpisode(contentType)
  const isYogaFitnessMeditationVideo = isTypeYogaFitnessVideo(contentType)
  const isFullscreen =
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement

  const renderShareModal = useCallback(() => {
    const wasPlaying = isPlaying()
    playerPause()
    props.renderModal(TYPE_SHARE_V2_SHARE, {
      onDismiss: () => {
        if (wasPlaying) playerPlay()
        closeShareDialog(props)
      },
      contentId: props.id,
      type: 'VIDEO',
      enableTime: true,
      title: props.title,
    })
  }, [])

  const onCommentsClicked = () => {
    playerPause()
    clearUpstreamContext()
    refreshComments({
      contentId: id,
      commentsId: comments.getIn(['data', 'id']),
      metadata: video.get('data', Map()).toJS(),
      jwt: auth.get('jwt'),
    })
  }


  return (
    <div
      className={`${getClassName(props)}`}
      onClick={playerPlayOrPause}
    >
      {!videoPlayerInfoDisabled ?
        <div className={'expandable'}>
          <H2 inverted className="video-player-meta__title">{title}</H2>
          <div className="expandable__content">

            <H3 inverted className="video-player-meta__series-title">
              {series}
            </H3>
            <div className="video-player-meta__meta-details">
              <TextSeasonEpisode
                className={['video-player-meta__season-episode']}
                season={season}
                episode={episode}
              />
              <span className="video-player-meta__duration">
                {formatDuration(duration)}
              </span>
              {!isYogaFitnessMeditationEpisode && !isYogaFitnessMeditationVideo ? (
                <span className="video-player-meta__season-episode">{copyright}</span>
              ) : null}

            </div>
            <Button
              text={''}
              buttonClass={[
                'button--ghost',
                'button--with-icon',
                'button--stacked',
                'video-player-meta__action-button',
                'mobile-button-menu',
              ]}
              onClick={() => { setMobileVisibility('') }}
              iconClass={['icon-v2 icon-v2--ellipsis']}
            />
            <div className="video-player-meta__actions-container ">
              <WithAuth>
                <PlaylistAddRemove
                  upstreamContext={upstreamContext}
                  contentId={seriesId || id}
                  circlularIcon
                />
              </WithAuth>
              {seriesId ? (
                <NotificationsFollowButton
                  className="video-player-meta__action-button"
                  subscriptionType={SUBSCRIPTION_TYPES.SERIES}
                  type={BUTTON_TYPES.LINK}
                  contentId={seriesId}
                />
              ) : null}
              {isShareable && !isFullscreen && userIsEntitled ? (
                <WithAuth>
                  <Button
                    text={staticText.getIn(['data', 'share'])}
                    buttonClass={[
                      'button--ghost',
                      'button--with-icon',
                      'button--stacked',
                      'video-player-meta__action-button',
                    ]}
                    onClick={renderShareModal}
                    iconClass={['icon-v2 icon-v2--circular-share']}
                  />
                </WithAuth>
              ) : null}
              <Button
                text={staticText.getIn(['data', 'comments'])}
                buttonClass={[
                  'button--ghost',
                  'button--with-icon',
                  'button--stacked',
                  'video-player-meta__action-button',
                  'button-comment',
                ]}
                onClick={onCommentsClicked}
                iconClass={['icon-v2 icon-v2--circular-comments']}
              />
            </div>
          </div>

        </div>
        : null
      }
      <div className={`overlay-mobile${mobileVisibility}`}>
        <div className="options-container">
          <Button
            text={'Options'}
            buttonClass={[
              'button--ghost',
              'button--with-icon',
              'button--stacked',
              'video-player-meta__action-button',
            ]}
            onClick={() => { setMobileVisibility('__invisible') }}
            iconClass={['icon-v2 icon-v2--chevron-left']}
          />
          <Button
            text={' '}
            buttonClass={[
              'button--ghost',
              'button--with-icon',
              'button--stacked',
              'video-player-meta__action-button',
            ]}
            onClick={() => { setMobileVisibility('__invisible') }}
            iconClass={['icon-v2 icon-v2--close']}
          />
        </div>
        <div className="links-container">
          <WithAuth>
            <PlaylistAddRemove
              upstreamContext={upstreamContext}
              contentId={seriesId || id}
              circlularIcon
            />
          </WithAuth>
          {seriesId ? (
            <NotificationsFollowButton
              className="video-player-meta__action-button"
              subscriptionType={SUBSCRIPTION_TYPES.SERIES}
              type={BUTTON_TYPES.LINK}
              contentId={seriesId}
            />
          ) : null}
          {isShareable && !isFullscreen && userIsEntitled ? (
            <WithAuth>
              <Button
                text={staticText.getIn(['data', 'share'])}
                buttonClass={[
                  'button--ghost',
                  'button--with-icon',
                  'button--stacked',
                  'video-player-meta__action-button',
                ]}
                onClick={renderShareModal}
                iconClass={['icon-v2 icon-v2--circular-share']}
              />
            </WithAuth>
          ) : null}
          <Button
            text={staticText.getIn(['data', 'comments'])}
            buttonClass={[
              'button--ghost',
              'button--with-icon',
              'button--stacked',
              'video-player-meta__action-button',
              'button-comment',
            ]}
            onClick={onCommentsClicked}
            iconClass={['icon-v2 icon-v2--circular-comments']}
          />
        </div>
      </div>
    </div>
  )
}

VideoPlayerMeta.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  series: PropTypes.string,
  seriesId: PropTypes.number,
  host: PropTypes.string,
  season: PropTypes.number,
  episode: PropTypes.number,
  copyright: PropTypes.string,
  contentType: PropTypes.string,
  description: PropTypes.string,
  geoAvailibility: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  moreVisible: PropTypes.bool,
  className: PropTypes.array,
  toggleMoreVisible: PropTypes.func,
  setAutoHide: PropTypes.func,
  playerPause: PropTypes.func.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'videoPlayerMeta' }),
  connectRedux(
    (state) => {
      return {
        isShareable: state.media.getIn(['data', 'isShareable'], false),
        auth: state.auth,
        comments: state.comments,
        video: state.video,
        videoPlayerInfoDisabled: state.featureTracking.getIn(
          ['data', 'disableVideoInfo'],
          false,
        ),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        renderModal: actions.dialog.renderModal,
        clearShare: actions.share.clearShare,
        clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
        refreshComments: actions.comments.refreshComments,
        setFeatureTrackingDataPersistent:
          actions.featureTracking.setFeatureTrackingDataPersistent,
      }
    },
  ),
)(VideoPlayerMeta)
