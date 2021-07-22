import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compose } from 'recompose'
import { join as joinPromise } from 'bluebird'
import ImmutablePropTypes from 'react-immutable-proptypes'
import floor from 'lodash/floor'
import _get from 'lodash/get'
import _isFunction from 'lodash/isFunction'
import _find from 'lodash/find'
import VideoPlayerSpinner from 'components/VideoPlayerSpinner'
import VideoPlayerEnded from 'components/VideoPlayerEnded'
import Router from 'components/Router'
import { Map } from 'immutable'
import { getBoundActions } from 'actions'
import { get as getConfig } from 'config'
import { Provider, connect as connectRedux } from 'react-redux'
import {
  getMediaLangParams,
  getContainerStyles,
  setupLiveVideoPlayer,
} from 'video-js'
import { TYPE_PREVIEW, VIDEO_PLAYER_INACTIVITY_TIMEOUT } from 'services/video'
import { STORE_KEY_VIDEO_PLAYER_NEXT } from 'services/store-keys'
import ReactPlayerLoader from '@brightcove/react-player-loader'
import youbora from 'youboralib'
import 'youbora-adapter-videojs'
import LiveVideoPlayerOverlay from './LiveVideoPlayerOverlay'

const config = getConfig()

function renderVideoPlayerApps (props) {
  const { store, history } = props
  return (
    <Provider store={store}>
      <Router history={history}>
        <LiveVideoPlayerOverlay />
      </Router>
    </Provider>
  )
}

const convertToPlayerLanguage = {
  en: 'eng',
  es: 'spa',
  de: 'eng',
  fr: 'eng',
}

function buildVideoOpts (options = {}) {
  const {
    user = Map(),
    poster = '',
    controls = true,
    loop = false,
    playsinline = true,
  } = options
  return {
    poster,
    loop,
    playsinline,
    liveui: true,
    controls,
    inactivityTimeout: 3500,
    language: user.getIn(['data', 'language', '0'], null),
  }
}

/**
 * Initialize video JS plugins
 */
async function initVideoJsPlugins () {
  const [
    VideoPlayerAppsPlugin,
    KeyboardPlaybackTogglePlugin,
  ] = await joinPromise(
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/video-player-app'),
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/keyboard-playback-toggle'),
  )
  const registeredPlugins = global.videojs.getPlugins()
  if (registeredPlugins[VideoPlayerAppsPlugin.PLUGIN_NAME] === undefined) {
    VideoPlayerAppsPlugin.register(global.videojs)
  }
  if (registeredPlugins[KeyboardPlaybackTogglePlugin.PLUGIN_NAME] === undefined) {
    KeyboardPlaybackTogglePlugin.register(global.videojs)
  }
}

function dataHasError (props) {
  const { video } = props
  return (
    video.getIn(['data', '_dataError'])
  )
}

function renderVideoPlayerEnded (props) {
  const {
    videoPlayer,
    type,
    video,
    auth,
    location,
    history,
    tiles,
    getTilesData,
    deleteTiles,
    displayVideoEnded,
    setVideoPlayerEnded,
    user,
  } = props
  const videoEnded = videoPlayer.get('ended', false)
  if (displayVideoEnded && videoEnded) {
    return (
      <VideoPlayerEnded
        user={user}
        type={type}
        video={video}
        auth={auth}
        location={location}
        history={history}
        tiles={tiles}
        getTilesData={getTilesData}
        deleteTiles={deleteTiles}
        setVideoPlayerEnded={setVideoPlayerEnded}
      />
    )
  }
  return null
}

class LiveVideoPlayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      containerStyles: {},
      videoReady: false,
    }
  }

  componentDidMount () {
    const {
      props,
    } = this
    const {
      setVideoPlayerFullscreen,
    } = props

    setVideoPlayerFullscreen(false)
  }

  componentDidUpdate () {
    this.handlePlayerEndedExitFullsceen()
    this.syncPlayerSrc()
  }

  componentWillUnmount () {
    const { props } = this
    const {
      setVideoPlayerEnded,
      setUserVideoDataFeaturePosition,
    } = props
    if (this._onWindowResize) {
      global.removeEventListener('resize', this._onWindowResize)
    }
    if (this._player) {
      const currentTime = this.getPosition()
      setUserVideoDataFeaturePosition(currentTime)
    }
    setVideoPlayerEnded(false)
    this.disposePlayer()
  }

  onPlayerSuccess = async (data) => {
    const { props } = this
    const {
      type,
      user,
      media,
      userVideo,
      playerSrc,
      setLoading,
      setMetaMoreVisible,
    } = props
    setLoading(true)
    // always set this to false when loading in the video player
    setMetaMoreVisible(false)
    await initVideoJsPlugins()
    const { ref: dataPlayer } = data
    dataPlayer.options().inactivityTimeout = VIDEO_PLAYER_INACTIVITY_TIMEOUT
    dataPlayer.ready(() => {
      const player = setupLiveVideoPlayer(
        dataPlayer,
        media,
        type,
        user,
        userVideo,
        location,
        playerSrc,
      )
      this.setVideoPlayer(player)
      this.configurePlayerPlugins(player)
      this.registerPlayerEventHandlers(player)
      this.setState({ videoReady: true })
    })
  }

  getPosition = () => { // US13283, CP-2
    try {
      if (this._player) {
        return floor(this._player.currentTime())
      }
    } catch (e) {
      // Do nothing player call failed
    }
    return null
  }

  setContainerStyles = () => {
    const { props } = this
    this.setState(() => ({ containerStyles: getContainerStyles(props) }))
  }

  setVideoPlayer = (player) => {
    this._player = player
    this.forceUpdate()
  }

  disposePlayer = () => {
    if (!this._player) {
      return
    }
    try {
      this._player.pause()
    } catch (_) {
      // Do nothing the player errored
    }
    // React player loader component will dispose player
    this._player = undefined
  }

  /**
   * Handle when the videoPlayer state of ended is true
   * and the player is in full screen mode
   */
  handlePlayerEndedExitFullsceen = () => {
    const { props, _player } = this
    const { videoPlayer } = props
    if (!_player) {
      return
    }
    try {
      if (videoPlayer.get('ended', false) && _player.isFullscreen()) {
        _player.exitFullscreen()
      }
    } catch (e) {
      // Player errored do nothing
    }
  }

  /**
   * Sync the props src to the player src if they are not equal
   */
  syncPlayerSrc = () => {
    const { props, _player } = this
    const { playerSrc } = props
    try {
      const currentSrc = _player.currentSrc()
      if (_player && currentSrc !== playerSrc) {
        _player.src({
          src: playerSrc,
          type: 'application/x-mpegURL',
        })
        this.configureYouboraPlugin()
      }
    } catch (e) {
      // Player errored do nothing
    }
  }

  registerPlayerEventHandlers = (player) => {
    const { props } = this
    const {
      setLoading,
      onVideoEnded,
      setVideoPlayerFullscreen,
      setMetaAutoHideVisibility,
      setMetaVisible,
      user,
    } = props
    player.ready(() => {
      player.on('loadedmetadata', () => {
        const playerLanguage = convertToPlayerLanguage[user.getIn(['data', 'language', 0], 'en')]
        const audioTrackList = player.audioTracks()
        const track = _find(audioTrackList, trk => trk.language === playerLanguage)
        if (track && !track.enabled) {
          track.enabled = true
        }
      })
      player.on('loadedmetadata', async () => {
        try {
          await player.play()
        } catch (_) {
          // Do nothing the brower might not allow playback
        }
        setLoading(false)
      })
      player.on('ended', (e) => {
        if (_isFunction(onVideoEnded)) {
          onVideoEnded(e)
        }
      })
      player.on('fullscreenchange', () => {
        const isFullscreen = document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement
        setVideoPlayerFullscreen(isFullscreen)
      })
      player.on('useractive', () => {
        setMetaAutoHideVisibility(true, 'videoPlayer')
      })
      player.on('userinactive', () => {
        setMetaAutoHideVisibility(false)
      })
      player.one('play', () => {
        setMetaVisible(true)
        player.liveTracker.seekToLiveEdge()
        player.on('tap', () => {
          player.userActive(!player.userActive() === true)
        })
      })
      const audioTrackList = player.audioTracks()
      audioTrackList.addEventListener('change', () => {
        // languages are only searchable in Youbora if it is
        // the first reported language, so the plugin must be
        // recreated on each track change.
        this.configureYouboraPlugin(player)
      })
    })
  }

  configureYouboraPlugin = (player) => {
    const {
      props,
    } = this
    const {
      app,
      auth,
      user,
      media,
      isLive,
      location,
      playerSrc,
      analyticsMeta = Map(),
      title,
      track: eventTrack,
    } = props
    const uid = auth.get('uid', null)
    const viewerIdOverride = _get(analyticsMeta, 'viewerId')
    const mediaId = media.get('id')
    const mediaOptions = getMediaLangParams(
      user,
      media,
      location,
    )
    const mediaUrl = mediaOptions.url
    const contentId = _get(analyticsMeta, 'contentId', null)

    // Determine audio track label
    let trackLabel = 'Unknown'
    try {
      const audioTrackList = player.audioTracks()
      const track = _find(audioTrackList, trk => trk.enabled)
      trackLabel = track ? track.label : 'English'
    } catch (e) {
      // Player errored do nothing
    }
    const youboraPlugin = new youbora.Plugin({ accountCode: _get(config, 'youboraAccountCode', 'unknown') })
    youboraPlugin.setAdapter(new youbora.adapters.Videojs(player))
    youboraPlugin.setOptions({
      'parse.hls': true,
      httpSecure: true,
      enabled: true,
      username: viewerIdOverride || uid, // YES LIVE, but from props
      'content.metadata': {
        content_id: contentId || mediaId,
      },
      'content.title': `${title} - ${eventTrack}`,
      'content.isLive': isLive,
      'content.resource': isLive ? playerSrc : mediaUrl,
      'extraparam.1': app.get('name', 'web-app'),
      'extraparam.2': app.get('version', '0.0.0'),
      'extraparam.3': _get(config, ['brightcove', 'liveplayer'], 'unknown'),
      'extraparam.4': 'LiveVideoPlayer',
      'extraparam.5': Map.isMap(auth) && auth.get('jwt') ? 'logged-in' : 'anonymous',
      'extraparam.6': trackLabel,
    })
  }

  configureDefaultPlugins = (player) => {
    const { props } = this
    const { store } = props
    if (store) {
      player.VideoPlayerApps({
        render: _player => renderVideoPlayerApps(props, _player),
      })
    }
  }

  configurePlayerPlugins = (player) => {
    this.configureDefaultPlugins(player)
    this.configureYouboraPlugin(player)
  }

  canRenderVideo = () => {
    const { props } = this
    const {
      type,
      auth,
      video,
      userVideo,
      media,
      location,
      checkPath,
      playerSrc,
    } = props

    // if playerSrc is provided, we don't need to wait for other data
    if (playerSrc) {
      return true
    }

    const processing =
      video.get('processing') ||
      userVideo.get('processing') ||
      media.get('processing')
    const pathReady = checkPath
      ? video.getIn(['data', 'path']) === location.pathname.replace(/^\//, '')
      : true
    const mediaReady =
      video.getIn(['data', type, 'id']) === media.getIn(['data', 'id'])
    const userVideoReady =
      !auth.get('jwt') ||
      location.query.fullplayer === TYPE_PREVIEW ||
      video.getIn(['data', 'id']) === userVideo.getIn(['data', 'id'])
    if (processing || !pathReady || !mediaReady || !userVideoReady) {
      return false
    }
    return true
  }

  render () {
    const { props, state, _player } = this
    const {
      user,
      video,
      videoPlayer,
      posterOverride,
    } = props
    const { containerStyles, videoReady } = state
    const { account, liveplayer } = _get(config, 'brightcove', {})
    const poster = posterOverride || video.getIn(['data', 'poster'], '')
    const vjsOpts = buildVideoOpts({ user, poster })
    if (dataHasError(props)) {
      return (
        <div className="video-player">
          <p className="video-player__error">
            The video player experienced an error loading this video, please
            refresh the page to try again or select another video.
          </p>
        </div>
      )
    }

    if (!videoReady && !this.canRenderVideo()) {
      return <VideoPlayerSpinner video={video} />
    }

    return (
      <div className="video-player video-player--live">
        {videoPlayer.get('loading', true) && !_player ? (
          <VideoPlayerSpinner video={video} />
        ) : null}
        {renderVideoPlayerEnded(props)}
        <div
          className="video-player__container"
          style={containerStyles}
        >
          <ReactPlayerLoader
            accountId={account}
            playerId={liveplayer}
            onSuccess={data => this.onPlayerSuccess(data)}
            options={vjsOpts}
          />
        </div>
      </div>
    )
  }
}

