import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { List, Map } from 'immutable'
import Link from 'components/Link'
import Icon from 'components/Icon'
import {
  createUpstreamContext,
  upstreamContextOnClick,
  SCREEN_TYPE_MEMBER_HOME,
  updateUpstreamContext,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import { getBoundActions } from 'actions'
import VisibilitySensor from 'react-visibility-sensor'
import { MAX_ROW_ITEMS, itemsHaveData, sendCustomRowImpressionGAEvent } from 'services/pm-section'
import Row, { STYLES } from 'components/Row.v2'
import { H4 } from 'components/Heading'
import TileHoverVideo from '../TileHover/TileHoverVideo'

const CONTEXT_TYPE_RECENTLY_ADDED_LIST = 'pm/my-recently-added-list'
const CONTEXT_TYPE_RECENTLY_ADDED_SECTION = 'pm/my-recently-added-section'
const HEADER_LABEL_RECENTLY_ADDED = 'recently added'
class SectionRecentlyAdded extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
    } = props

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_RECENTLY_ADDED_LIST,
      sectionId,
      sectionIndex,
      headerLabel: HEADER_LABEL_RECENTLY_ADDED,
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
      recentlyAddedItems,
    } = props
    if (isVisible && hasChildData) {
      const unsetIndexes = visibleIndexes.filter(index => !sentIndexes.includes(index))
      if (unsetIndexes.length) {
        sendCustomRowImpressionGAEvent(setDefaultGaEvent, unsetIndexes,
          recentlyAddedItems, adminTitle, language, videoStore, seriesStore)
        unsetIndexes.forEach(index => sentIndexes.push(index))
      }
    }
  }
  handleViewAllClick = () => {
    const { state, props } = this
    const { upstreamContext } = state
    const { setUpstreamContext } = props
    const updatedContext = upstreamContext.set('contextType', CONTEXT_TYPE_RECENTLY_ADDED_SECTION)

    upstreamContextOnClick(null, { upstreamContext: updatedContext, setUpstreamContext })
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
      recentlyAddedItems,
      shelfOpened,
      handleOpenShelf,
      closeShelf,
      clearOpenShelfIndex,
      adminTitle,
      showHideContentButton,
    } = props

    let items = recentlyAddedItems.slice(0, MAX_ROW_ITEMS)

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
          createAccessor={() => null}
          clearOpenShelfIndex={clearOpenShelfIndex}
          onRenderContent={this.onRenderContent}
          style={STYLES.S123}
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
      handleViewAllClick,
    } = this

    const {
      staticText,
      hasData,
      recentlyAddedItems,
    } = props

    const chevronIcon = <Icon iconClass={['icon--right', 'member-home-v2__icon-right']} />

    // We expect this section to have items, so we want to render until we have data (and no items)
    if (hasData && !recentlyAddedItems.size) {
      // List is empty
      return null
    }

    // Don't render section if there are less than 2 titles
    // TODO: remove this once section visibility rules have been added to API
    if (recentlyAddedItems.size < 2) {
      return null
    }

    return (
      <div className="section-recently-added">
        <div className="section-recently-added__background" />
        <div className="section-recently-added__wrapper">
          <Link to="/recently-added" className="section-recently-added__view" onClick={handleViewAllClick}>{staticText.get('viewAllLinkText')} {chevronIcon}</Link>
          <H4 inverted className="section-recently-added__title">{staticText.get('sectionTitle')}</H4>
          <div
            className="section-recently-added__items"
            onMouseLeave={this.handleMouseLeave}
            onMouseEnter={this.handleMouseEnter}
          >
            {renderItems()}
          </div>
          <Link to="/recently-added" className="section-recently-added__view-mobile" onClick={handleViewAllClick}>{staticText.get('viewAllLinkText')} {chevronIcon}</Link>
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
      const recentlyAddedItems = tabs.getIn([0, 'tabContent'], List())

      const hasChildData = itemsHaveData(recentlyAddedItems.slice(0, MAX_ROW_ITEMS),
        state.videos, state.series, language)
      return {
        staticText: state.staticText.getIn(['data', 'sectionRecentlyAdded', 'data'], Map()),
        hasData: section.has('data'),
        sectionId,
        processing: section.get('processing', false),
        recentlyAddedItems,
        adminTitle: section.getIn(['data', 'adminTitle']),
        language,
        hasChildData,
        videoStore: hasChildData && state.videos,
        seriesStore: hasChildData && state.series,
        showHideContentButton: section.getIn(['data', 'data', 'enableUserHiddenContent']),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(SectionRecentlyAdded)
