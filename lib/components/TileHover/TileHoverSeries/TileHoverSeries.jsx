import React from 'react'
import { getBoundActions } from 'actions'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { Map } from 'immutable'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import {
  upstreamContextOnClick,
} from 'services/upstream-context'
import { CUSTOM_ROW_CLICK_EVENT, HIDDEN_CONTENT_UNHIDE_EVENT, HIDDEN_CONTENT_HIDE_EVENT } from 'services/event-tracking'
import Icon from 'components/Icon'
import TileHoverSeriesMeta from './TileHoverSeriesMeta'
import TileHoverSeriesMetaTest from './TileHoverSeriesMetaTest'
import RemovedContentOverlay from '../RemovedContentOverlay/RemovedContentOverlay'

const classNames = ['tile-hover-series']
const shelfIconClassNames = ['icon', 'icon--openplaylist', 'icon--action']
const iconClassNames = ['tile-hover-series__shelf-icon', 'tile-hover-series__shelf-icon--small-wrapper']
class TileHoverSeries extends React.Component {
  static getDerivedStateFromProps (props, state) {
    const { upstreamContext, id, index, score, source, videoTasteSegment } = props
    if (state.contentId !== id || state.source !== source) {
      const updatedContext = upstreamContext.merge({
        itemIndex: index,
        contentId: id,
        contentType: 'video',
        score,
        source,
        videoTasteSegment,
      })
      return {
        upstreamContext: updatedContext,
        contentId: id,
        source,
      }
    }
    return null
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount = () => {
    // TODO: Re implement only for visible tiles when we have an analyst
    // this.trackImpressions()
  }

  // componentDidUpdate = (prevProps) => {
  //   if (prevProps.id !== this.props.id) {
  //     this.trackImpressions()
  //   }
  // }

  onClickHide = (e, series) => {
    e.preventDefault()
    const { setDefaultGaEvent, hideContent } = this.props
    const eventData = HIDDEN_CONTENT_HIDE_EVENT
      .set('eventLabel', series.get('title'))
    setDefaultGaEvent(eventData)
    hideContent({ contentType: 'series', contentId: series.get('id') })
  }

  onClickShelf = (e) => {
    const { props, state } = this
    const { upstreamContext } = state
    const {
      series,
      onOpenShelf,
      setUpstreamContext,
    } = props

    e.preventDefault()

    upstreamContextOnClick(e, { upstreamContext, setUpstreamContext })

    if (onOpenShelf) {
      const legacyContentType = series.getIn(['type', 'content'])
      onOpenShelf(series.get('contentType'), series.get('id'), legacyContentType)
    }
  }
  getLabel = (series) => {
    const { staticText } = this.props
    const isNew = series.get('isNew')
    const featuredType = series.get('featuredTileType')
    const featuredLabel = series.get('featuredTileLabel')

    if (featuredType === 'merchandising-campaign') {
      return featuredLabel
    }

    return isNew ? staticText.get('newSeries') : null
  }

  getIconClasses = () => {
    const { props } = this
    const { page } = props

    if (page.get('isTouch')) {
      iconClassNames.push('tile-hover-series__shelf-icon--touch-wrapper')
    }
    return iconClassNames.join(' ')
  }

  trackImpressions = () => {
    const {
      auth,
      setEventSeriesImpressed,
      app,
      page,
      language,
      index,
      id,
      impressed,
      upstreamContext,
    } = this.props

    if (!id || impressed) {
      return null
    }

    const updatedContext = upstreamContext.merge({
      itemIndex: index,
      contentId: id,
      contentType: 'series',
    })

    setEventSeriesImpressed({
      auth,
      location,
      page,
      app,
      upstreamContext: updatedContext,
      language,
    })

    this.setState({ upstreamContext: updatedContext })
    return null
  }

  handleMouseEnter = () => {
    this.setState(() => ({ metaHovered: true }))
  }

  handleMouseLeave = () => {
    this.setState(() => ({ metaHovered: false }))
  }

  handleTileClick = (e) => {
    const { anyShelfOpened, adminTitle, id, series,
      setDefaultGaEvent, hiddenContentInfo } = this.props
    const eventData = CUSTOM_ROW_CLICK_EVENT
      .set('eventAction', 'Click Tile')
      .set('eventLabel', adminTitle)
      .set('contentInfo', `${series.get('title')} | series | ${id}`)
    setDefaultGaEvent(eventData)
    if (anyShelfOpened && !hiddenContentInfo) {
      return this.onClickShelf(e)
    }
    return null
  }

  handleUnhide = () => {
    const { props } = this
    const { hiddenContentInfo, unhideContent, setDefaultGaEvent, series } = props
    const eventData = HIDDEN_CONTENT_UNHIDE_EVENT
      .set('eventLabel', series.get('title'))
    setDefaultGaEvent(eventData)
    unhideContent({ id: hiddenContentInfo.get('id'), contentId: hiddenContentInfo.get('contentId') })
  }

  renderLabel = () => {
    const { getLabel, props } = this
    const { series } = props
    const label = getLabel(series)

    if (label) {
      return <span className="'tile-hover-series__label'">{label}</span>
    }
    return null
  }

  renderOpenShelfIcon = (touch) => {
    const { state, props, onClickShelf } = this
    const { metaHovered } = state
    const {
      onOpenShelf,
    } = props

    if (!onOpenShelf) {
      return null
    }

    if (metaHovered) {
      shelfIconClassNames.push('tile-hover-series__card--hovered')
    }
    if (touch) {
      return <span className="tile-hover-series__shelf-icon--touch" onClick={onClickShelf} />
    }
    return <Icon iconClass={shelfIconClassNames} onClick={onClickShelf} />
  }

  render () {
    const {
      props,
      renderLabel,
      handleTileClick,
      renderOpenShelfIcon,
      handleMouseEnter,
      handleMouseLeave,
      onClickShelf,
      handleUnhide,
      onClickHide,
    } = this

    const {
      hasData,
      series,
      id,
      vertical,
      shelfOpened,
      anyShelfOpened,
      hovered,
      hideShelf,
      hiddenContentInfo,
      upstreamContext,
      auth,
      showHideContentButton,
    } = props

    if (!hasData) {
      return <div className="tile-hover-series__placeholder" />
    }

    const seriesId = series.get('id')
    if (!seriesId) {
      return (
        <div className="tile-hover-series__placeholder tile-hover-series__placeholder--error">
          Series {id} unavailable
        </div>
      )
    }

    const image = vertical ? series.get('verticalImage') : series.get('imageWithText')
    const iconClasses = this.getIconClasses()

    if (shelfOpened) classNames.push('tile-hover-series--shelf-opened')

    return (
      <div className={classNames.join(' ')} onClick={handleTileClick} >
        <div className="tile-hover-series__wrapper">
          {!anyShelfOpened ?
            <Link className="tile-hover-series__link" key={id} to={series.get('url', '')}>
              {renderLabel()}
              <img
                src={image}
                alt={series.get('title')}
                className="tile-hover-series__image"
              />
            </Link>
            :
            <Link className="tile-hover-series__link" key={id} to={URL_JAVASCRIPT_VOID} onClick={handleTileClick}>
              <img
                src={image}
                alt={series.get('title')}
                className="tile-hover-series__image"
              />
            </Link>
          }
          <div className={iconClasses}>
            {this.renderOpenShelfIcon(true)}
          </div>
        </div>
        <TestarossaSwitch>
          <TestarossaCase campaign="ME-3043" variation={[1]}>
            <TileHoverSeriesMetaTest
              renderOpenShelfIcon={renderOpenShelfIcon}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              onClickShelf={onClickShelf}
              series={series}
              hovered={hovered}
              anyShelfOpened={anyShelfOpened}
              hideShelf={hideShelf}
              vertical={vertical}
              upstreamContext={upstreamContext}
              auth={auth}
              onClickHide={onClickHide}
              showHideContentButton={showHideContentButton}
            />
          </TestarossaCase>
          <TestarossaDefault unwrap>
            <TileHoverSeriesMeta
              renderOpenShelfIcon={renderOpenShelfIcon}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              onClickShelf={onClickShelf}
              series={series}
              hovered={hovered}
              anyShelfOpened={anyShelfOpened}
              hideShelf={hideShelf}
              vertical={vertical}
              upstreamContext={upstreamContext}
              auth={auth}
            />
          </TestarossaDefault>
        </TestarossaSwitch>
        {hiddenContentInfo &&
        <RemovedContentOverlay
          title={series.get('title')}
          undoHideContentHandler={handleUnhide}
        />
        }
      </div>
    )
  }
}

TileHoverSeries.propTypes = {
  upstreamContext: ImmutablePropTypes.map,
  id: PropTypes.number.isRequired,
  location: PropTypes.object,
  shelfOpened: PropTypes.bool,
  vertical: PropTypes.bool,
  adminTitle: PropTypes.string,
  showHideContentButton: PropTypes.bool,
}

export default compose(
  connectRedux(
    (state, props) => {
      const { id } = props
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const seriesStore = state.series.getIn([Number(id), language], Map())
      const hiddenContentList = state.hiddenContentPreferences.getIn(['content'])
      const hiddenContentInfo = hiddenContentList && hiddenContentList.find(content => content.get('contentId') === id)
      return {
        hasData: seriesStore.has('data'),
        processing: seriesStore.get('processing', false),
        impressed: seriesStore.get('impressed'),
        series: seriesStore.get('data', Map()),
        auth: state.auth,
        app: state.app,
        page: state.page,
        staticText: state.staticText.getIn(['data', 'tile', 'data']),
        language: state.user.getIn(['data', 'language'], Map()),
        url: seriesStore.get('url'),
        hiddenContentInfo,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        fetchNodes: actions.node.getNodes,
        getPmScreen: actions.pmScreen.getPmScreen,
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
        setEventSeriesImpressed: actions.eventTracking.setEventSeriesImpressed,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
        unhideContent: actions.hiddenContentPreferences.unhideContent,
        hideContent: actions.hiddenContentPreferences.hideContent,
      }
    },
  ),
)(TileHoverSeries)
