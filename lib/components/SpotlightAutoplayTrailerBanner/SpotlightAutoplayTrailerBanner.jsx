import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import _partial from 'lodash/partial'
import _isBoolean from 'lodash/isBoolean'
import { isTypeSeriesAll, TYPE_PRODUCT_SINGLE } from 'services/content-type'
import {
  getTitleElementTypeByUrl,
  upstreamContextOnClick as upstreamContextClick,
  SERIES_BUTTON,
} from 'services/upstream-context'

import Icon from 'components/Icon'
import DropInVideoPlayer from 'components/DropInVideoPlayer'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import Link from 'components/Link'
import { formatDuration } from 'theme/web-app'
import {
  BASIC_CONTROLS,
  BASIC_CONTROL_OPTIONS_VOLUME,
} from 'components/DropInVideoPlayer/DropInVideoPlayer'
import WatchAccess, { ACCESS_PREVIEW, ACCESS_FEATURE } from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import { SERIES_CLICK, PLAY_EVENT, TITLE_CLICK } from 'services/event-tracking'
import MinimizeSpotlight from 'components/SpotlightMinimized/MinimizeSpotlight'
import { H1 } from 'components/Heading'

class SpotlightAutoplayTrailerBanner extends Component {
  constructor (props) {
    super(props)

    const { data } = props
    const type = data.getIn(['type', 'content'])
    const playlist = data.getIn(['userInfo', 'playlist'])

    this.state = {
      playlist,
      isSeries: isTypeSeriesAll(type),
      slideStateIsOut: false,
    }
  }

  componentDidMount () {
    const { props } = this
    const { mediaId, auth, user } = props
    props.getMediaData({ id: mediaId, auth, user })
  }

  componentDidUpdate (prevProps, prevState) {
    const { props } = this
    const { data, mediaId, auth, user } = props
    const playlist = data.getIn(['userInfo', 'playlist'])
    if (prevState.playlist === null && _isBoolean(playlist)) {
      // eslint-disable-next-line
      this.setState({ playlist })
    }
    if (prevProps.mediaId !== mediaId) {
      props.getMediaData({ id: mediaId, auth, user })
    }
  }

