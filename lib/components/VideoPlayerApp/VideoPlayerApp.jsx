import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import _partial from 'lodash/partial'
import {
  STORE_KEY_VIDEO_PLAYER_COMMENTS_TOOL_TIP,
} from 'services/store-keys'
import VideoPlayerMeta from 'components/VideoPlayerMeta'
import VideoPlayerBack from 'components/VideoPlayerBack'

function onClick (e, props) {
  const { setVideoPlayerMetaAutoHide, setVideoPlayerMetaMoreVisible } = props
  setVideoPlayerMetaAutoHide(true)
  setVideoPlayerMetaMoreVisible(false)
}

class VideoPlayerApp extends Component {
  componentWillReceiveProps (props) {
    if (!process.env.BROWSER) {
      return
    }
    const { videoPlayer, toolTip, setToolTipVisible } = props
    const videoLoading = videoPlayer.get('loading', null)
    const commentsToolTipVisible = toolTip.getIn(
      [STORE_KEY_VIDEO_PLAYER_COMMENTS_TOOL_TIP, 'visible'],
      null,
    )
    if (
      videoLoading === false &&
      toolTip.get('initializedFeatureTracking') &&
      commentsToolTipVisible === null
    ) {
      setToolTipVisible(STORE_KEY_VIDEO_PLAYER_COMMENTS_TOOL_TIP, true)
    }
  }

  pausePlayer = () => {
    const { props } = this
    const { player } = props
    if (!player) {
      return
    }
    try {
      player.pause()
    } catch (e) {
      // Do nothing player errored
    }
  }

  playPlayer = () => {
    const { props } = this
    const { player } = props
    if (!player) {
      return
    }
    try {
      player.play()
    } catch (e) {
      // Do nothing player errored
    }
  }

  isPlaying = () => {
    const { props } = this
    const { player } = props
    if (!player) {
      return false
    }
    return !player.paused()
  }

  playerPlayOrPause = () => {
    const { props } = this
    const { player } = props
    if (!player) return
    try {
      if (player.paused()) {
        player.play()
        return
      }
      player.pause()
    } catch (e) {
      // Do nothing player call failed
    }
  }

  render () {
    const {
      props,
      pausePlayer,
      playerPlayOrPause,
      playPlayer,
      isPlaying,
    } = this
    const {
      location,
      video,
      videoPlayer,
      history,
    } = props
    const {
      setVideoPlayerMetaAutoHide,
      toggleVideoPlayerMetaMoreVisible,
    } = props
    const metaAutoHide = videoPlayer.get('metaAutoHide', true)
    const metaVisible = videoPlayer.get('metaVisible', true)
    const metaMoreVisible = videoPlayer.get('metaMoreVisible', true)
    return (
      <div
        className={`video-player-app${metaVisible ? ' video-player-app--visible' : ''}`}
        onClick={_partial(onClick, _partial.placeholder, props)}
      >
        <VideoPlayerBack
          history={history}
          location={location}
          visible={metaVisible}
        />
        <VideoPlayerMeta
          id={video.getIn(['data', 'id'])}
          title={video.getIn(['data', 'title'])}
          series={video.getIn(['data', 'seriesTitle'])}
          seriesId={video.getIn(['data', 'seriesId'])}
          host={video.getIn(['data', 'host'])}
          season={video.getIn(['data', 'season'])}
          episode={video.getIn(['data', 'episode'])}
          duration={video.getIn(['data', 'feature', 'duration'])}
          copyright={video.getIn(['data', 'copyright'])}
          contentType={video.getIn(['data', 'type', 'content'])}
          description={video.getIn(['data', 'description'])}
          geoAvailibility={video.getIn(
            ['data', 'feature', 'georestrictions', 'availability'],
            null,
          )}
          visible={metaVisible}
          autoHide={metaAutoHide}
          moreVisible={metaMoreVisible}
          toggleMoreVisible={toggleVideoPlayerMetaMoreVisible}
          setAutoHide={setVideoPlayerMetaAutoHide}
          playerPause={pausePlayer}
          playerPlay={playPlayer}
          playerPlayOrPause={playerPlayOrPause}
          isPlaying={isPlaying}
        />
      </div>
    )
  }
}

VideoPlayerApp.propTypes = {
  showToolTips: PropTypes.bool,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  player: PropTypes.object.isRequired,
  commentsVisible: PropTypes.bool.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  comments: ImmutablePropTypes.map.isRequired,
  video: ImmutablePropTypes.map.isRequired,
  videoPlayer: ImmutablePropTypes.map.isRequired,
  toolTip: ImmutablePropTypes.map.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  refreshComments: PropTypes.func.isRequired,
  toggleVideoPlayerMetaMoreVisible: PropTypes.func.isRequired,
  setToolTipVisible: PropTypes.func.isRequired,
  setToolTipVisiblePersistent: PropTypes.func.isRequired,
  setVideoPlayerMetaAutoHide: PropTypes.func.isRequired,
  setVideoPlayerMetaMoreVisible: PropTypes.func.isRequired,
  setFeatureTrackingDataPersistent: PropTypes.func,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      comments: state.comments,
      video: state.video,
      videoPlayer: state.videoPlayer,
      toolTip: state.toolTip,
      staticText: state.staticText.getIn(['data', 'videoPlayerApp']),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setCommentsVisible: actions.comments.setCommentsVisible,
        refreshComments: actions.comments.refreshComments,
        toggleVideoPlayerMetaMoreVisible:
          actions.videoPlayer.toggleVideoPlayerMetaMoreVisible,
        setVideoPlayerMetaAutoHide:
          actions.videoPlayer.setVideoPlayerMetaAutoHide,
        setVideoPlayerMetaMoreVisible:
          actions.videoPlayer.setVideoPlayerMetaMoreVisible,
        setToolTipVisible: actions.toolTip.setToolTipVisible,
        setToolTipVisiblePersistent: actions.toolTip.setToolTipVisiblePersistent,
        setFeatureTrackingDataPersistent:
          actions.featureTracking.setFeatureTrackingDataPersistent,
      }
    },
  ),
)(VideoPlayerApp)
