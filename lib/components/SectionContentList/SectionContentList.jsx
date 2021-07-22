import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { List, Map } from 'immutable'
import {
  createUpstreamContext,
  SCREEN_TYPE_MEMBER_HOME,
  updateUpstreamContext,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import VisibilitySensor from 'react-visibility-sensor'
import Row, { STYLES } from 'components/Row.v2'
import { MAX_ROW_ITEMS, itemsHaveData, sendCustomRowImpressionGAEvent } from 'services/pm-section'
import { CUSTOM_ROW_REMOVED_EVENT } from 'services/event-tracking'
import { PM_LIST_TYPE_PEOPLE } from 'services/pm-list'
import TileHoverVideo, { VERTICAL_DISPLAY_MODE } from 'components/TileHover/TileHoverVideo'
import TileHoverSeries from 'components/TileHover/TileHoverSeries'
import Link from 'components/Link'
import Icon from 'components/Icon'
import TileHoverPerson from 'components/TileHover/TileHoverPerson'
import TileHoverTopic from 'components/TileHover/TileHoverTopic'
import SectionRemoved from 'components/SectionRemoved'
import { getBoundActions } from 'actions'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import ToolTip from 'components/ToolTip'
import { H4 } from 'components/Heading'

const CONTEXT_TYPE_CONTENT_LIST = 'pm/my-content-list-list'

class SectionContentList extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
      headerLabel,
    } = props

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_CONTENT_LIST,
      sectionId,
      sectionIndex,
      headerLabel,
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

  onRemoveRow = () => {
    const { adminTitle, setDefaultGaEvent, removeRowHandler } = this.props
    const eventData = CUSTOM_ROW_REMOVED_EVENT
      .set('eventLabel', adminTitle)
    setDefaultGaEvent(eventData)
    removeRowHandler()
    this.setState(() => ({ removeRowHovered: false }))
  }

  onRenderContent = (indexes) => {
    this.visibleIndexes = indexes
    this.checkAndSendImpressionGAEvent()
  }

  onVisibilityChange = (isVisible) => {
    this.isVisible = isVisible
    this.checkAndSendImpressionGAEvent()
  }

  getStyle = () => {
    const { listType, displayMode } = this.props
    if (listType === PM_LIST_TYPE_PEOPLE) {
      return STYLES.S23456
    } else if (displayMode === VERTICAL_DISPLAY_MODE) {
      return STYLES.S12345
    }
    return STYLES.S12234
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
      listItems,
    } = props
    if (isVisible && hasChildData) {
      const unsetIndexes = visibleIndexes.filter(index => !sentIndexes.includes(index))
      if (unsetIndexes.length) {
        sendCustomRowImpressionGAEvent(setDefaultGaEvent, unsetIndexes,
          listItems, adminTitle, language, videoStore, seriesStore, termsStore)
        unsetIndexes.forEach(index => sentIndexes.push(index))
      }
    }
  }

  handleRemoveRowMouseEnter = () => {
    this.setState(() => ({ removeRowHovered: true }))
  }

  handleRemoveRowMouseLeave = () => {
    this.setState(() => ({ removeRowHovered: false }))
  }

  renderItem = (item, params) => {
    const { openShelf, focused, index, itemShelfIsOpen, hideShelf } = params
    const { props, state } = this
    const {
      location,
      shelfOpened,
      adminTitle,
      listType,
      displayMode,
      showHideContentButton,
    } = props
    const { upstreamContext } = state

    const type = item.get('contentType', 'video') // default to placeholder video
    const id = Number(item.get('contentId'))

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
          displayMode={displayMode}
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
          vertical={displayMode === VERTICAL_DISPLAY_MODE}
          showHideContentButton={showHideContentButton}
        />
      )
    }

    if (type === 'person') {
      return (
        <TileHoverPerson
          id={id}
          adminTitle={adminTitle}
          isPeopleRow={listType === PM_LIST_TYPE_PEOPLE}
        />
      )
    }

    if (type === 'tag') {
      return (
        <TileHoverTopic
          id={id}
          adminTitle={adminTitle}
        />
      )
    }

    return null
  }

  renderRemoveRowTooltip = () => {
    const { props } = this
    const { staticText } = props
    return (
      <div>
        <ToolTip
          visible
          className={['section-content-list__remove__tooltip home__tooltip__remove']}
          arrowClassName={['tool-tip__arrow--center-bottom']}
        >
          {staticText.get('removeRow')}
        </ToolTip>
      </div>
    )
  }

  renderItems = () => {
    const { props, state, renderItem, getStyle } = this
    const { upstreamContext, visibilitySensorEnabled } = state

    const {
      hasData,
      hasChildData,
      listItems,
      listType,
      shelfOpened,
      handleOpenShelf,
      closeShelf,
      clearOpenShelfIndex,
      adminTitle,
      showHideContentButton,
    } = props

    let items = listItems.slice(0, MAX_ROW_ITEMS)

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
          className={listType === PM_LIST_TYPE_PEOPLE ? 'subscription-row__row' : ''}
          shelfOpened={shelfOpened}
          onOpenShelf={handleOpenShelf}
          closeShelf={closeShelf}
          upstreamContext={updateUpstreamContext(
            upstreamContext,
            CONTEXT_NAME_ADMIN_TITLE,
            adminTitle,
          )}
          createAccessor={() => null}
          onRenderContent={this.onRenderContent}
          clearOpenShelfIndex={clearOpenShelfIndex}
          style={listType === PM_LIST_TYPE_PEOPLE ? STYLES.S12345 : getStyle()}
          showHideContentButton={showHideContentButton}
        >{(item, data, index, hovered) => renderItem(item, data, index, hovered)}
        </Row>
      </VisibilitySensor>
    )
  }

  render () {
    const {
      props,
      renderItems,
      state,
    } = this
    const {
      hasData,
      processing,
      listItems,
      listType,
      headerLabel,
      removeRowHandler,
      addBackHandler,
      removed,
      adminTitle,
      setDefaultGaEvent,
      staticText,
      language,
    } = props

    // We expect this section to have items, so we want to render until we have data (and no items)
    if (hasData && !listItems.size) {
      // List is empty
      return null
    }


    const titleClasses = ['section-content-list__title']
    if (hasData && processing) {
      titleClasses.push('section-content-list__title--refreshing')
    }

    const showViewAll = listType === 'content-tags' && language !== 'de' && language !== 'fr'
    const chevronIcon = <Icon iconClass={['icon--right', 'member-home-v2__icon-right']} />
    return removed ? <SectionRemoved
      sectionTitle={headerLabel}
      addBackHandler={addBackHandler}
      adminTitle={adminTitle}
      setDefaultGaEvent={setDefaultGaEvent}
      staticText={staticText}
    />
      : (
        <div
          className={`section-content-list section-content-list--${listType}`}
        >
          <div className="section-content-list__wrapper">
            <div className="section-content-list__header">
              <H4 className={titleClasses.join(' ')}>{headerLabel}
                {removeRowHandler &&
                <span
                  className="section-content-list__remove section-content-list__remove"
                  onMouseLeave={this.handleRemoveRowMouseLeave}
                  onMouseEnter={this.handleRemoveRowMouseEnter}
                  onClick={this.onRemoveRow}
                >
                  <IconV2 type={ICON_TYPES.CLOSE_2} />
                  { state.removeRowHovered && this.renderRemoveRowTooltip()}
                </span>
                }
              </H4>
              {showViewAll &&
              <Link to="/topics" className="section-content-list__view section-content-list__view--desktop">
                {staticText.get('viewAllLinkText')}{chevronIcon}
              </Link>}
            </div>
            <div
              className={`section-content-list__row${listType === PM_LIST_TYPE_PEOPLE ? ' section-content-list__row--people'
                : ''}`}
            >
              {renderItems()}
            </div>
            {showViewAll &&
            <Link to="/topics" className="section-content-list__view section-content-list__view--mobile">
              {staticText.get('viewAllLinkText')}{chevronIcon}
            </Link>
            }
          </div>
        </div>
      )
  }
}

