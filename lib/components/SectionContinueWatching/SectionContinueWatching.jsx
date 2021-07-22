import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { List, Map } from 'immutable'
import VisibilitySensor from 'react-visibility-sensor'
import Link from 'components/Link'
import Icon from 'components/Icon'
import SliderBar from 'components/SliderBar/SliderBar'
import { getBoundActions } from 'actions'
import {
  createUpstreamContext,
  upstreamContextOnClick,
  SCREEN_TYPE_MEMBER_HOME,
  updateUpstreamContext,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import { MAX_ROW_ITEMS, itemsHaveData, sendCustomRowImpressionGAEvent } from 'services/pm-section'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import Row, { STYLES } from 'components/Row.v2'
import WatchHistoryEditTooltip from 'components/WatchHistoryEditTooltip'
import { H4 } from 'components/Heading'
import { get as getConfig } from 'config'
import { URL_PLAYLIST_WATCH_HISTORY } from 'services/url/constants'
import TileHoverVideo from '../TileHover/TileHoverVideo'

const CONTEXT_TYPE_CONTINUE_WATCHING_LIST = 'pm/continue-watching-list'
const CONTEXT_TYPE_CONTINUE_WATCHING_SECTION = 'pm/continue-watching-section'
const HEADER_LABEL_CONTINUE_WATCHING = 'continue watching'
export const COMPLETE = 'complete'
export const INCOMPLETE = 'incomplete'

const config = getConfig()

class SectionContinueWatching extends React.Component {
  static getDerivedStateFromProps (props, state) {
    if (props.defaultTab !== state.defaultTab) {
      return {
        activeTab: props.defaultTab,
        defaultTab: props.defaultTab,
      }
    }
    return null
  }

  constructor (props) {
    super(props)
    const {
      defaultTab,
      sectionId,
      sectionIndex,
      tabs,
    } = props
    const defaultFilter = tabs.getIn([0, 'event', 'filter'])
    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_CONTINUE_WATCHING_LIST,
      sectionId,
      sectionIndex,
      filters: { watched: defaultFilter || INCOMPLETE },
      headerLabel: HEADER_LABEL_CONTINUE_WATCHING,
    })
    this.isVisible = false
    this.visibleIndexes = []
    this.sentIndexes = {}
    this.state = {
      activeTab: defaultTab,
      upstreamContext,
      visibilitySensorEnabled: false,
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

  setEventViewAll = () => {
    const { state, props } = this
    const { upstreamContext } = state
    const { setUpstreamContext } = props
    const updatedContext = upstreamContext.set('contextType', CONTEXT_TYPE_CONTINUE_WATCHING_SECTION)

    upstreamContextOnClick(null, { upstreamContext: updatedContext, setUpstreamContext })
  }

  activeTabHasData = () => {
    const { props, state } = this
    const { activeTab } = state
    const {
      tabs,
      language,
      videoStore,
    } = props
    const activeTabItem = tabs.find(tab => tab.get('tabLabel') === activeTab)
    const items = activeTabItem ? activeTabItem.get('tabContent', List()) : List()
    return itemsHaveData(items.slice(0, MAX_ROW_ITEMS), videoStore, null, language)
  }

  checkAndSendImpressionGAEvent = () => {
    const { isVisible, visibleIndexes, sentIndexes, props, state } = this
    const { activeTab } = state
    const {
      setDefaultGaEvent,
      adminTitle,
      videoStore,
      seriesStore,
      termsStore,
      language,
      tabs,
    } = props
    sentIndexes[activeTab] = sentIndexes[activeTab] || []
    if (isVisible && this.activeTabHasData()) {
      const unsetIndexes = visibleIndexes.filter(index => !sentIndexes[activeTab].includes(index))
      if (unsetIndexes.length) {
        const activeTabItem = tabs.find(tab => tab.get('tabLabel') === activeTab)
        const items = activeTabItem ? activeTabItem.get('tabContent', List()) : List()
        sendCustomRowImpressionGAEvent(setDefaultGaEvent, unsetIndexes,
          items, adminTitle, language, videoStore, seriesStore, termsStore)
        unsetIndexes.forEach(index => sentIndexes[activeTab].push(index))
      }
    }
  }

  changeTab = (e, index, item) => {
    e.preventDefault()
    const { state, props } = this
    const { tabs } = props
    const { upstreamContext } = state
    const filter = tabs.getIn([index, 'event', 'filter'])
    const filtersContext = upstreamContext.set('filters', { watched: filter })

    this.setState({
      activeTab: item.value,
      upstreamContext: filtersContext,
    })
    return null
  }

  renderItem = (item, params) => {
    const { props, state } = this
    const { openShelf, focused, index, itemShelfIsOpen, hideShelf } = params
    const { upstreamContext } = state
    const {
      location,
      shelfOpened,
      adminTitle,
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
        disableRemovedContentOverlay
      />
    )
  }

  renderItems = () => {
    const { props, state, renderItem } = this
    const { activeTab, upstreamContext, visibilitySensorEnabled } = state
    const {
      hasData,
      hasChildData,
      shelfOpened,
      handleOpenShelf,
      closeShelf,
      clearOpenShelfIndex,
      tabs,
      adminTitle,
    } = props

    const activeTabItem = tabs.find(tab => tab.get('tabLabel') === activeTab)
    let items = activeTabItem ? activeTabItem.get('tabContent', List()) : List()
    // Override activeTab if a list is empty
    if (items.size === 0) {
      const nonZeroTab = tabs.find(tab => tab.get('tabContent', List()).size !== 0) || List()
      items = nonZeroTab && nonZeroTab.get('tabContent')
    }

    items = items.slice(0, MAX_ROW_ITEMS)

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
          style={STYLES.S12345}
          onRenderContent={this.onRenderContent}
        >
          {(item, data) => renderItem(item, data)}
        </Row>
      </VisibilitySensor >
    )
  }

  renderTabs = () => {
    const {
      props,
      state,
      changeTab,
    } = this
    const { tabs, someEmpty } = props

    // Don't render tabs if either list is empty
    if (someEmpty) {
      return null
    }

    const items = tabs.map((tab) => {
      const tabName = tab.get('tabLabel')
      return {
        label: tabName,
        value: tabName,
      }
    })

    return (
      <SliderBar className="section-continue-watching__tabs" items={items} onclick={changeTab} initValue={state.activeTab} />
    )
  }

  render () {
    const {
      props,
      renderTabs,
      renderItems,
      setEventViewAll,
    } = this
    const {
      staticText,
      hasData,
      processing,
      everyEmpty,
    } = props

    // We expect this section to have items, so we want to render until we have data (and no items)
    if (hasData && everyEmpty) {
      // All lists are empty
      return null
    }

    const viewWatchHistoryTooltip = classNames => (
      <TestarossaSwitch>
        <TestarossaCase campaign="ME-3043" variation={1} unwrap>
          {(campaign, variation, subject) => (
            <WatchHistoryEditTooltip
              classNames={classNames}
              campaign={campaign}
              subject={subject}
              variation={variation}
            />
          )}
        </TestarossaCase>
        <TestarossaDefault unwrap>
          {() => (
            null
          )}
        </TestarossaDefault>
      </TestarossaSwitch>
    )

    const titleClasses = ['section-continue-watching__title']
    if (hasData && processing) {
      titleClasses.push('section-continue-watching__title--refreshing')
    }
    const refreshIcon = <Icon iconClass={['icon--clock']} />
    const chevronIcon = <Icon iconClass={['icon--right', 'member-home-v2__icon-right']} />

    const url = config.features.multiplePlaylists
      ? URL_PLAYLIST_WATCH_HISTORY
      : '/watch-history'

    return (
      <div
        className="section-continue-watching"
      >
        <div className="section-continue-watching__background" />
        <div className="section-continue-watching__wrapper">
          {viewWatchHistoryTooltip(['watch-history-edit-tooltip', 'watch-history-edit-tooltip--view'])}
          <Link to={url} onClick={setEventViewAll} className="section-continue-watching__view">{staticText.get('viewAllLinkText')} {chevronIcon}</Link>
          <H4 className={titleClasses.join(' ')}>{staticText.get('sectionTitle')}{refreshIcon}</H4>
          {renderTabs()}
          <div
            className="section-continue-watching__row"
            // onMouseLeave={this.handleMouseLeave}
            // onMouseEnter={this.handleMouseEnter}
          >
            {renderItems()}
          </div>
          {viewWatchHistoryTooltip(['watch-history-edit-tooltip', 'watch-history-edit-tooltip--view-mobile'])}
          <Link to={url} onClick={setEventViewAll} className="section-continue-watching__view-mobile">{staticText.get('viewAllLinkText')} {chevronIcon}</Link>
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
      const defaultTab = tabs.getIn([0, 'tabLabel'])
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const hasChildData = Boolean(tabs.find(tab => itemsHaveData(tab.get('tabContent').slice(0, MAX_ROW_ITEMS), state.videos, state.series, language)))
      const someEmpty = tabs.size === 0 || tabs.some(tab => tab.get('tabContent', List()).size === 0)
      const everyEmpty = tabs.size === 0 || tabs.every(tab => tab.get('tabContent', List()).size === 0)

      return {
        staticText: state.staticText.getIn(['data', 'sectionContinueWatching', 'data'], Map()),
        hasData: section && section.has('data'),
        processing: state.pmSection.getIn([sectionId, 'processing'], false),
        hasChildData,
        adminTitle: section.getIn(['data', 'adminTitle']),
        someEmpty,
        everyEmpty,
        tabs,
        sectionId,
        defaultTab,
        language,
        videoStore: hasChildData && state.videos,
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
)(SectionContinueWatching)
