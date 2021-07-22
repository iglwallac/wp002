import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { List, Map } from 'immutable'
import VisibilitySensor from 'react-visibility-sensor'
import Link from 'components/Link'
import Icon from 'components/Icon'
import {
  createUpstreamContext,
  SCREEN_TYPE_MEMBER_HOME,
  updateUpstreamContext,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import { getBoundActions } from 'actions'
import { MAX_ROW_ITEMS, itemsHaveData, sendCustomRowImpressionGAEvent } from 'services/pm-section'
import Row, { STYLES } from 'components/Row.v2'
import TileHoverSeries from '../TileHover/TileHoverSeries'

const CONTEXT_TYPE_MY_SERIES_LIST = 'pm/recommended-series-list'
const HEADER_LABEL_RECOMMENDED_SERIES = 'recommended series'

class SectionrecommendedSeries extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
    } = props

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_MY_SERIES_LIST,
      sectionId,
      sectionIndex,
      headerLabel: HEADER_LABEL_RECOMMENDED_SERIES,
    })
    this.isVisible = false
    this.visibleIndexes = []
    this.sentIndexes = []
    this.state = {
      visibilitySensorEnabled: false,
      upstreamContext,
    }
  }

  componentDidMount () {
    // https://stackoverflow.com/questions/35850118/setting-state-on-componentdidmount
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(state => ({ ...state, visibilitySensorEnabled: true }))
  }

  onRenderContent = (indexes) => {
    this.visibleIndexes = indexes
    this.checkAndSendImpressionGAEvent()
  }

  onVisibilityChange = (isVisible) => {
    this.isVisible = isVisible
    this.checkAndSendImpressionGAEvent()
  }

  checkAndSendImpressionGAEvent = () => {
    const { isVisible, visibleIndexes, sentIndexes, props } = this
    const { hasChildData,
      setDefaultGaEvent,
      adminTitle,
      videoStore,
      seriesStore,
      language,
      recommendedSeriesContent,
    } = props
    if (isVisible && hasChildData) {
      const unsetIndexes = visibleIndexes.filter(index => !sentIndexes.includes(index))
      if (unsetIndexes.length) {
        sendCustomRowImpressionGAEvent(setDefaultGaEvent, unsetIndexes,
          recommendedSeriesContent, adminTitle, language, videoStore, seriesStore)
        unsetIndexes.forEach(index => sentIndexes.push(index))
      }
    }
  }

  handleViewAllClick = () => {
    // save for GA events
  }

  renderItems = () => {
    const { props, renderItem, state } = this
    const { upstreamContext, visibilitySensorEnabled } = state
    const {
      clearOpenShelfIndex,
      hasData,
      hasChildData,
      recommendedSeriesContent,
      shelfOpened,
      handleOpenShelf,
      closeShelf,
      adminTitle,
      showHideContentButton,
    } = props

    let items = recommendedSeriesContent.slice(0, MAX_ROW_ITEMS)
    // Render placeholders when section data or child data is missing
    if (!hasData || !hasChildData) {
      // Use List of empty Maps to render placeholders
      items = List(new Array(MAX_ROW_ITEMS).fill(Map()))
    }

    return (
      <VisibilitySensor
        active={hasChildData && visibilitySensorEnabled}
        onChange={this.onVisibilityChange}
      >
        <Row
          items={items}
          shelfOpened={shelfOpened}
          onOpenShelf={handleOpenShelf}
          closeShelf={closeShelf}
          upstreamContext={updateUpstreamContext(
            upstreamContext,
            CONTEXT_NAME_ADMIN_TITLE,
            adminTitle,
          )}
          onRenderContent={this.onRenderContent}
          createAccessor={() => null}
          clearOpenShelfIndex={clearOpenShelfIndex}
          style={STYLES.S12345}
          showHideContentButton={showHideContentButton}
        >{(item, data) => renderItem(item, data)}
        </Row>
      </VisibilitySensor>
    )
  }

  renderItem = (item, params) => {
    const { props, state } = this
    const { openShelf, focused, index, itemShelfIsOpen, hideShelf } = params
    const { upstreamContext } = state
    const {
      location,
      shelfOpened,
      adminTitle,
      showHideContentButton,
    } = props

    const seriesId = Number(item.get('contentId'))
    const source = item.get('pineSource')
    const score = item.get('pineScore')
    const videoTasteSegment = item.get('videoTasteSegment')
    // todo pass controls visible into here
    return (
      <TileHoverSeries
        id={seriesId}
        index={index}
        location={location}
        onOpenShelf={openShelf}
        anyShelfOpened={shelfOpened}
        shelfOpened={itemShelfIsOpen}
        vertical
        upstreamContext={upstreamContext}
        hovered={focused}
        hideShelf={hideShelf}
        source={source}
        score={score}
        videoTasteSegment={videoTasteSegment}
        adminTitle={adminTitle}
        showHideContentButton={showHideContentButton}
      />
    )
  }

  render () {
    const {
      renderItems,
      props,
      handleViewAllClick,
    } = this
    const { staticText, hasData, processing, recommendedSeriesContent } = props

    // We expect this section to have items, so we want to render until we have data (and no items)
    if (hasData && !recommendedSeriesContent.size) {
      // List is empty
      return null
    }
    const titleClasses = ['section-recommended-series__title']
    if (hasData && processing) {
      titleClasses.push('section-recommended-series__title--refreshing')
    }
    const refreshIcon = <Icon iconClass={['icon--clock']} />
    const chevronIcon = <Icon iconClass={['icon--right', 'member-home-v2__icon-right']} />

    return (
      <div className="section-recommended-series">
        <div className="section-recommended-series__wrapper">
          <div className={titleClasses.join(' ')}>{staticText.get('sectionTitle')}{refreshIcon}</div>
          <div className="section-recommended-series__items">{renderItems()}</div>
          <Link to="/seeking-truth/original-programs" className="section-recommended-series__view-mobile" onClick={handleViewAllClick}>
            {staticText.get('viewAllLinkText')} {chevronIcon}
          </Link>
        </div>
      </div>
    )
  }
}

export default compose(
  connectRedux(
    (state, props) => {
      const { sectionId } = props
      // Get section
      const sectionStore = state.pmSection.get(sectionId, Map())
      const section = state.pmSection.get(sectionId)
      const tabs = state.pmSection.getIn([sectionId, 'data', 'data', 'tabs'], List())
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const recommendedSeriesContent = tabs.getIn([0, 'tabContent'], List())
      const hasChildData = itemsHaveData(recommendedSeriesContent.slice(0, MAX_ROW_ITEMS),
        state.videos, state.series, language)
      return {
        staticText: state.staticText.getIn(['data', 'sectionRecommendedSeries', 'data'], Map()),
        auth: state.auth,
        hasData: sectionStore.has('data'),
        processing: sectionStore.get('processing', false),
        recommendedSeriesContent,
        hasChildData,
        language,
        adminTitle: section.getIn(['data', 'adminTitle']),
        seriesStore: hasChildData && state.series,
        showHideContentButton: section.getIn(['data', 'data', 'enableUserHiddenContent']),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(SectionrecommendedSeries)