export default compose(
  connectRedux(
    (state, props) => {
      const { sectionId } = props
      const section = state.pmSection.get(sectionId)
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const listId = section.getIn(['data', 'data', 'content', 0, 'listId'])
      const listType = state.pmList.getIn([listId, 'data', 'type'])
      const headerLabel = section.getIn(['data', 'data', 'header', 'label'], '')
      // TODO: refactor if implementing content list with multiple tabs
      const tabs = section.getIn(['data', 'data', 'tabs'], List())
      const listItems = tabs.getIn([0, 'tabContent'], List())
      const hasChildData = itemsHaveData(listItems.slice(0, MAX_ROW_ITEMS),
        state.videos, state.series, language, state.term)
      return {
        headerLabel,
        hasData: section.has('data'),
        listItems,
        language,
        adminTitle: section.getIn(['data', 'adminTitle']),
        listType,
        processing: section.get('processing', false),
        hasChildData,
        videoStore: hasChildData && state.videos,
        seriesStore: hasChildData && state.series,
        termsStore: hasChildData && state.term,
        displayMode: state.pmSection.getIn([sectionId, 'data', 'data', 'displayMode'], ''),
        staticText: state.staticText.getIn(['data', 'sectionContentList', 'data'], Map()),
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
)(SectionContentList)
