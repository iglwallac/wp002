import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compose } from 'recompose'
import { join as joinPromise } from 'bluebird'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _partial from 'lodash/partial'
import _get from 'lodash/get'
import _debounce from 'lodash/debounce'
import _isFunction from 'lodash/isFunction'
import _isString from 'lodash/isString'
import _once from 'lodash/once'
import CommentsLoader from 'components/CommentsLoader'
import VideoPlayerApp from 'components/VideoPlayerApp'
import VideoPlayerSpinner from 'components/VideoPlayerSpinner'
import VideoPlayerEnded from 'components/VideoPlayerEnded'
import VideoEmailCapture from 'components/VideoEmailCapture'
import Router from 'components/Router'
import { Map } from 'immutable'
import { getBoundActions } from 'actions'
import { get as getConfig } from 'config'
import { Provider, connect as connectRedux } from 'react-redux'
import {
  getVideoOpts,
  getMediaLangParams,
  getContainerStyles,
  setupVideoPlayer,
} from 'video-js'
import {
  TYPE_PREVIEW,
  TYPE_FEATURE,
  VIDEO_PLAYER_INACTIVITY_TIMEOUT,
  MOBILE_VIDEO_PLAYER_INACTIVITY_TIMEOUT,
} from 'services/video'
import { STORE_KEY_VIDEO_PLAYER_NEXT } from 'services/store-keys'
import {
  TYPE_DEFAULT as TYPE_VIDEO_ANALYTICS_DEFAULT,
  TYPE_PREVIEW as TYPE_VIDEO_ANALYTICS_PREVIEW,
  TYPE_FEATURE as TYPE_VIDEO_ANALYTICS_FEATURE,
  createNodeInfoModel,
} from 'services/video-analytics'
import ReactPlayerLoader from '@brightcove/react-player-loader'
import youbora from 'youboralib'
import 'youbora-adapter-videojs'


const KEY_SPACEBAR = 32
const config = getConfig()

function renderVideoPlayerApps (props, player) {
  const { store, history, location, comments } = props
  return (
    <Provider store={store}>
      <Router history={history}>
        <VideoPlayerApp
          player={player}
          history={history}
          location={location}
          commentsVisible={comments.get('visible', false)}
        />
      </Router>
    </Provider>
  )
}

/**
 * Initialize video JS plugins
 */
async function initVideoJsPlugins () {
  const [
    VideoPlayerAppsPlugin,
    SMFAnalyticsPlugin,
    SeekButtonsPlugin,
    KeyboardPlaybackTogglePlugin,
    VideoOverlayPlugin,
  ] = await joinPromise(
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/video-player-app'),
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/smf-analytics'),
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/seek-buttons'),
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/keyboard-playback-toggle'),
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/video-overlay-button'),
  )
  const registeredPlugins = global.videojs.getPlugins()
  if (registeredPlugins[VideoPlayerAppsPlugin.PLUGIN_NAME] === undefined) {
    VideoPlayerAppsPlugin.register(global.videojs)
  }
  if (registeredPlugins[SMFAnalyticsPlugin.PLUGIN_NAME] === undefined) {
    SMFAnalyticsPlugin.register(global.videojs)
  }
  if (registeredPlugins[SeekButtonsPlugin.PLUGIN_NAME] === undefined) {
    SeekButtonsPlugin.register(global.videojs)
  }
  if (registeredPlugins[KeyboardPlaybackTogglePlugin.PLUGIN_NAME] === undefined) {
    KeyboardPlaybackTogglePlugin.register(global.videojs)
  }
  if (registeredPlugins[VideoOverlayPlugin.PLUGIN_NAME] === undefined) {
    VideoOverlayPlugin.register(global.videojs)
  }
}

function renderComments (props, player, playOrPause) {
  let onClickCloseComments
  try {
    if (player && !player.ended()) {
      onClickCloseComments = _partial(playOrPause, true)
    }
  } catch (e) {
    // Do nothing player callback for ended failed
  }
  const showComments = _get(config, ['features', 'comments'], false)
  if (!showComments || dataHasError(props)) {
    return null
  }
  return <CommentsLoader onClickClose={onClickCloseComments} />
}

