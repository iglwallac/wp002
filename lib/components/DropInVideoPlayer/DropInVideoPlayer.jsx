import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compose } from 'recompose'
import { join as joinPromise } from 'bluebird'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _get from 'lodash/get'
import _once from 'lodash/once'
import _isFunction from 'lodash/isFunction'
import _join from 'lodash/join'
import { getBoundActions } from 'actions'
import { get as getConfig } from 'config'
import { connect as connectRedux } from 'react-redux'
import { Map } from 'immutable'
import ReactPlayerLoader from '@brightcove/react-player-loader'
import {
  getVideoOpts,
  getMediaLangParams,
  setupVideoPlayer,
} from 'video-js'
import Icon from 'components/Icon'
import VideoPlayerSpinner from 'components/VideoPlayerSpinner'
import youbora from 'youboralib'
import 'youbora-adapter-videojs'

export const BASIC_CONTROL_OPTIONS_CLOSE = 'close'
export const BASIC_CONTROL_OPTIONS_VOLUME = 'volume'
export const BASIC_CONTROL_OPTIONS_VOLUME_LABEL = 'volume-label'
export const BASIC_CONTROL_OPTIONS_PLAYBACK = 'playback'
export const BASIC_CONTROLS = 'basic'
export const DEFAULT_CONTROLS = 'default'
const KEY_SPACEBAR = 32
const config = getConfig()

/**
 * Initialize video JS plugins
 */
async function initVideoJsPlugins () {
  await joinPromise(
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/smf-analytics'),
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/seek-buttons'),
    import(/* webpackChunkName: 'videojsplugins' */ 'video-js/keyboard-playback-toggle'),
    (
      SMFAnalyticsPlugin,
      SeekButtonsPlugin,
      KeyboardPlaybackTogglePlugin,
    ) => {
      const registeredPlugins = global.videojs.getPlugins ? global.videojs.getPlugins() : {}
      if (registeredPlugins[SMFAnalyticsPlugin.PLUGIN_NAME] === undefined) {
        SMFAnalyticsPlugin.register(global.videojs)
      }
      if (registeredPlugins[SeekButtonsPlugin.PLUGIN_NAME] === undefined) {
        SeekButtonsPlugin.register(global.videojs)
      }
      if (registeredPlugins[KeyboardPlaybackTogglePlugin.PLUGIN_NAME] === undefined) {
        KeyboardPlaybackTogglePlugin.register(global.videojs)
      }
    },
  )
}

class DropInVideoPlayer extends Component {
  constructor (props) {
    super(props)
    const { mediaWasFetched } = props
    this.state = {
      mediaWasFetched,
      isMuted: props.autoplay || false,
      isPlaying: props.autoplay || false,
      videoReady: false,
    }

    this.qualified = false
  }

  componentDidMount () {
    const { props, state } = this
    const { mediaWasFetched } = state
    const { playerSrc } = props
    if (!playerSrc && !mediaWasFetched) {
      this.getMedia()
    }
  }

  componentWillUnmount () {
    this.disposePlayer()
  }

  onClickClose = (e) => {
    e.preventDefault()
    const { props } = this
    const { onClosePlayer } = props
    if (onClosePlayer) {
      onClosePlayer()
    }
  }

  onTogglePlayButtonClick = async (evt) => {
    const { _player } = this
    if (_player) {
      const { isPlaying } = this.state
      evt.preventDefault()
      try {
        if (isPlaying) {
          await _player.pause()
        } else {
          await _player.play()
        }
        this.setState({ isPlaying: !isPlaying })
      } catch (e) {
        // Do nothing player call failed
      }
    }
  }

  onToggleMuteButtonClick = (evt) => {
    const { props, state } = this
    const { optionalMuteToggleFunction } = props
    const { isMuted } = state
    evt.preventDefault()
    try {
      if (isMuted) {
        this._player.muted(false)
      } else {
        this._player.muted(true)
      }
      this.setState({ isMuted: !isMuted })
      if (_isFunction(optionalMuteToggleFunction)) {
        optionalMuteToggleFunction(!isMuted)
      }
    } catch (e) {
      // Do nothing player call failed
    }
  }

