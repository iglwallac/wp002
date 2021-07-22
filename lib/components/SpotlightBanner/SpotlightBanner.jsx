import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _partial from 'lodash/partial'
import Icon from 'components/Icon'
import Link from 'components/Link'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { formatDuration, truncate } from 'theme/web-app'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import BannerPlaceholder from 'components/BannerPlaceholder'
import WatchAccessDenied from 'components/WatchAccessDenied'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import HeroImage, { HERO_IMAGE_OVERLAY_TO_RIGHY_OPACITY_DARK } from 'components/HeroImage'
import WatchAccess, { ACCESS_PREVIEW, ACCESS_FEATURE } from 'components/WatchAccess'
import { isTypeSeriesAll, isTypeEpisodeAll, isTypeYogaFitnessSeries, isTypeYogaFitnessVideo, isTypeYogaFitnessEpisode } from 'services/content-type'
import { BANNER, SERIES_BUTTON, getTitleElementTypeByUrl, upstreamContextOnClick as upstreamContextClick } from 'services/upstream-context'
import { SERIES_CLICK, TITLE_CLICK, PLAY_EVENT } from 'services/event-tracking'
import MinimizeSpotlight from 'components/SpotlightMinimized/MinimizeSpotlight'


function getClassName (className, isPublished, isSeries) {
  const classArray = ['spotlight-banner']
  if (isPublished) classArray.push('spotlight-banner--published')
  if (isSeries) classArray.push('spotlight-banner--series')
  return classArray.concat(className || []).join(' ')
}

class SpotlightBanner extends Component {
  constructor (props) {
    super(props)
    this.state = {
      playlist: null,
    }
  }

  componentWillReceiveProps (nextProps) {
    const { state } = this
    const { data } = nextProps
    const userInfo = data.get('userInfo', Map())
    if (state.playlist === null && userInfo && userInfo.size > 0) {
      this.setState(() => ({
        playlist: userInfo.get('playlist'),
      }))
    }
  }

  onBannerContainerClick = (evt, upstreamContextOnClick) => {
    const { props, handleClick } = this
    const { history } = props
    const href = evt.currentTarget.getAttribute('data-href')
    handleClick(null, 'Banner Event')
    upstreamContextOnClick(evt) // set upstream context for the element we clicked
    history.push(href)
  }

  getUpstreamContextOnClick = () => {
    const { props } = this
    const {
      upstreamContext,
      setUpstreamContext,
    } = props

    return _partial(
      upstreamContextClick,
      _partial.placeholder,
      { upstreamContext, setUpstreamContext },
    )
  }

  handleClick = (e, eventName, onClick) => {
    const { merchEventData, setDefaultGaEvent } = this.props
    if (merchEventData) {
      const eventData = merchEventData.set('eventAction', eventName)
      setDefaultGaEvent(eventData)
    }

    if (onClick) onClick(e)
  }

  renderHeroImage = (heroImage) => {
    return (
      <HeroImage
        className={['spotlight-banner__background-hero']}
        hasOverlay
        alwaysUseProps
        overlayOpacity={HERO_IMAGE_OVERLAY_TO_RIGHY_OPACITY_DARK}
        smallUrl={heroImage.get('small')}
        mediumSmallUrl={heroImage.get('mediumSmall')}
        mediumUrl={heroImage.get('medium')}
        largeUrl={heroImage.get('large')}
      />
    )
  }

  renderTitleLink = (isEpisode, isPublished, titlesAndUrls, onClick) => {
    const { title, url, seriesTitle, seriesPath, seriesLogo } = titlesAndUrls
    const theTitle = isEpisode ? seriesTitle : title
    const theUrl = isEpisode ? seriesPath : url
    let titleToDisplay = theTitle
    if (seriesLogo) {
      titleToDisplay = <img src={seriesLogo} className="spotlight-banner__title-logo--image" alt="series logo" />
    }
    const className = seriesLogo ?
      'spotlight-banner__title spotlight-banner__title-logo' :
      'spotlight-banner__title'

    const eventType = isEpisode ? SERIES_CLICK : TITLE_CLICK

    return (
      <div className={isEpisode ?
        'spotlight-banner__title-container spotlight-banner__title-container--series' :
        'spotlight-banner__title-container'}
      >
        { isPublished ? (
          <Link
            to={theUrl}
            data-element={getTitleElementTypeByUrl(theUrl)}
            onClick={e => this.handleClick(e, eventType, onClick)}
            className={className}
            title={theTitle}
          >
            { titleToDisplay }
          </Link>
        ) : (
          <div className={className}>
            { titleToDisplay }
          </div>
        )}
      </div>
    )
  }