LiveVideoPlayer.propTypes = {
  store: PropTypes.object,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  app: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  video: ImmutablePropTypes.map.isRequired,
  media: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userVideo: ImmutablePropTypes.map.isRequired,
  videoPlayer: ImmutablePropTypes.map.isRequired,
  setMetaVisible: PropTypes.func.isRequired,
  setMetaMoreVisible: PropTypes.func.isRequired,
  setMetaAutoHideVisibility: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  type: PropTypes.string,
  setUserVideoDataFeaturePosition: PropTypes.func.isRequired,
  setVideoPlayerEnded: PropTypes.func.isRequired,
  deleteTiles: PropTypes.func.isRequired,
  setVideoPlayerFullscreen: PropTypes.func.isRequired,
  onVideoEnded: PropTypes.func,
  checkPath: PropTypes.bool,
  displayVideoEnded: PropTypes.bool,
  posterOverride: PropTypes.string,
  setEventDataVideoPlayed: PropTypes.func.isRequired,
  setEventDataVideoViewQualified: PropTypes.func.isRequired,
  getTilesData: PropTypes.func.isRequired,
  isLive: PropTypes.bool,
  playerSrc: PropTypes.string,
  analyticsMeta: PropTypes.shape({
    contentId: PropTypes.string.isRequired,
    viewerId: PropTypes.string.isRequired,
    loggedIn: PropTypes.bool.isRequired,
  }),
}

