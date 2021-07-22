import PropTypes from 'prop-types'
import { Map, List } from 'immutable'
import { formatDuration } from 'theme/web-app'
import { UNAVAILABLE_REASON } from 'services/share'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { useState, useMemo, useCallback } from 'react'
import DropInVideoPlayer, { BASIC_CONTROLS, BASIC_CONTROL_OPTIONS_CLOSE } from 'components/DropInVideoPlayer'
import CountdownTimer, { FORMAT_HH_MM_SS } from 'components/CountdownTimer'
import Icon, { ICON_TYPES, ICON_STYLES } from 'components/Icon.v2'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import { Button, TYPES } from 'components/Button.v2'
import { H2, H3, HEADING_TYPES } from 'components/Heading'
import Link from 'components/Link'
import { TARGET_BLANK } from 'components/Link/constants'
import { URL_TERMS_PRIVACY } from 'services/url/constants'
import { get as getConfig } from 'config'

const PLAYER_CONTROLS = {
  visibleControls: [BASIC_CONTROL_OPTIONS_CLOSE],
  type: BASIC_CONTROLS,
}

const EMPTY_CONTEXT = Map()

function createClick (type) {
  try {
    return new MouseEvent('click', {
      cancelable: true,
      bubbles: true,
    })
  } catch (e) {
    if (document.createEvent) {
      const event = document.createEvent('MouseEvent')
      event.initEvent(type, true, true)
      return event
    }
  }
  return null
}

function getClassName (alertBar, media, videoReady, error) {
  const className = ['share__player']
  if (alertBar) {
    className.push('share__player--alert')
  }
  if (media && !videoReady) {
    className.push('share__player--video-loading')
  } else if (media && videoReady) {
    className.push('share__player--video-playing')
  }
  if (error) {
    className.push('share__player--error')
  }
  return className.join(' ')
}

function getSeriesTitle (content, staticText) {
  const template = staticText.get('watchTrailerV3', '')
  const title = content.get('seriesTitle', '')
  return template.replace(/\{seriesTitle\}/, title)
}

function renderMeta (content, error) {
  const episode = content.get('episode')
  const season = content.get('season')
  return (
    <p>
      {season ? <span>{`S${season}:E${episode}`}</span> : null}
      {content.get('duration') && !error ? formatDuration(content.get('duration')) : null}
    </p>
  )
}

function renderYogaMeta (content) {
  const host = content.get('host', '')
  const yogaLevel = content.get('yogaLevel', '')
  const yogaStyle = content.get('yogaStyle', '')
  return yogaStyle ? (
    <p>
      {host ? <span>{host}</span> : null}
      {yogaStyle ? <span>{yogaStyle}</span> : null}
      {yogaLevel ? <span>{yogaLevel}</span> : null}
    </p>
  ) : null
}

function renderFitnessMeta (content) {
  const host = content.get('host', '')
  const fitnessLevel = content.get('fitnessLevel', '')
  const fitnessStyle = content.get('fitnessStyle', '')
  return fitnessStyle ? (
    <p>
      {host ? <span>{host}</span> : null}
      {fitnessStyle ? <span>{fitnessStyle}</span> : null}
      {fitnessLevel ? <span>{fitnessLevel}</span> : null}
    </p>
  ) : null
}

function renderAlert (share, staticText, isAnonymous) {
  const unavailableReason = share.get('unavailableReason')
  const expired = share.get('expired')

  if (unavailableReason === UNAVAILABLE_REASON.VIEW_LIMIT_EXCEEDED
    || !isAnonymous
    || expired) {
    return null
  }

  if (unavailableReason === UNAVAILABLE_REASON.GEO_NOT_AVAILABLE) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="share__player-alert share__player-alert--geo"
      ><span>{staticText.get('notAvailable')}</span>
      </div>
    )
  }

  const name = share.get('personalization')
  const expirationDate = share.get('expirationDate')
  const staticTextKey = (expirationDate && name && 'enjoyThisVideoFromExpirationV3')
    || (expirationDate && !name && 'enjoyThisVideoExpirationV3')
    || (!expirationDate && name && 'enjoyThisVideoFromV3')
    || null

  if (!staticTextKey) {
    return null
  }

  const message = staticText.get(staticTextKey)
    .replace('{name}', name).split('{time}')

  let remainingTime

  if (expirationDate) {
    remainingTime = new Date(expirationDate).getTime() - Date.now()
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="share__player-alert"
    >
      <span>{message[0]}</span>
      {remainingTime ? (
        <CountdownTimer
          durationMs={remainingTime}
          format={FORMAT_HH_MM_SS}
          enableTimer
        />
      ) : null}
      {message[1] || null}
    </div>
  )
}