function renderVideoEmailCapture (props, containerStyles) {
  const { auth, videoPlayer, emailSignup } = props
  const { emailCaptureBannerHeight } = containerStyles
  const isLoading = videoPlayer.get('loading', false)
  const authenticated = _isString(auth.get('jwt'))
  const gatedPreviews = _get(config, ['features', 'player', 'gatedPreviews'])
  const emailSignupCompleted = emailSignup.get('completed', false)

  // don't render the email capture if the user has already signed up
  if (gatedPreviews && !authenticated && emailSignupCompleted) {
    return null
  }
  if (!isLoading && !authenticated) {
    return (
      <VideoEmailCapture emailCaptureBannerHeight={emailCaptureBannerHeight} />
    )
  }
  return null
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

class VideoPlayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      containerStyles: {},
      videoReady: false,
    }
  }

  componentDidMount () {
    const { props } = this
    const { setVideoPlayerFullscreen } = props

    setVideoPlayerFullscreen(false)

    // needed only for the <VideoPage /> and <ShareVideoViewPage /> implementations
    // needed to set player to be full window size
    this.setContainerStyles()
    this._onWindowResize = _debounce(this.setContainerStyles, 100)
    global.addEventListener('resize', this._onWindowResize)
  }

  componentWillReceiveProps (nextProps) {
    const { _player } = this
    const { videoPlayer } = nextProps
    const mobileWidth = 768

    if (_player) {
      if (window.innerWidth >= mobileWidth) {
        _player.options().inactivityTimeout = VIDEO_PLAYER_INACTIVITY_TIMEOUT
      } else {
        _player.options().inactivityTimeout = MOBILE_VIDEO_PLAYER_INACTIVITY_TIMEOUT
      }

      if (videoPlayer.get('ended', false)) {
        try {
          if (_player.isFullscreen()) {
            _player.exitFullscreen()
          }
        } catch (e) {
          // Do thing player failed to check full screen or exit
        }
      }
    }
  }

  componentWillUnmount () {
    const { props } = this
    const {
      setCommentsVisible,
      setVideoPlayerEnded,
      setUserVideoDataFeaturePosition,
    } = props
    if (this._onWindowResize) {
      global.removeEventListener('resize', this._onWindowResize)
    }
    try {
      if (this._player) {
        const currentTime = this._player.currentTime()
        setUserVideoDataFeaturePosition(currentTime)
      }
    } catch (e) {
      // Do nothing the player failed to get current time
    }
    setCommentsVisible(false)
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
    dataPlayer.ready(() => {
      const player = setupVideoPlayer(
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

  getDuration = () => {
    const { props } = this
    const { video, type } = props
    const duration = type === TYPE_FEATURE ?
      video.getIn(['data', 'feature', 'duration']) :
      video.getIn(['data', 'preview', 'duration'])
    return duration || 0
  }

  setContainerStyles = () => {
    const { props } = this
    this.setState(() => ({ containerStyles: getContainerStyles(props) }))
  }

  setVideoPlayer = (player) => {
    this._player = player
  }

  setTimeoutPlayerEvent = (player, func, timeout) => {
    this.clearTimeoutPlayerEvent(player)
    this.playerEventTimeoutId = player.setTimeout(func, timeout)
  }

  clearTimeoutPlayerEvent = (player) => {
    if (this.playerEventTimeoutId) {
      player.clearTimeout(this.playerEventTimeoutId)
    }
    this.playerEventTimeoutId = undefined
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

  registerPlayerEventHandlers = () => {
    const { props } = this
    const {
      app,
      auth,
      page,
      media,
      video,
      location,
      setLoading,
      onVideoEnded,
      setVideoPlayerEnded,
      setVideoPlayerFullscreen,
      setMetaAutoHideVisibility,
      setEventDataVideoViewQualified,
    } = props

    const player = this._player
    if (!player) {
      return
    }
    const onceSetEventDataVideoViewQualified = _once(
      _partial(setEventDataVideoViewQualified, {
        auth,
        location,
        page,
        video,
        app,
        media,
      }),
    )
    const onceReloadLocation = _once(() => {
      global.location.reload()
    })
    player.ready(() => {
      player.on('play', () => {
        this.setTimeoutPlayerEvent(player, () => player.removeClass('vjs-play-event'), 1000)
        player.addClass('vjs-play-event')
      })
      player.on('pause', () => {
        this.setTimeoutPlayerEvent(player, () => player.removeClass('vjs-pause-event'), 1000)
        player.addClass('vjs-pause-event')
      })
      player.on('loadedmetadata', async () => {
        try {
          await player.play()
        } catch (e) {
          // Do nothing the brower might not allow playback
        }
        setLoading(false)
      })
      // Handle qualified view
      player.on('timeupdate', () => {
        if (player.currentTime() >= 15.0) {
          onceSetEventDataVideoViewQualified()
        }
      })
      // Handle reload of expired media info
      player.on('timeupdate', () => {
        if (!media.getIn(['data', 'expiresTime'])) {
          return
        }
        // Check if the current media has expired.
        const date = new Date()
        const currentTime = date.getTime()
        // Once it has expired just reload the page.
        if (currentTime > media.getIn(['data', 'expiresTime'])) {
          onceReloadLocation()
        }
      })
      player.on('ended', (e) => {
        setVideoPlayerEnded(true)
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
    })
  }

  configureYouboraPlugin = (player) => {
    const { props } = this
    const {
      app,
      auth,
      user,
      type,
      media,
      video,
      location,
      analyticsMeta = Map(),
    } = props
    const uid = auth.get('uid', null)
    let viewerId = uid
    const viewerIdOverride = _get(analyticsMeta, 'viewerId', null)
    if (viewerIdOverride) {
      viewerId = viewerIdOverride
    }

    const mediaId = media.get('id')
    const mediaOptions = getMediaLangParams(
      user,
      media,
      location,
    )
    const mediaUrl = mediaOptions.url
    const duration = this.getDuration()
    const videoKey = type === TYPE_FEATURE ? 'feature' : 'preview'
    const contentId = _get(analyticsMeta, 'contentId', null)
    const title = video.getIn(['data', videoKey, 'contentId'])
    const genre = video.getIn(['data', 'admin_category', 'name'], '')

    const youboraPlugin = new youbora.Plugin({ accountCode: _get(config, 'youboraAccountCode', 'unknown') })
    youboraPlugin.setAdapter(new youbora.adapters.Videojs(player))
    youboraPlugin.setOptions({
      'parse.hls': true,
      httpSecure: true,
      enabled: true,
      username: viewerId, // YES LIVE, but from props
      'content.metadata': {
        content_id: contentId || mediaId,
      },
      'content.title': title,
      'content.isLive': false,
      'content.resource': mediaUrl,
      'content.metadata.genre': genre,
      'content.duration': duration,
      'extraparam.1': app.get('name', 'web-app'),
      'extraparam.2': app.get('version', '0.0.0'),
      'extraparam.3': _get(config, ['brightcove', 'player'], 'unknown'),
      'extraparam.4': 'VideoPlayer',
      'extraparam.5': Map.isMap(auth) && auth.get('jwt') ? 'logged-in' : 'anonymous',
    })
  }

  configureDefaultPlugins = (player) => {
    const { props } = this
    const { videoPlayerInfoDisabled, setFeatureTrackingDataPersistent } = props
    player.KeyboardPlaybackToggle({ keys: [KEY_SPACEBAR] })
    player.SeekButtons({ forward: 30, back: 10 })
    player.VideoPlayerApps({
      render: _player => renderVideoPlayerApps(props, _player),
    })
    player.VideoOverlayButtons({ videoPlayerInfoDisabled, setFeatureTrackingDataPersistent })
  }

  configureSmfPlugin = (player) => {
    const {
      props,
    } = this
    const {
      app,
      auth,
      page,
      user,
      media,
      video,
      location,
      userVideo,
      clearUpstreamContext,
      upstreamContext = Map(),
      setEventDataVideoPlayed,
    } = props
    const mediaId = media.get('id')
    const uid = auth.get('uid', null)
    const jwt = auth.get('jwt', null)
    const videoData = video.get('data', Map()).toJS()
    const videoId = video.getIn(['data', 'id'])
    const mediaData = media.get('data', Map()).toJS()
    const mediaLang = media.getIn(['data', 'mediaLang'])
    const userVideoData = userVideo.get('data', Map()).toJS()
    const anonymousUuid = user.getIn(['data', 'anonymousUuid'])
    const mediaOptions = getMediaLangParams(
      user,
      media,
      location,
    )
    const mediaUrl = mediaOptions.url
    // SMF plugin
    const nodeInfoDefault = createNodeInfoModel(
      videoData,
      userVideoData,
      mediaData,
      TYPE_VIDEO_ANALYTICS_DEFAULT,
    )
    const nodeInfoPreview = createNodeInfoModel(
      videoData,
      userVideoData,
      mediaData,
      TYPE_VIDEO_ANALYTICS_PREVIEW,
    )
    const nodeInfoFeature = createNodeInfoModel(
      videoData,
      userVideoData,
      mediaData,
      TYPE_VIDEO_ANALYTICS_FEATURE,
    )

    player.SmfAnalytics({
      uid,
      jwt,
      mediaId,
      videoId,
      mediaUrl,
      mediaLang,
      anonymousUuid,
      nodeInfoDefault,
      nodeInfoPreview,
      nodeInfoFeature,
      externalPlayEvent: ((videoAnalyticsId) => {
        setEventDataVideoPlayed({
          auth,
          location,
          page,
          video,
          media,
          app,
          upstreamContext,
          language: user.getIn(['data', 'language']),
          videoAnalyticsId,
        })
        clearUpstreamContext()
      }),
    })
  }

  configurePlayerPlugins = (player) => {
    this.configureDefaultPlugins(player)
    this.configureYouboraPlugin(player)
    this.configureSmfPlugin(player)
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

  playOrPause = async (shouldPlay) => {
    const { _player } = this
    if (!_player) {
      return
    }
    try {
      if (shouldPlay) {
        await _player.play()
      } else {
        await _player.pause()
      }
    } catch (e) {
      // Do nothing player call failed
    }
  }

  render () {
    const { props, state, _player, playOrPause } = this
    const {
      user,
      video,
      videoPlayer,
      posterOverride,
      playsinline = false,
      videoReady,
    } = props
    const { containerStyles } = state
    const { account, player } = _get(config, 'brightcove', {})
    const poster = posterOverride || video.getIn(['data', 'poster'], '')
    const vjsOpts = getVideoOpts(user, poster, true, false, false, playsinline)
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
      <div className="video-player">
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
            playerId={player}
            onSuccess={data => this.onPlayerSuccess(data)}
            options={vjsOpts}
          />
        </div>
        {renderComments(props, _player, playOrPause)}
        {renderVideoEmailCapture(props, containerStyles)}
      </div>
    )
  }
}

VideoPlayer.propTypes = {
  store: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  app: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  comments: ImmutablePropTypes.map.isRequired,
  video: ImmutablePropTypes.map.isRequired,
  media: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userVideo: ImmutablePropTypes.map.isRequired,
  videoPlayer: ImmutablePropTypes.map.isRequired,
  emailSignup: ImmutablePropTypes.map.isRequired,
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
  setCommentsVisible: PropTypes.func.isRequired,
  playerSrc: PropTypes.string,
  analyticsMeta: PropTypes.shape({
    contentId: PropTypes.string.isRequired,
    viewerId: PropTypes.string.isRequired,
    loggedIn: PropTypes.bool.isRequired,
  }),
}

VideoPlayer.defaultProps = {
  checkPath: true,
  displayVideoEnded: true,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        app: state.app,
        page: state.page,
        comments: state.comments,
        video: state.video,
        media: state.media,
        auth: state.auth,
        tiles: state.tiles.filter((val, key) => key === STORE_KEY_VIDEO_PLAYER_NEXT),
        user: state.user,
        userVideo: state.userVideo,
        videoPlayer: state.videoPlayer,
        upstreamContext: state.upstreamContext.get('data', Map()),
        emailSignup: state.emailSignup,
        videoPlayerInfoDisabled: state.featureTracking.getIn(
          ['data', 'disableVideoInfo'],
          false,
        ),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setEventDataVideoPlayed: actions.eventTracking.setEventDataVideoPlayed,
        setEventDataVideoViewQualified:
          actions.eventTracking.setEventDataVideoViewQualified,
        getTilesData: actions.tiles.getTilesData,
        setCommentsVisible: actions.comments.setCommentsVisible,
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
        setFeatureTrackingDataPersistent:
          actions.featureTracking.setFeatureTrackingDataPersistent,
      }
    },
  ),
)(VideoPlayer)