LiveVideoPlayer.defaultProps = {
  checkPath: true,
  displayVideoEnded: true,
  isLive: true,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        app: state.app,
        page: state.page,
        video: state.video,
        media: state.media,
        auth: state.auth,
        tiles: state.tiles.filter((val, key) => key === STORE_KEY_VIDEO_PLAYER_NEXT),
        user: state.user,
        userVideo: state.userVideo,
        videoPlayer: state.videoPlayer,
        upstreamContext: state.upstreamContext.get('data', Map()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setEventDataVideoPlayed: actions.eventTracking.setEventDataVideoPlayed,
        setEventDataVideoViewQualified:
          actions.eventTracking.setEventDataVideoViewQualified,
        getTilesData: actions.tiles.getTilesData,
        setVideoPlayerFullscreen: actions.videoPlayer.setVideoPlayerFullscreen,
        setVideoPlayerEnded: actions.videoPlayer.setVideoPlayerEnded,
        setMetaVisible: actions.videoPlayer.setVideoPlayerMetaVisible,
        setMetaAutoHideVisibility:
          actions.videoPlayer.setVideoPlayerMetaAutoHideVisibility,
        setLoading: actions.videoPlayer.setVideoPlayerLoading,
        setMetaMoreVisible: actions.videoPlayer.setVideoPlayerMetaMoreVisible,
        setUserVideoDataFeaturePosition:
          actions.userVideo.setUserVideoDataFeaturePosition,
        deleteTiles: actions.tiles.deleteTiles,
        clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
      }
    },
  ),
)(LiveVideoPlayer)