  renderTitleLinkMeta = (isEpisode, isPublished, title, url, onClick) => {
    return isEpisode
      ? (
        <span className="spotlight-banner__meta-item">
          { isPublished ? (
            <Link
              to={url}
              data-element={getTitleElementTypeByUrl(url)}
              onClick={e => this.handleClick(e, TITLE_CLICK, onClick)}
              className="spotlight-banner__meta-item--link spotlight-banner__series-link spotlight-banner__episode-title"
            >
              { title }
            </Link>
          ) : (
            <div className="spotlight-banner__meta-item--link spotlight-banner__series-link">
              { title }
            </div>
          )}
        </span>
      )
      : null
  }

  renderHostMeta = (host, type) => {
    const shouldRenderHost = isTypeYogaFitnessVideo(type)
      || isTypeYogaFitnessEpisode(type)
      || isTypeYogaFitnessSeries(type)

    return host && shouldRenderHost
      ? (
        <span className="spotlight-banner__meta-item">
          { host }
        </span>
      )
      : null
  }

  renderYogaStyleMeta = (yogaStyle) => {
    return yogaStyle
      ? <span className="spotlight-banner__meta-item">{yogaStyle}</span>
      : null
  }

  renderFitnessStyleMeta = (fitnessStyle) => {
    return fitnessStyle
      ? <span className="spotlight-banner__meta-item">{fitnessStyle}</span>
      : null
  }

  renderSeasonEpisodeMeta = (isSeries, season, episode) => {
    if (isSeries || (!season && !episode)) {
      return null
    }

    let text = ''
    if (season && season === 1) {
      text = `Episode ${episode}`
    } else if (season && season > 1) {
      text = `S${season}:E${episode}`
    }
    return (
      <span className="spotlight-banner__meta-item">
        { text }
      </span>
    )
  }

  renderSeasonEpisodeCountMeta = (isSeries, seasonCount, episodeCount) => {
    const { props } = this
    const { staticText } = props

    return isSeries
      ? (
        <span className="spotlight-banner__meta-item">
          { `${seasonCount} ${staticText.getIn(['data', 'season'])}${seasonCount === 1 ? '' : 's'}, ${episodeCount} ${staticText.getIn(['data', 'episodes'])}` }
        </span>
      )
      : null
  }

  renderDurationMeta = (duration) => {
    return duration
      ? (
        <span className="spotlight-banner__meta-item spotlight-banner__meta-item--last">
          { formatDuration(duration) }
        </span>
      )
      : null
  }

  renderYearMeta = (year, type) => {
    const isYogaFitnessContent = isTypeYogaFitnessVideo(type)
      || isTypeYogaFitnessEpisode(type)
      || isTypeYogaFitnessSeries(type)
    const shouldRenderYear = year && !isYogaFitnessContent
    return shouldRenderYear
      ? <span className="spotlight-banner__meta-item">{year}</span>
      : null
  }

  renderSeriesButton = (isSeries, isPublished, url, onClick) => {
    const { props, handleClick } = this
    const { staticText } = props
    return isSeries && isPublished
      ? (
        <span className="spotlight-banner__series-btn-container">
          <Link
            to={url}
            data-element={SERIES_BUTTON}
            onClick={e => handleClick(e, SERIES_CLICK, onClick)}
            className="spotlight-banner__series-btn"
          >
            <span>{staticText.getIn(['data', 'viewSeries'])}</span>
            <Icon iconClass={['icon--right', 'spotlight-banner__series-icon-right']} />
          </Link>
        </span>
      )
      : null
  }

