import React from 'react'
import { formatDuration } from 'theme/web-app'
import Link from 'components/Link'
import Icon from 'components/Icon'
import {
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_VIDEO,
} from 'services/content-type'
import { connect as connectStaticText } from 'components/StaticText/connect'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import WatchAccess, {
  ACCESS_CHECK_AUTH_FEATURE_GEO,
} from 'components/WatchAccess'
import WatchAccessDenied from 'components/WatchAccessDenied'
import NotAvailable, {
  TYPE_NOT_AVAILABLE_OVERLAY,
} from 'components/NotAvailable'
import { isFeatureAllowedWithSubscription } from 'services/subscription'
import {
  TYPE_PREVIEW,
  TYPE_FEATURE,
} from 'services/video'

class YogaMultipackTile extends React.Component {
  static getDerivedStateFromProps (props) {
    const {
      tile,
    } = props
    const inPlaylist = tile.getIn(['userInfo', 'playlist'])
    return {
      inPlaylist,
    }
  }

  constructor (props) {
    super(props)
    this.state = { inPlaylist: null }
  }

  setContext = () => {
    const {
      tile,
      itemIndex,
      setUpstreamContext,
      upstreamContext,
    } = this.props
    const campaignId = tile.getIn(['merchandising', 'campaignId'])
    const nid = tile.get('nid')
    const isSeries = tile.get('type').includes(TYPE_CONTENT_SERIES)
    if (upstreamContext) {
      let updatedContext = upstreamContext.merge({
        itemIndex,
        campaignId,
      })
      updatedContext = updatedContext.merge({
        contentId: nid,
        contentType: isSeries ? TYPE_CONTENT_SERIES : TYPE_CONTENT_VIDEO,
      })
      setUpstreamContext(updatedContext)
    }
  }

  renderMoreInfo = () => {
    const { props, setContext } = this
    const {
      placement,
      tile,
    } = props
    const url = tile.get('path')
    return (
      <Link to={url} className="yoga-3-pack-tile__link" onClick={setContext}>
        <Icon iconClass={['icon--dots', 'yoga-3-pack-tile__more-info-icon', `yoga-3-pack-tile__more-info-icon--${placement}`]} />
      </Link>
    )
  }

  renderPlaylistIcon = () => {
    const { props, state } = this
    const {
      tile,
      setInPlaylist,
      auth,
      placement,
    } = props
    const { inPlaylist } = state
    const id = tile.get('nid')
    const onSetInPlaylist = () => {
      if (id) {
        setInPlaylist(id, !inPlaylist, auth.get('jwt'))
        this.setState({ inPlaylist: !inPlaylist })
      }
    }
    if (!inPlaylist) {
      return <Icon iconClass={['icon--add', 'yoga-3-pack-tile__playlist-icon', `yoga-3-pack-tile__playlist-icon--${placement}`]} onClick={onSetInPlaylist} />
    }
    return <Icon iconClass={['icon--subtract', 'yoga-3-pack-tile__playlist-icon', `yoga-3-pack-tile__playlist-icon--${placement}`]} onClick={onSetInPlaylist} />
  }

  renderPlayIcon = () => {
    const { props } = this
    const {
      placement,
    } = props

    return (
      <Icon
        element="play-button"
        iconClass={['icon--play-fill', 'icon--action', 'yoga-3-pack-tile__play-icon', `yoga-3-pack-tile__play-icon--${placement}`]}
      />
    )
  }

  renderVideoInfo = (playUrl) => {
    const { props, setContext } = this
    const { tile, placement } = props
    const title = tile.get('title')
    const duration = formatDuration(tile.getIn(['feature', 'duration']))
    const level = tile.getIn(['classicFacets', 'yoga_level', 0, 'name'])
    const style = tile.getIn(['classicFacets', 'yoga_style', 0, 'name'])
    const instructor = tile.getIn(['fields', 'instructor', 0, 'value'])

    return (
      <div className={`yoga-3-pack-tile__text-container yoga-3-pack-tile__text-container--${placement}`}>
        <p className="yoga-3-pack-tile__text">{instructor}</p>
        <Link to={playUrl} className="yoga-3-pack-tile__link" onClick={setContext}>
          <p className="yoga-3-pack-tile__text yoga-3-pack-tile__title">{title}</p>
        </Link>
        <div className="yoga-3-pack-tile__text-bottom-container">
          <p className="yoga-3-pack-tile__text-bottom yoga-3-pack-tile__text">{style}</p>
          <p className="yoga-3-pack-tile__text-bottom yoga-3-pack-tile__text">{level}</p>
          <p className="yoga-3-pack-tile__text-bottom yoga-3-pack-tile__text">{duration}</p>
        </div>
      </div>
    )
  }