  onPlayerSuccess = async (data) => {
    const { props } = this
    const {
      defaultTextTracks,
      media,
      playerSrc,
      startAt,
      textTracks,
      type,
      user,
      userVideo,
    } = props
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
        textTracks,
        startAt,
        defaultTextTracks,
      )
      this.setVideoPlayer(player)
      this.configurePlayerPlugins(player)
      this.registerPlayerEventHandlers(player)
      this.setState({ videoReady: true })
      // Call props onPlayerSuccess if it is a function
      if (_isFunction(props.onPlayerSuccess)) {
        props.onPlayerSuccess(data)
      }
    })
  }

  // ONLY CALL IN COMPONENT DID UPDATE IF WE HAVE MEDIA ID
  getMedia () {
    const {
      props,
      state,
    } = this

    const {
      auth,
      user,
      mediaId,
      getMediaData,
    } = props

    if (state.mediaWasFetched) return
    if (mediaId) {
      // TODO: improve mediaWasFetched flag to account for errors from getMediaData
      this.setState({ mediaWasFetched: true })
      getMediaData({ id: mediaId, auth, user })
    }
  }

  setVideoPlayer (player) {
    this._player = player
  }

  getClassName () {
    const { props } = this
    const { styled, className } = props
    const cls = ['drop-in-video-player']
    if (styled) {
      cls.push('drop-in-video-player__styled')
    }
    if (className) {
      cls.push(className)
    }
    return _join(cls, ' ')
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

  configurePlayerPlugins = (player) => {
    const { props } = this
    const { app, auth, videoId, playerSrc, mediaId, media, title = null, user } = props
    const mediaOptions = getMediaLangParams(user, media, null)
    const trueMediaId = mediaId || media.get('id')
    const mediaUrl = playerSrc || mediaOptions.url
    const uid = auth.get('uid', null)
    const jwt = auth.get('jwt', null)
    const anonymousUuid = user.getIn(['data', 'anonymousUuid'])
    const youboraTitle = title || 'Instructor Video'
    const youboraPlugin = new youbora.Plugin({ accountCode: _get(config, 'youboraAccountCode', 'unknown') })
    const mediaLang = media.getIn(['data', 'mediaLang'])
    youboraPlugin.setAdapter(new youbora.adapters.Videojs(player))
    youboraPlugin.setOptions({
      'parse.hls': true,
      httpSecure: true,
      enabled: true,
      username: uid,
      'content.metadata': {
        content_id: trueMediaId,
      },
      'content.title': youboraTitle,
      'content.isLive': false,
      'content.resource': mediaUrl,
      'extraparam.1': app.get('name', 'web-app'),
      'extraparam.2': app.get('version', '0.0.0'),
      'extraparam.3': _get(config, ['brightcove', 'player'], 'unknown'),
      'extraparam.4': 'DropInVideoPlayer',
      'extraparam.5': Map.isMap(auth) && auth.get('jwt') ? 'logged-in' : 'anonymous',
    })
    player.SmfAnalytics({
      uid,
      jwt,
      anonymousUuid,
      mediaId: trueMediaId,
      mediaLang,
      videoId: videoId || trueMediaId,
      nodeInfoDefault: { nodeId: trueMediaId },
      nodeInfoPreview: { nodeId: trueMediaId },
      nodeInfoFeature: { nodeId: trueMediaId },
    })

    if (props.controls === DEFAULT_CONTROLS) {
      player.KeyboardPlaybackToggle({ keys: [KEY_SPACEBAR] })
      player.SeekButtons({ forward: 30, back: 10 })
    }
  }


  registerPlayerEventHandlers = (player) => {
    const { props } = this
    const {
      autoplay,
      handleVideoEnd,
      media,
      qualifyViewsAction,
      setVideoPlayerEnded,
      volume,
    } = props
    const onceReloadLocation = _once(() => {
      global.location.reload()
    })
    player.ready(() => {
      player.on('timeupdate', () => {
        if (player.currentTime() >= 15.0) {
          if (qualifyViewsAction && !this.qualified) {
            qualifyViewsAction()
          }
          this.qualified = true
        }
      })
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
      player.on('ended', async () => {
        // Edge Bug - Prevents Player Timeout Error
        if (player.loop()) {
          player.currentTime(0)
          try {
            await player.play()
          } catch (e) {
            // Do nothing the brower might not allow playback
          }
        }
        setVideoPlayerEnded(true)
        if (_isFunction(handleVideoEnd)) {
          try {
            handleVideoEnd()
          } catch (e) {
            // Do nothing
          }
        }
      })

      // kind of bad, but always true that if we are attempting to autoplay,
      // the player MUST be muted
      if (!volume) {
        player.muted(autoplay)
      }

      // Autoplay
      if (autoplay) {
        player.on('loadedmetadata', async () => {
          try {
            await player.play()
          } catch (_) {
            // Browser may not allow play
          }
        })
      }
    })
  }

  canRenderVideo () {
    const { props } = this
    const { media, mediaId, playerSrc } = props
    const processing = media.get('processing')
    const mediaReady = mediaId === media.get('id')
    if (!playerSrc && (processing || !mediaReady)) {
      return false
    }
    return true
  }

  renderBasicControls () {
    const { state, props } = this

    const visibleControls = _get(props, 'controls.visibleControls', [])
    const renderCloseControl = visibleControls.indexOf(BASIC_CONTROL_OPTIONS_CLOSE) > -1
    const renderVolumeToggle = visibleControls.indexOf(BASIC_CONTROL_OPTIONS_VOLUME) > -1
    const renderVolumeLabel = visibleControls.indexOf(BASIC_CONTROL_OPTIONS_VOLUME_LABEL) > -1
    const renderPlaybackToggle = visibleControls.indexOf(BASIC_CONTROL_OPTIONS_PLAYBACK) > -1
    const volumeIconClass = state.isMuted ? 'icon--volume-null' : 'icon--volume-full'
    const volumeLabel = state.isMuted ? 'Audio Off' : 'Audio On'
    const playToggleIconClass = state.isPlaying ? 'icon--pause-fill' : 'icon--play-fill'
    return (
      <div className="drop-in-video-player__button-group-controls">
        {
          renderPlaybackToggle ? (
            <button
              onClick={this.onTogglePlayButtonClick}
              className="drop-in-video-player__toggle-play-button"
            >
              <Icon iconClass={[playToggleIconClass]} />
            </button>
          ) : null
        }
        {
          renderVolumeToggle
            ? (
              <button
                onClick={this.onToggleMuteButtonClick}
                className="drop-in-video-player__toggle-mute-button"
              >
                <Icon iconClass={[volumeIconClass]} />
                {renderVolumeLabel ? (<span className="drop-in-video-player__toggle-mute-label">&nbsp; {volumeLabel} </span>) : ''}
              </button>
            )
            : null
        }
        {
          renderCloseControl ? (
            <button onClick={this.onClickClose}>
              <Icon iconClass={['icon--close']} />
            </button>
          ) : null
        }
      </div>
    )
  }

  render () {
    const { props, state } = this
    const { videoReady } = state
    let { accountId, playerId } = props
    if (!videoReady && !this.canRenderVideo()) {
      return (
        <div className={this.getClassName()}>
          <VideoPlayerSpinner video={props.video} />
        </div>
      )
    }

    const isBasicControls = _get(props, 'controls.type') === BASIC_CONTROLS
    // If either a videoId or playerId are provided don't use config
    // otherwise use BC config
    if (!accountId && !playerId) {
      accountId = _get(config, 'brightcove.account')
      playerId = _get(config, 'brightcove.player')
    }
    const { user, loop, poster, playsinline = false } = props
    const vjsOpts = getVideoOpts(user, poster || '', false, loop, false, playsinline)

    return (
      <div className={this.getClassName()}>
        <div className="drop-in-video-player__container video-player">
          <ReactPlayerLoader
            onSuccess={this.onPlayerSuccess}
            accountId={accountId}
            playerId={playerId}
            options={vjsOpts}
          />
          {
            isBasicControls
              ? this.renderBasicControls()
              : null
          }
        </div>
      </div>
    )
  }
}

DropInVideoPlayer.propTypes = {
  accountId: PropTypes.number,
  playerId: PropTypes.number,
  videoId: PropTypes.number,
  app: ImmutablePropTypes.map.isRequired,
  media: ImmutablePropTypes.map.isRequired,
  mediaId: PropTypes.number,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  videoPlayer: ImmutablePropTypes.map.isRequired,
  controls: PropTypes.shape({
    type: PropTypes.oneOf([DEFAULT_CONTROLS, BASIC_CONTROLS]).isRequired,
    visibleControls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  loop: PropTypes.bool,
  autoplay: PropTypes.bool,
  poster: PropTypes.string,
  playsinline: PropTypes.bool,
  handleVideoEnd: PropTypes.func,
  className: PropTypes.string,
  startAt: PropTypes.number,
  onPlayerSuccess: PropTypes.func,
  onClosePlayer: PropTypes.func,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        app: state.app,
        auth: state.auth,
        user: state.user,
        videoPlayer: state.videoPlayer,
        video: state.video,
        media: state.media,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getMediaData: actions.media.getMediaData,
        setVideoPlayerEnded: actions.videoPlayer.setVideoPlayerEnded,
      }
    },
  ),
)(DropInVideoPlayer)