function renderVideo ({
  setVideoViewed,
  onRemovePlayer,
  onVideoLoaded,
  startAt,
  videoId,
  media,
  lang,
}) {
  if (!media || !videoId) {
    return null
  }

  const textTracks = media.getIn(['textTracks'])
  const srcsByLang = media.getIn(['mediaUrls', 'byLang'], List())
  const foreignDub = srcsByLang.find((src, l) => l === lang)
  const defaultTextTrack = foreignDub ? null : textTracks.get('subtitles').find((src, l) => l === lang)
  const mediaURL = foreignDub || media.getIn(['mediaUrls', 'bcHLS'])
  const mediaId = media.get('mediaId')
  return (
    <div className="share__player-video">
      <DropInVideoPlayer
        startAt={startAt ? Number(startAt) : 0}
        defaultTextTracks={defaultTextTrack}
        qualifyViewsAction={setVideoViewed}
        onPlayerSuccess={onVideoLoaded}
        handleVideoEnd={onRemovePlayer}
        onClosePlayer={onRemovePlayer}
        controls={PLAYER_CONTROLS}
        textTracks={textTracks}
        playerSrc={mediaURL}
        mediaId={mediaId}
        videoId={videoId}
        autoplay={false}
        styled
      />
    </div>
  )
}

function renderTermsConditions (content, staticText) {
  const siteSegment = content.get('siteSegment') || Map()
  const isYoga = siteSegment.get('id') === 120006 || siteSegment.get('name') === 'Yoga'
  const { origin } = getConfig()
  const termsUrl = `${origin}${URL_TERMS_PRIVACY}`

  if (!isYoga) {
    return null
  }

  return (
    <div className="share__player-terms-conditions">
      {`${staticText.get('termsConditions')} `}
      <Link
        className="share__player-terms-link"
        directLink
        to={termsUrl}
        target={TARGET_BLANK}
      >
        {staticText.get('termsConditionsLink')}
      </Link>
    </div>
  )
}