  renderSeriesInfo = () => {
    const { props, setContext } = this
    const { tile, staticText, placement } = props
    const seriesTitle = tile.get('title')
    const episodeCount = tile.get('total_episodes')
    const url = tile.get('path')
    const episodesText =
      episodeCount > 1
        ? staticText.getIn(['data', 'episodes'])
        : staticText.getIn(['data', 'episode'])

    return (
      <div className={`yoga-3-pack-tile__text-container yoga-3-pack-tile__text-container-series--${placement}`}>
        <p className="yoga-3-pack-tile__text yoga-3-pack-tile__text--series">{staticText.getIn(['data', 'series'])}</p>
        <Link to={url} className="yoga-3-pack-tile__link" onClick={setContext}>
          <p className="yoga-3-pack-tile__text yoga-3-pack-tile__title">{seriesTitle}</p>
        </Link>
        <p className="yoga-3-pack-tile__text">
          {`${episodeCount} ${episodesText}`}
        </p>
      </div>
    )
  }

  renderWatchAccessOverlay = () => {
    const {
      tile,
      auth,
      staticText,
    } = this.props
    const preview = tile.get('preview')
    const feature = tile.get('feature')
    return (
      <WatchAccess
        auth={auth}
        preview={preview}
        feature={feature}
        accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
      >
        <WatchAccessDenied>
          <NotAvailable
            type={TYPE_NOT_AVAILABLE_OVERLAY}
            message={staticText.get('notAvailableInRegion')}
          />
        </WatchAccessDenied>
      </WatchAccess>
    )
  }

  render () {
    const {
      props,
      renderMoreInfo,
      renderPlayIcon,
      renderPlaylistIcon,
      renderVideoInfo,
      renderSeriesInfo,
      renderWatchAccessOverlay,
      setContext,
    } = this
    const {
      tile,
      placement,
      auth,
    } = props
    const feature = tile.get('feature')
    const userIsEntitled = isFeatureAllowedWithSubscription(feature, auth)
    const videoType = !userIsEntitled ? TYPE_PREVIEW : TYPE_FEATURE
    const playUrl = `${tile.get('path')}?fullplayer=${videoType}`
    const hero = `url(${tile.getIn(['hero_image_withtext', 'hero_570x300'])})`
    const isSeries = tile.get('type').includes(TYPE_CONTENT_SERIES)
    const preview = tile.get('preview')

    if (isSeries) {
      return (
        <div className={`yoga-3-pack-tile yoga-3-pack-tile__${placement}`}>
          <div className="yoga-3-pack-tile__hero-container">
            { renderMoreInfo() }
            <Link to={playUrl} className="yoga-3-pack-tile__link" onClick={setContext}>
              { isSeries ? null : renderPlayIcon() }
              <div className={`yoga-3-pack-tile__hero yoga-3-pack-tile__hero--${placement}`} style={{ backgroundImage: hero }} />
            </Link>
          </div>
          { renderSeriesInfo() }
        </div>
      )
    }
    return (
      <div className={`yoga-3-pack-tile yoga-3-pack-tile__${placement}`}>
        { renderWatchAccessOverlay() }
        <div className="yoga-3-pack-tile__hero-container">
          { renderPlaylistIcon() }
          <Link to={playUrl} className="yoga-3-pack-tile__link" onClick={setContext}>
            { renderPlayIcon() }
            <div className={`yoga-3-pack-tile__hero yoga-3-pack-tile__hero--${placement}`} style={{ backgroundImage: hero }} />
          </Link>
        </div>
        <WatchAccess
          auth={auth}
          preview={preview}
          feature={feature}
          accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
        >
          { renderVideoInfo(playUrl) }
        </WatchAccess>
      </div>
    )
  }
}

YogaMultipackTile.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  placement: PropTypes.string,
  setInPlaylist: PropTypes.func.isRequired,
  tile: ImmutablePropTypes.map.isRequired,
  itemIndex: PropTypes.number,
}

export default connectStaticText({ storeKey: 'YogaMultipackTile' })(YogaMultipackTile)
