import { get as getConfig } from 'config'
import { Map } from 'immutable'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _first from 'lodash/first'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _isFunction from 'lodash/isFunction'
import _forEach from 'lodash/forEach'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _split from 'lodash/split'
import { getPrimary } from 'services/languages'
import { getLabel as getLangLabel } from 'services/lang'
import { EN } from 'services/languages/constants'
import { TYPE_FEATURE } from 'services/video'

const config = getConfig()

/**
 * Get the current video player time
 */
export function createCurrentTime (startPosition, player) {
  try {
    const duration = player.duration()
    if (startPosition < 60) {
      return 0
    }
    if (duration > 0 && startPosition > duration - 60) {
      return 0
    }
    return startPosition - 5
  } catch (e) {
    return 0
  }
}

export function setPosition (position, player) {
  try {
    player.currentTime(position)
  } catch (e) {
    // Do nothing
  }
}

export function getCurrentPosition (player) {
  try {
    return Math.floor(player.currentTime())
  } catch (e) {
    return 0
  }
}

/**
 * Initialize a Bright Cove player.
 */
export function getVideoOpts (user = Map(), poster = '', controls = true, loop = false, isLive = false, playsinline = false) {
  const opts = {
    crossOrigin: 'anonymous',
    poster,
    loop,
    playsinline,
    liveui: isLive,
    controls,
    inactivityTimeout: 3500,
    language: user.getIn(['data', 'language', '0'], null),
  }
  if (enableFlashTech()) {
    opts.techOrder = ['flash', 'html5']
  }
  return opts
}

export function setupLiveVideoPlayer(player, media, type, user, userVideo, location = null, src = null, text = null, startAt = null) {
  const mediaOptions = getMediaLangParams(
    user,
    media,
    location,
  )

  // if src is provided, we are only concerned with configuring player source
  if (src) {
    player.ready(() => {
      player.src({
        src,
        type: 'application/x-mpegURL',
      })
      if (text) {
        text.get('captions', Map())
          .map((src, srcLang) => {
            player.addRemoteTextTrack({
              src,
              kind: 'captions',
              label: getLangLabel(srcLang),
              srclang: srcLang,
            }, false)
            return true
          })

        text.get('subtitles', Map())
          .map((src, srcLang) => {
            player.addRemoteTextTrack({
              src,
              kind: 'subtitles',
              label: getLangLabel(srcLang),
              srclang: srcLang,
              default: (mediaSubtitles === srcLang),
            }, false)
            return true
          })
      }
    })
    return player
  }
  player.ready(() => {
    player.src({
      src: _get(mediaOptions, 'url', media.getIn(['data', 'bcHLS'])),
      type: 'application/x-mpegURL',
    })

    const mediaId = media.getIn(['id'])
    if (mediaId) {
      player.mediainfo = {
        id: mediaId.toString(),
      }
    }

    const mediaSubtitles = mediaOptions.subtitles

    const textTracks = media.getIn(['data', 'textTracks'], Map())
    textTracks.get('captions', Map())
      .map((src, srcLang) => {
        player.addRemoteTextTrack({
          src,
          kind: 'captions',
          label: getLangLabel(srcLang),
          srclang: srcLang,
        }, false)
        return true
      })

    textTracks.get('subtitles', Map())
      .map((src, srcLang) => {
        player.addRemoteTextTrack({
          src,
          kind: 'subtitles',
          label: getLangLabel(srcLang),
          srclang: srcLang,
          default: (mediaSubtitles === srcLang),
        }, false)
        return true
      })
  })
  return player
}