  renderPlayButton = (isSeries, isPublished, auth, preview, feature, url, onClick) => {
    const { renderPlayIcon, handleClick, props } = this
    const { staticText } = props

    return !isSeries && isPublished
      ? (
        <div className="spotlight-banner__play-action">
          <WatchAccess auth={auth} preview={preview} feature={feature}>
            <WatchAccessAllowed access={ACCESS_FEATURE}>
              <Link
                to={url}
                data-element="play-button"
                onClick={e => handleClick(e, PLAY_EVENT, onClick)}
                query={{ fullplayer: 'feature' }}
                className="spotlight-banner__play-link"
              >
                <span className="spotlight-banner__play-btn-text">{staticText.getIn(['data', 'watchNow'])}</span>
                { renderPlayIcon() }
              </Link>
            </WatchAccessAllowed>
            <WatchAccessAllowed access={ACCESS_PREVIEW}>
              <Link
                className="spotlight-banner__play-link"
                to={url}
                query={{ fullplayer: 'preview' }}
              >
                { renderPlayIcon() }
              </Link>
            </WatchAccessAllowed>
            <WatchAccessDenied>
              <Link className="spotlight-banner__play-link" to={url}>
                { renderPlayIcon() }
              </Link>
            </WatchAccessDenied>
          </WatchAccess>
        </div>
      )
      : null
  }

  renderPlayIcon = () => {
    return (
      <Icon
        iconClass={['icon--play-fill', 'icon--white', 'spotlight-banner__play-icon']}
      />
    )
  }

  renderTeaser = (teaser) => {
    return teaser
      ? <p className="spotlight-banner__teaser">{ truncate(teaser, 300) }</p>
      : null
  }

  renderPlaylistAddRemove = (props = {}, id, isPublished, inPlaylist, isSeries) => {
    const { auth, upstreamContext, merchEventData } = props
    const playlistClassName = inPlaylist ? 'spotlight-banner__remove' : 'spotlight-banner__add'
    if (!isSeries && isPublished && auth.get('jwt')) {
      return (
        <div className="spotlight-banner__playlist-btn-container">
          <PlaylistAddRemove
            className={`spotlight-banner__playlist-btn ${playlistClassName}`}
            upstreamContext={upstreamContext.delete('destId')} // schema prohibited
            contentId={id}
            reverse
            merchEventData={merchEventData}
          />
        </div>
      )
    }
    return null
  }

