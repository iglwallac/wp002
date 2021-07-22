import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { List, Map } from 'immutable'
import VisibilitySensor from 'react-visibility-sensor'
import {
  createUpstreamContext,
  SCREEN_TYPE_MEMBER_HOME,
  updateUpstreamContext,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import Row from 'components/Row.v2'
import { getBoundActions } from 'actions'
import { MAX_ROW_ITEMS, itemsHaveData, sendCustomRowImpressionGAEvent } from 'services/pm-section'
import { H4 } from 'components/Heading'
import TileHoverVideo from '../TileHover/TileHoverVideo'

const CONTEXT_TYPE_FEATURED_VIDEOS_LIST = 'pm/featured-videos-list'
const HEADER_LABEL_FEATURED_VIDEOS = 'popular'

class SectionFeaturedVideos extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
    } = props

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_FEATURED_VIDEOS_LIST,
      sectionId,
      sectionIndex,
      headerLabel: HEADER_LABEL_FEATURED_VIDEOS,
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
      termsStore,
      language,
      featuredVideosItems,
    } = props
    if (isVisible && hasChildData) {
      const unsetIndexes = visibleIndexes.filter(index => !sentIndexes.includes(index))
      if (unsetIndexes.length) {
        sendCustomRowImpressionGAEvent(setDefaultGaEvent, unsetIndexes,
          featuredVideosItems, adminTitle, language, videoStore, seriesStore, termsStore)
        unsetIndexes.forEach(index => sentIndexes.push(index))
      }
    }
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

    const videoId = Number(item.get('contentId'))

    return (
      <TileHoverVideo
        id={videoId}
        index={index}
        location={location}
        hovered={focused}
        onOpenShelf={openShelf}
        anyShelfOpened={shelfOpened}
        shelfOpened={itemShelfIsOpen}
        upstreamContext={upstreamContext}
        hideShelf={hideShelf}
        adminTitle={adminTitle}
        showHideContentButton={showHideContentButton}
      />
    )
  }

  renderItems = () => {
    const { props, renderItem, state } = this
    const { upstreamContext, visibilitySensorEnabled } = state
    const {
      hasData,
      hasChildData,
      featuredVideosItems,
      shelfOpened,
      handleOpenShelf,
      closeShelf,
      clearOpenShelfIndex,
      adminTitle,
      showHideContentButton,
    } = props

    let items = featuredVideosItems.slice(0, MAX_ROW_ITEMS)

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
          createAccessor={() => null}
          upstreamContext={updateUpstreamContext(
            upstreamContext,
            CONTEXT_NAME_ADMIN_TITLE,
            adminTitle,
          )}
          onRenderContent={this.onRenderContent}
          clearOpenShelfIndex={clearOpenShelfIndex}
          showHideContentButton={showHideContentButton}
        >{(item, data, index, hovered) => renderItem(item, data, index, hovered)}
        </Row>
      </VisibilitySensor>
    )
  }

  render () {
    const {
      renderItems,
      props,
    } = this

    const {
      staticText,
      hasData,
      featuredVideosItems,
    } = props

    // We expect this section to have items, so we want to render until we have data (and no items)
    if (hasData && !featuredVideosItems.size) {
      // List is empty
      return null
    }

    return (
      <div className="section-featured-videos">
        <div className="section-featured-videos__wrapper">
          <H4 className="section-featured-videos__title">{staticText.get('sectionTitle')}</H4>
          <div
            className="section-featured-videos__items"
            onMouseLeave={this.handleMouseLeave}
            onMouseEnter={this.handleMouseEnter}
          >
            {renderItems()}
          </div>
        </div>
      </div>
    )
  }
}

export default compose(
  connectRedux(
    (state, ownProps) => {
      const { sectionId } = ownProps
      const section = state.pmSection.get(sectionId)
      const tabs = state.pmSection.getIn([sectionId, 'data', 'data', 'tabs'], List())
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const featuredVideosItems = tabs.getIn([0, 'tabContent'], List())
      const hasChildData = itemsHaveData(featuredVideosItems.slice(0, MAX_ROW_ITEMS),
        state.videos, state.series, language)
      return {
        staticText: state.staticText.getIn(['data', 'sectionFeaturedVideos', 'data'], Map()),
        hasData: section.has('data'),
        adminTitle: section.getIn(['data', 'adminTitle']),
        sectionId,
        language,
        processing: section.get('processing', false),
        featuredVideosItems,
        hasChildData,
        videoStore: hasChildData && state.videos,
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
)(SectionFeaturedVideos)