export function setupVideoPlayer (player, media, type, user, userVideo, location = null, src = null, text = null, startAt = null, defaultTextTracks = null) {
  const mediaOptions = getMediaLangParams(
    user,
    media,
    location,
  )
  const mediaSubtitles = mediaOptions.subtitles
  // if src is provided, we are only concerned with configuring player source
  if (src) {
    player.ready(() => {
      player.src({
        src,
        type: 'application/x-mpegURL',
      })
      if (text) {
        const textThumbnail = text.get('thumbnail')

        text.get('captions', Map())
          .map((src, srcLang) => {
            player.addRemoteTextTrack({
              src,
              kind: 'captions',
              label: getLangLabel(srcLang),
              srclang: srcLang,
            }, false)
            return true
          })
  
        text.get('subtitles', Map())
          .map((src, srcLang) => {
            player.addRemoteTextTrack({
              src,
              kind: 'subtitles',
              label: getLangLabel(srcLang),
              srclang: srcLang,
              default: defaultTextTracks ? defaultTextTracks === src : mediaSubtitles === srcLang,
            }, false)
            return true
          })

        if (textThumbnail) {
          player.addRemoteTextTrack({
            src: textThumbnail,
            kind: 'metadata',
            label: 'thumbnails',
            mode: 'hidden',
          }, false)
        }
      }

      player.one('loadedmetadata', () => setStartPosition(player, type, userVideo, startAt))
    })

    return player
  }

  player.ready(() => {
    player.src({
      src: _get(mediaOptions, 'url', media.getIn(['data', 'bcHLS'])),
      type: 'application/x-mpegURL',
    })

    const mediaId = media.getIn(['id'])
    if (mediaId) {
      player.mediainfo = {
        id: mediaId.toString(),
      }
    }

    const textTracks = media.getIn(['data', 'textTracks'], Map())
    const textTracksThumbnail = textTracks.get('thumbnail')
    textTracks.get('captions', Map())
      .map((src, srcLang) => {
        player.addRemoteTextTrack({
          src,
          kind: 'captions',
          label: getLangLabel(srcLang),
          srclang: srcLang,
        }, false)
        return true
      })

    textTracks.get('subtitles', Map())
      .map((src, srcLang) => {
        player.addRemoteTextTrack({
          src,
          kind: 'subtitles',
          label: getLangLabel(srcLang),
          srclang: srcLang,
          default: (mediaSubtitles === srcLang),
        }, false)
        return true
      })

    if (textTracksThumbnail) {
      player.addRemoteTextTrack({
        src: textTracksThumbnail,
        kind: 'metadata',
        label: 'thumbnails',
        mode: 'hidden',
      }, false)
    }

      player.one('loadedmetadata', () => setStartPosition(player, type, userVideo, startAt))
  })
  return player
}

function setStartPosition (player, type, userVideo, startAt) {
  let startPosition = startAt || 0
  if (type === TYPE_FEATURE) {
    startPosition = userVideo.getIn(['data', 'featurePosition']) || 0
  }
  setPosition(createCurrentTime(startPosition, player), player)
}

export function getPlayerLang (location, userLang) {
  if(location !== null) {
    const playerLang = _get(location.query, 'playerLang', null)
    if (playerLang) {
      return playerLang
    }
  }
  if (userLang && userLang.size) {
    return _get(_split(userLang.first(), '-'), 0, EN)
  }
  return config.appLang
}

export function getMediaLangParams (user, media, location = null) {
  // these have to be null bc that is there default state in the store
  // and immutable runs hasOwnProperty which returns the null as a valid value

  const appLang = config.appLang
  const userLang = user.getIn(['data', 'language'], null)
  const mediaLang = media.getIn(['data', 'byLang'], null)
  const mediaSubtitles = media.getIn(['data', 'textTracks', 'subtitles'], Map())
  const defaultSubtitles = mediaSubtitles.size > 0 ? mediaSubtitles.toJS() : undefined
  const defaultMediaUrl = media.getIn(['data', 'bcHLS'])
  const playerLang = getPlayerLang(location, userLang)
  const isDubbedMedia = (Map.isMap(mediaLang) && mediaLang.has(playerLang))
  let url = defaultMediaUrl
  let subtitles = null
  if (defaultSubtitles) {
    _forEach(defaultSubtitles, (value, key) => {
      if (key === getPrimary(userLang) && !isDubbedMedia) { subtitles = key }
    })
  }

  if (_get(config, ['features', 'player', 'detectLang'])) {
    url = (mediaLang && mediaLang.find((v, k) => k === playerLang)) || url
    if (defaultMediaUrl === url && playerLang !== appLang && defaultSubtitles && !isDubbedMedia) {
      subtitles = playerLang
    }
  }

  return { url, subtitles }
}

export function getContainerStyles (props) {
  const { auth } = props
  let availablewindowHeight =
    global.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
  const windowWidth =
    global.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth
  const styles = {}
  const authenticated = _isString(auth.get('jwt'))

  // if not authenticated a email capture banner is added to bottom of player
  // recalcualte hieght
  if (!authenticated) {
    const emailCaptureBannerHeight = 35
    availablewindowHeight =
      (global.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight) - emailCaptureBannerHeight
    styles.emailCaptureBannerHeight = emailCaptureBannerHeight
  }

  styles.height = availablewindowHeight
  styles.width = availablewindowHeight / 0.5625
  // if the width of the container is greater than the width of the window
  // recalculate height and width
  if (styles.width > windowWidth) {
    styles.width = windowWidth
    styles.height = styles.width * 0.5625
  }
  return styles
}

export function enableFlashTech () {
  return browserIsIe()
}

function browserIsIe () {
  const userAgent = _get(global, 'navigator.userAgent', '')
  const msie = _includes(userAgent, 'MSIE ')
  if (msie) {
    // IE 10 or older => return version number
    return true
  }
  const trident = _includes(userAgent, 'Trident/')
  if (trident) {
    // IE 11 => return version number
    return true
  }
  const edge = _includes(userAgent, 'Edge/')
  if (edge) {
    // Edge (IE 12+) => return version number
    return true
  }
  return false
}
