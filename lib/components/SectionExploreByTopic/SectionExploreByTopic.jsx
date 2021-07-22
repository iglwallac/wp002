import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import VisibilitySensor from 'react-visibility-sensor'
import { List, Map } from 'immutable'
import Link from 'components/Link'
import SliderBar from 'components/SliderBar/SliderBar'
import Icon from 'components/Icon'
import {
  createUpstreamContext,
  SCREEN_TYPE_MEMBER_HOME,
  updateUpstreamContext,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import { getBoundActions } from 'actions'
import { CUSTOM_ROW_IMPRESSION_EVENT } from 'services/event-tracking'
import Row, { STYLES } from 'components/Row.v2'
import { itemsHaveData } from 'services/pm-section'
import TileHoverVideo from 'components/TileHover/TileHoverVideo'
import TileHoverSeries from 'components/TileHover/TileHoverSeries'
import { H2 } from 'components/Heading'

const CONTEXT_TYPE_EXPLORE_BY_TOPIC_LIST = 'pm/explore-by-topic-list'
const HEADER_LABEL_EXPLORE_BY_TOPIC = 'explore by topic'
class SectionExploreByTopic extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
    } = props

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_EXPLORE_BY_TOPIC_LIST,
      sectionId,
      sectionIndex,
      headerLabel: HEADER_LABEL_EXPLORE_BY_TOPIC,
    })

    let width
    if (process.env.BROWSER) {
      width = window.innerWidth
    }

    this.isVisible = false
    this.sentTabs = {}
    this.state = {
      upstreamContext,
      activeTab: 0,
      internalOpenShelfIndex: 0,
      hoverActive: null,
      width,
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

  setEventScrolled = () => {
    // save for GA events
  }

  // eslint-disable-next-line no-unused-vars
  setEventTabClicked = (tabIndex, topic) => {
    // save for GA events
  }

  setEventViewAll = () => {
    // save for GA events
  }

  activeTabHasData = () => {
    const { props, state } = this
    const { activeTab } = state
    const {
      tabs,
      language,
      videoStore,
      seriesStore,
    } = props
    const activeTabItem = tabs.find(tab => tab.get('tabLabel') === activeTab)
    const items = activeTabItem ? activeTabItem.get('tabContent', List()) : List()
    return itemsHaveData(items, videoStore, seriesStore, language)
  }

  checkAndSendImpressionGAEvent = () => {
    const { isVisible, sentTabs, props, state } = this
    const { activeTab } = state
    const { hasChildData,
      setDefaultGaEvent,
      adminTitle,
    } = props
    if (isVisible && hasChildData) {
      if (!sentTabs[activeTab]) {
        const eventData = CUSTOM_ROW_IMPRESSION_EVENT
          .set('eventLabel', adminTitle)
        setDefaultGaEvent(eventData)
        sentTabs[activeTab] = true
      }
    }
  }

  changeTab = (e, index, item) => {
    e.preventDefault()
    this.setState({ activeTab: index })
    this.setEventTabClicked(index, item.topic)
  }

  handleMouseEvent = (row, enter) => {
    if (enter) {
      this.setState({
        hoverActive: row,
        [`${row}RowZIndex`]: 1,
      })
    } else {
      this.setState({
        hoverActive: false,
        [`${row}RowZIndex`]: 0,
      })
    }
  }

  renderItem = (item, params) => {
    const { openShelf, focused, index, itemShelfIsOpen, hideShelf } = params
    const { props, state } = this
    const {
      location,
      shelfOpened,
      adminTitle,
      showHideContentButton,
    } = props
    const { upstreamContext } = state
    const type = item.get('contentType', 'video') // default to placeholder video
    const id = Number(item.get('contentId'))
    // const source = item.get('source')
    // const score = item.get('score')
    // TODO use type constant
    if (type === 'video') {
      return (
        <TileHoverVideo
          id={id}
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

    // TODO use type constant
    if (type === 'series') {
      return (
        <TileHoverSeries
          id={id}
          index={index}
          location={location}
          onOpenShelf={openShelf}
          anyShelfOpened={shelfOpened}
          shelfOpened={itemShelfIsOpen}
          upstreamContext={upstreamContext}
          hovered={focused}
          hideShelf={hideShelf}
          adminTitle={adminTitle}
          showHideContentButton={showHideContentButton}
        />
      )
    }

    return null
  }

  renderTopicControls = () => {
    const {
      props,
      changeTab,
      setEventScrolled,
    } = this

    const { topicsList } = props
    const availTopics = topicsList.map((topic) => {
      const label = topic.get('termName')
      // Don't render tab if list data is missing
      if (!topic.get('tabContent').size) {
        return null
      }
      return { label, value: label, topic }
    })

    return (
      <SliderBar className="section-topics__topics" items={availTopics} onclick={changeTab} onscroll={setEventScrolled} />
    )
  }

  renderContent = () => {
    const { props, state, renderItem, handleMouseEvent } = this
    const {
      activeTab,
      internalOpenShelfIndex,
      hoverActive,
      upstreamContext,
      upperRowZIndex,
      lowerRowZIndex,
      width,
      visibilitySensorEnabled,
    } = state
    const {
      hasData,
      hasChildData,
      topicsList,
      shelfOpened,
      handleOpenShelf,
      clearOpenShelfIndex,
      adminTitle,
      showHideContentButton,
    } = props

    const maxItems = 9

    const allItems = topicsList.getIn([activeTab, 'tabContent'], List())
    let items = allItems.slice(0, maxItems)
    let secondItems = topicsList.getIn([activeTab, 'tabContent'], List()).slice(2, 9)
    if (width > 1440) {
      secondItems = topicsList.getIn([activeTab, 'tabContent'], List()).slice(3, 9)
    }

    // Render placeholders when section data or child data is missing
    if (!hasData || !hasChildData) {
      // Use List of empty Maps to render placeholders
      items = List(new Array(maxItems).fill(Map()))
      secondItems = List(new Array(maxItems - 2).fill(Map()))
    }

    const classNames = ['section-topics__rows']
    if (hoverActive) {
      classNames.push(`section-topics__rows--hovered-${hoverActive}`)
    }

    const shelf0Opened = shelfOpened && internalOpenShelfIndex === 0
    const openShelf0 = () => {
      this.setState({ internalOpenShelfIndex: 0 })
    }

    const shelf1Opened = shelfOpened && internalOpenShelfIndex === 1
    const openShelf1 = () => {
      this.setState({ internalOpenShelfIndex: 1 })
    }

    return (
      <VisibilitySensor
        active={hasChildData && visibilitySensorEnabled}
        onChange={this.onVisibilityChange}
      >
        <div className={classNames.join(' ')}>
          <div
            className={`section-topics__top-row section-topics__top-row--${upperRowZIndex}`}
            onMouseLeave={() => handleMouseEvent('upper', false)}
            onMouseEnter={() => handleMouseEvent('upper', true)}
          >
            <Row
              static
              items={items}
              shelfOpened={shelf0Opened}
              onOpenShelf={handleOpenShelf}
              shelfModifier={openShelf0}
              staticRow
              upstreamContext={updateUpstreamContext(
                upstreamContext,
                CONTEXT_NAME_ADMIN_TITLE,
                adminTitle,
              )}
              clearOpenShelfIndex={clearOpenShelfIndex}
              style={STYLES.TOPICS_LARGE}
              createAccessor={() => null}
              showHideContentButton={showHideContentButton}
            >{(item, data) => renderItem(item, data)}
            </Row>
          </div>
          <div
            className={`section-topics__bottom-row section-topics__bottom-row--${lowerRowZIndex}`}
            onMouseLeave={() => handleMouseEvent('lower', false)}
            onMouseEnter={() => handleMouseEvent('lower', true)}
          >
            <Row
              static
              items={secondItems}
              shelfOpened={shelf1Opened}
              onOpenShelf={handleOpenShelf}
              shelfModifier={openShelf1}
              staticRow
              upstreamContext={upstreamContext}
              style={STYLES.TOPICS_SMALL}
              clearOpenShelfIndex={clearOpenShelfIndex}
              createAccessor={() => null}
              showHideContentButton={showHideContentButton}
            >{(item, data) => renderItem(item, data)}
            </Row>
          </div>
          <div
            className="section-topics__single-row"
            onMouseLeave={() => handleMouseEvent('single', false)}
            onMouseEnter={() => handleMouseEvent('single', true)}
          >
            <Row
              items={allItems}
              shelfOpened={shelf1Opened}
              shelfModifier={openShelf1}
              onOpenShelf={handleOpenShelf}
              upstreamContext={upstreamContext}
              style={STYLES.TOPICS_TABLET}
              clearOpenShelfIndex={clearOpenShelfIndex}
              createAccessor={() => null}
              showHideContentButton={showHideContentButton}
            >{(item, data) => renderItem(item, data)}
            </Row>
          </div>
        </div>
      </VisibilitySensor >
    )
  }

  render () {
    const {
      props,
      renderTopicControls,
      renderContent,
      setEventViewAll,
    } = this
    const { staticText, hasData, topicsList, language } = props
    const chevronIcon = <Icon iconClass={['icon--right', 'member-home-v2__icon-right']} />
    const showViewAll = language !== 'de' && language !== 'fr'

    // Don't render anything if we have data, but the data has no topics
    if (hasData && topicsList.size === 0) {
      return null
    }

    return (
      <div
        className="section-topics"
      >
        <div className="section-topics__outer-wrapper">
          <H2 className="section-topics__title">{staticText.get('sectionTitle')}</H2>
          {showViewAll ? <Link to="/topics" className="section-topics__view" onClick={setEventViewAll}>{staticText.get('viewAllLinkText')} {chevronIcon}</Link> : null}
          <div className="section-topics__clear" />
          {topicsList.size ? renderTopicControls() : null}
          {hasData ? renderContent() : <div className="section-topics__rows" />}
          {showViewAll ? <Link to="/topics" className="section-topics__view-mobile" onClick={setEventViewAll}>{staticText.get('viewAllLinkText')} {chevronIcon}</Link> : null}
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
      const topicsList = state.pmSection.getIn([sectionId, 'data', 'data', 'tabs'], List())
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const hasChildData = topicsList.every(topic =>
        itemsHaveData(topic.get('tabContent', List()), state.videos, state.series, language))
      return {
        staticText: state.staticText.getIn(['data', 'sectionExploreByTopic', 'data'], Map()),
        auth: state.auth,
        language,
        sectionId,
        adminTitle: section.getIn(['data', 'adminTitle']),
        hasData: section.has('data'),
        processing: section.get('processing', false),
        topicsList,
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
)(SectionExploreByTopic)