  render () {
    const {
      props,
      state,
      renderHostMeta,
      renderYearMeta,
      renderTeaser,
      renderDurationMeta,
      renderYogaStyleMeta,
      renderHeroImage,
      renderTitleLink,
      renderPlayButton,
      renderSeriesButton,
      renderTitleLinkMeta,
      renderFitnessStyleMeta,
      renderSeasonEpisodeMeta,
      onBannerContainerClick,
      renderPlaylistAddRemove,
      renderSeasonEpisodeCountMeta,
      getUpstreamContextOnClick,
    } = this
    const {
      playlist,
    } = state
    const {
      data,
      label,
      className,
      auth,
      showMinimizeButton,
    } = props
    const userInfo = data.get('userInfo', Map())
    const type = data.getIn(['type', 'content'])
    const isPublished = data.get('published')

    if (userInfo === undefined) {
      return <BannerPlaceholder />
    }
    // eslint-disable-next-line no-shadow
    const upstreamContextOnClick = getUpstreamContextOnClick()
    const isSeries = isTypeSeriesAll(type)
    const isEpisode = isTypeEpisodeAll(type)
    const handleOnClick = isPublished ? _partial(
      onBannerContainerClick,
      _partial.placeholder,
      upstreamContextOnClick,
    ) : null
    const url = data.get('url')
    const heroImage = data.get('heroImage')
    const id = data.get('id')
    const title = data.get('title')
    const seriesTitle = data.get('seriesTitle')
    const seriesPath = data.get('seriesPath')
    const seriesId = data.get('seriesId')
    const seriesLogo = data.get('seriesLogo')
    const host = data.get('host')
    const yogaStyle = data.get('yogaStyle')
    const fitnessStyle = data.get('fitnessStyle')
    const season = data.get('season')
    const episode = data.get('episode')
    const seasonCount = data.get('seasonCount')
    const episodeCount = data.get('episodeCount')
    const duration = data.get('duration')
    const year = data.get('year')
    const preview = data.get('preview')
    const feature = data.get('feature')
    const teaser = data.get('teaser')
    return (
      <div
        /**
         * - We want the entire banner area to be clickable and take users to a detail page
         * - Anchor tag descendents are unaffected by this click handler since it seems that the
         *   native onClick for anchors stops event propagation and it won't bubble up to this outer
         *   container
         */
        data-href={url}
        data-element={BANNER}
        onClick={e => handleOnClick(e)}
        className={getClassName(className, isPublished, isSeries)}
      >
        {
          renderHeroImage(heroImage)
        }
        { showMinimizeButton && <MinimizeSpotlight /> }
        { label && label !== '' ?
          <div className="spotlight-banner__label-container">
            <span className="spotlight-banner__gradient-pipe" />
            <span className="spotlight-banner__label">
              { label }
            </span>
          </div> : null
        }
        <div className="spotlight-banner__meta">
          {
            renderTitleLink(
              isEpisode,
              isPublished,
              { id, title, url, seriesTitle, seriesPath, seriesId, seriesLogo },
              upstreamContextOnClick,
            )
          }
          <div className="spotlight-banner__meta-items">
            <div className="spotlight-banner__meta-items--stack">
              { renderTitleLinkMeta(isEpisode, isPublished, title, url, upstreamContextOnClick) }
            </div>
            <div className="spotlight-banner__meta-items--stack-sm">
              { renderHostMeta(host, type) }
              { renderYogaStyleMeta(yogaStyle) }
              { renderFitnessStyleMeta(fitnessStyle) }
            </div>
            <div className="spotlight-banner__meta-items--stack-sm">
              { renderSeasonEpisodeMeta(isSeries, season, episode) }
              { renderSeasonEpisodeCountMeta(isSeries, seasonCount, episodeCount) }
              { renderDurationMeta(duration) }
              { renderYearMeta(year, type) }
            </div>
          </div>
        </div>
        <div className="spotlight-banner__body">

          { renderTeaser(teaser) }
          { renderSeriesButton(isSeries, isPublished, url, upstreamContextOnClick) }
          {
            renderPlayButton(
              isSeries,
              isPublished,
              auth,
              preview,
              feature,
              url,
              upstreamContextOnClick,
            )
          }
          { renderPlaylistAddRemove(props, id, isPublished, playlist, isSeries) }
        </div>
      </div>
    )
  }
}

SpotlightBanner.propTypes = {
  className: PropTypes.array,
  history: PropTypes.object.isRequired,
  data: ImmutablePropTypes.map.isRequired,
  playlist: ImmutablePropTypes.map,
  key: PropTypes.string,
  mediaId: PropTypes.number,
  label: PropTypes.string,
  page: PropTypes.object,
  auth: ImmutablePropTypes.map.isRequired,
  language: PropTypes.string,
  app: PropTypes.object,
  upstreamContext: ImmutablePropTypes.map,
  setUpstreamContext: PropTypes.func,
  setInPlaylist: PropTypes.func,
  setEventVideoImpressed: PropTypes.func,
  setEventSeriesImpressed: PropTypes.func,
  clearUpstreamContext: PropTypes.func.isRequired,
  merchEventData: ImmutablePropTypes.map,
}

export default compose(
  connectRedux(
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setInPlaylist: actions.playlist.setInPlaylist,
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
        setEventVideoImpressed: actions.eventTracking.setEventVideoImpressed,
        setEventSeriesImpressed: actions.eventTracking.setEventSeriesImpressed,
        clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
  connectStaticText({ storeKey: 'spotlightBanner' }),
)(SpotlightBanner)