export default function SharePlayer ({
  setQualifiedView,
  isAnonymous,
  staticText,
  videoId,
  startAt,
  error,
  share,
  lang,
}) {
  const content = share.get('content', Map())
  const trailerMedia = share.get('trailerMedia')
  const unavailableReason = share.get('unavailableReason')
  const imageWithText = content.get('imageWithText')
  const imageNoText = content.get('imageNoText')
  const previewMedia = share.get('previewMedia')
  const fullMedia = share.get('fullMedia')
  let teaser = content.get('teaser', '')

  if (teaser.length > 380) {
    teaser = `${teaser.substr(0, 380)}...`
  }

  const title = content.get('title')
  const token = share.get('token')

  const [media, setMedia] = useState(null)
  const [videoReady, setVideoReady] = useState(false)
  const alertBar = renderAlert(share, staticText, isAnonymous)

  const backgrounds = useMemo(() => ({
    cleanImage: imageNoText ? { backgroundImage: `url(${imageNoText}}` } : null,
    dirtyImage: imageWithText ? { backgroundImage: `url(${imageWithText})` } : null,
  }), [imageWithText, imageNoText])

  const setVideoViewed = useCallback(() => {
    // only set qualified view for full-feature
    // and when there is no unavailableReason (this is because
    // the fulLMedia can be the preview in certain situations and we don't want to log that)
    // and only when an anonymous person is viewing the video (members should not count)
    if (media === fullMedia
      && !unavailableReason
      && isAnonymous) {
      setQualifiedView(token)
    }
  }, [media, token])

  const onClickFeature = useCallback(() => {
    setMedia(fullMedia)
    window.scrollTo(0, 0)
  }, [media, fullMedia])

  const onClickPreview = useCallback(() => {
    setMedia(previewMedia)
    window.scrollTo(0, 0)
  }, [media, previewMedia])

  const onClickTrailer = useCallback(() => {
    setMedia(trailerMedia)
    window.scrollTo(0, 0)
  }, [media, trailerMedia])

  const onRemovePlayer = useCallback(() => {
    setVideoReady(false)
    setMedia(null)
  }, [])

  const onVideoLoaded = useCallback(() => {
    const click = createClick()
    const $trigger = document.querySelector
      && document.querySelector('.vjs-poster')
    if ($trigger && click) {
      $trigger.dispatchEvent(click)
    }
    setVideoReady(true)
  }, [])

  return (
    <section className={getClassName(alertBar, media, videoReady, error)}>
      <div
        className="share__player-bg share__player-bg--desktop"
        style={backgrounds.cleanImage}
        role="presentation"
      />
      <div
        className="share__player-bg share__player-bg--mobile"
        style={backgrounds.dirtyImage}
        role="presentation"
      />
      <div className="share__player-body">
        {error ? (
          <H3>{staticText.get('videoNotFound')}</H3>
        ) : (
          <React.Fragment>
            {alertBar}
            <H2 as={HEADING_TYPES.H4}>{title}</H2>
            <p>{teaser}</p>
            <div className="share__player-meta">
              {renderFitnessMeta(content)}
              {renderYogaMeta(content)}
              {renderMeta(content, error)}
            </div>
            {trailerMedia ? (
              <div className="share__player-series-cta">
                <Button type={TYPES.GHOST} onClick={onClickTrailer}>
                  {getSeriesTitle(content, staticText)}
                </Button>
              </div>
            ) : null}
            <ul className="share__player-actions">
              {fullMedia ? (
                <li className="share__player-action">
                  <Button className="share__player-btn-play" type={TYPES.GHOST} onClick={onClickFeature}>
                    <Icon type={ICON_TYPES.PLAY} style={ICON_STYLES.FILL} />
                    {unavailableReason ? (
                      <span className="share__player-action-text">
                        {staticText.get('preview')}
                      </span>
                    ) : (
                      <span className="share__player-action-text">
                        {staticText.get('watchNow')}
                      </span>
                    )}
                  </Button>
                </li>
              ) : null}
              {previewMedia ? (
                <li className="share__player-action">
                  <Button type={TYPES.GHOST} onClick={onClickPreview}>
                    <Icon type={ICON_TYPES.PREVIEW} style={ICON_STYLES.FILL} />
                    <span className="share__player-action-text">
                      {staticText.get('preview')}
                    </span>
                  </Button>
                </li>
              ) : null}
              {!isAnonymous && !error ? (
                <li className="share__player-action">
                  <PlaylistAddRemove
                    contentId={content.get('contentId', '')}
                    upstreamContext={EMPTY_CONTEXT}
                  />
                </li>
              ) : null}
            </ul>
            {renderTermsConditions(content, staticText)}
          </React.Fragment>
        )}
      </div>
      {renderVideo({
        setVideoViewed,
        onRemovePlayer,
        onVideoLoaded,
        videoId,
        startAt,
        media,
        lang,
      })}
    </section>
  )
}

SharePlayer.defaultProps = {
  isAnonymous: true,
  lang: 'en',
  startAt: 0,
}

SharePlayer.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  setQualifiedView: PropTypes.func.isRequired,
  share: ImmutablePropTypes.map.isRequired,
  isAnonymous: PropTypes.bool,
  videoId: PropTypes.number,
  startAt: PropTypes.number,
  lang: PropTypes.string,
}