  onSetInPlaylist = () => {
    const { props, state } = this
    const { playlist } = state
    const { auth, data, setInPlaylist } = props

    const videoId = data.get('id')
    if (videoId) {
      setInPlaylist(videoId, !playlist, auth.get('jwt'))
      this.setState({ playlist: !playlist })
    }
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

  getEventOptions = () => {
    const { props } = this
    const {
      auth,
      page,
      app,
      upstreamContext,
      language,
    } = props

    return {
      auth,
      location,
      page,
      app,
      upstreamContext,
      language,
    }
  }

  handleClick = (e, eventName, onClick) => {
    const { merchEventData, setDefaultGaEvent } = this.props
    if (merchEventData) {
      const eventData = merchEventData.set('eventAction', eventName)
      setDefaultGaEvent(eventData)
    }

    if (onClick) onClick(e)
  }

  toggleSlideStateIsOut = (evt) => {
    evt.preventDefault()
    const isOut = !this.state.slideStateIsOut
    this.setState({
      slideStateIsOut: isOut,
    })
    const options = this.getEventOptions()
    options.isOut = isOut
  }

  sendVolumeToggleEvent = (isMuted) => {
    const options = this.getEventOptions()
    options.isMuted = isMuted
  }

  // TODO: this should be its own component at some point
  renderPlayButton = (upstreamContextOnClick) => {
    const {
      props,
    } = this
    const {
      auth,
      data,
      staticText,
    } = props

    const isPublished = data.get('published', false)
    const preview = data.get('preview', null)
    const feature = data.get('feature', null)
    const url = data.get('url', null)

    const classNames = ['icon--play-fill', 'icon--white', 'autoplay-banner__play-icon']

    return isPublished ? (
      <div className="autoplay-banner__play-action">
        <WatchAccess auth={auth} preview={preview} feature={feature}>
          <WatchAccessAllowed access={ACCESS_FEATURE}>
            <Link
              to={url}
              data-element="play-button"
              onClick={e => this.handleClick(e, PLAY_EVENT, upstreamContextOnClick)}
              query={{ fullplayer: 'feature' }}
              className="autoplay-banner__play-link"
            >
              <Icon
                iconClass={classNames}
              />
              {staticText.getIn(['data', 'watchNow'])}
            </Link>
          </WatchAccessAllowed>
          <WatchAccessAllowed access={ACCESS_PREVIEW}>
            <Link
              className="autoplay-banner__play-link"
              to={url}
              query={{ fullplayer: 'preview' }}
            >
              <Icon
                iconClass={classNames}
              />
            </Link>
          </WatchAccessAllowed>
        </WatchAccess>
      </div>
    ) : null
  }

  renderSeriesButton = (isSeries, url, onClick) => {
    const { data, staticText } = this.props
    const isPublished = data.get('published', false)
    return isPublished ? (
      <div className="autoplay-banner__series-btn-container">
        <Link
          to={url}
          data-element={SERIES_BUTTON}
          onClick={e => this.handleClick(e, SERIES_CLICK, onClick)}
          className="button button--primary button--view-series autoplay-banner__series-btn"
        >
          {staticText.getIn(['data', 'viewSeries'])}
        </Link>
      </div>
    ) : null
  }

  render () {
    const {
      state,
      props,
      sendVolumeToggleEvent,
      getUpstreamContextOnClick,
    } = this
    const {
      playlist,
      isSeries,
    } = state
    const {
      data,
      label,
      upstreamContext,
      media,
      merchEventData,
      showMinimizeButton,
    } = props

    const isPublished = data.get('published', false)
    const url = data.get('url')
    const title = data.get('title')
    const duration = data.get('displayType') === 'yoga' ? formatDuration(data.get('duration')) : null
    const description = data.get('teaser')
    const slideClass = this.state.slideStateIsOut
      ? 'out'
      : 'in'
    const upstreamContextOnClick = getUpstreamContextOnClick()
    const seriesTitle = data.get('seriesTitle')
    const seriesPath = data.get('seriesPath')

    const mediaId = data.getIn(['preview', 'id'])
    if (!mediaId || mediaId === -1 || mediaId !== media.get('id')) {
      return (
        <div className="autoplay-banner__default">
          {this.props.children}
        </div>
      )
    }
    const isSingle = data.getIn(['type', 'product']) === TYPE_PRODUCT_SINGLE
    const eventType = isSingle ? TITLE_CLICK : SERIES_CLICK
    return (
      <div className={`autoplay-banner ${slideClass}${showMinimizeButton ? ' autoplay-banner--show-minimize-button' : ''}`}>
        <div className="autoplay-banner__container">
          <div className="autoplay-banner__overlay" />

          <div className="autoplay-banner__body">
            {label && label !== '' ?
              <div className="spotlight-banner__label-container">
                <span className="spotlight-banner__gradient-pipe" />
                <span className="spotlight-banner__label">
                  {label}
                </span>
              </div> : null
            }
            { seriesTitle ?
              <Link
                to={seriesPath}
                title={title}
                onClick={e => this.handleClick(e, eventType, upstreamContextOnClick)}
                data-element={getTitleElementTypeByUrl(url)}
              >
                <p className="autoplay-banner__series-title">{ seriesTitle }</p>
              </Link>
              : null }
            <H1 inverted className="autoplay-banner__title">
              {isPublished ? (
                <Link
                  to={url}
                  title={title}
                  onClick={e => this.handleClick(e, eventType, upstreamContextOnClick)}
                  data-element={getTitleElementTypeByUrl(url)}
                >
                  {title}
                </Link>
              ) : (
                <div>
                  {title}
                </div>
              )}
            </H1>
            {
              duration ?
                <p className="autoplay-banner__text">{`${duration}`}</p>
                : null
            }
            <p className="autoplay-banner__text">{description}</p>
            <div className="autoplay-banner__button-container">
              {!isSeries ?
                this.renderPlayButton(upstreamContextOnClick) :
                this.renderSeriesButton(isSeries, url, upstreamContextOnClick)
              }
              {
                playlist !== null && isPublished && !isSeries
                  ? <PlaylistAddRemove
                    contentId={data.get('id')}
                    upstreamContext={upstreamContext.delete('destId')} // schema prohibited
                    merchEventData={merchEventData}
                  />
                  : null
              }
            </div>
          </div>

          { showMinimizeButton && <MinimizeSpotlight /> }
          <button
            className="autoplay-banner__slide-toggle"
            onClick={this.toggleSlideStateIsOut}
          >
            <Icon iconClass={['icon--left']} />
          </button>

          <DropInVideoPlayer
            autoplay
            loop
            controls={{
              type: BASIC_CONTROLS,
              visibleControls: [BASIC_CONTROL_OPTIONS_VOLUME],
            }}
            mediaId={mediaId}
            mediaWasFetched
            optionalMuteToggleFunction={sendVolumeToggleEvent}
          />
        </div>

        <div className="autoplay-banner__backup-banner">
          {this.props.children}
        </div>

      </div>
    )
  }
}

SpotlightAutoplayTrailerBanner.propTypes = {
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
  setInPlaylist: PropTypes.func,
  setUpstreamContext: PropTypes.func,
  clearUpstreamContext: PropTypes.func.isRequired,
  getMediaData: PropTypes.func,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
      media: state.media,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setInPlaylist: actions.playlist.setInPlaylist,
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
        clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
        getMediaData: actions.media.getMediaData,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
  /*
    - reusing SpotlightBanner static text, don't think we need to make a new spot
      in static text for one property
    - If there becomes more of a need for static text for this component, implement it then
  */
  connectStaticText({ storeKey: 'spotlightBanner' }),
)(SpotlightAutoplayTrailerBanner)
