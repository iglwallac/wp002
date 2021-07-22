import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { List, Map } from 'immutable'
import VisibilitySensor from 'react-visibility-sensor'
import Icon from 'components/Icon'
import {
  createUpstreamContext,
  updateUpstreamContext,
  SCREEN_TYPE_MEMBER_HOME,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import Row, { STYLES } from 'components/Row.v2'
import ToolTipArrow, { DIRECTION_RIGHT } from 'components/ToolTipArrow'
import { MAX_ROW_ITEMS, itemsHaveData, sendCustomRowImpressionGAEvent } from 'services/pm-section'
import { H4 } from 'components/Heading'
import TileHoverVideo from '../TileHover/TileHoverVideo'

const CONTEXT_TYPE_RECOMMENDED_CONTENT_LIST = 'pm/my-recommended-content-list'
const HEADER_LABEL_RECOMMENDED_CONTENT = 'recommended content'
class SectionRecommendedContent extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
    } = props

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_RECOMMENDED_CONTENT_LIST,
      sectionId,
      sectionIndex,
      headerLabel: HEADER_LABEL_RECOMMENDED_CONTENT,
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
      language,
      recommendedContent,
    } = props
    if (isVisible && hasChildData) {
      const unsetIndexes = visibleIndexes.filter(index => !sentIndexes.includes(index))
      if (unsetIndexes.length) {
        sendCustomRowImpressionGAEvent(setDefaultGaEvent, unsetIndexes,
          recommendedContent, adminTitle, language, videoStore)
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
    const source = item.get('pineSource')
    const score = item.get('pineScore')
    const videoTasteSegment = item.get('videoTasteSegment')

    return (
      <React.Fragment>
        {index === 0 ?
          <ToolTipArrow
            direction={DIRECTION_RIGHT}
            activeArrow="recommended-content-mobile-arrow"
          /> : null
        }
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
          source={source}
          score={score}
          videoTasteSegment={videoTasteSegment}
          adminTitle={adminTitle}
          showHideContentButton={showHideContentButton}
        />
      </React.Fragment>
    )
  }


  renderItems = () => {
    const { props, state, renderItem } = this
    const { upstreamContext, visibilitySensorEnabled } = state
    const {
      hasData,
      hasChildData,
      recommendedContent,
      shelfOpened,
      handleOpenShelf,
      closeShelf,
      clearOpenShelfIndex,
      adminTitle,
      showHideContentButton,
    } = props

    let items = recommendedContent.slice(0, MAX_ROW_ITEMS)

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
          style={STYLES.S12234}
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
    } = this
    const {
      sectionTitle,
      hasData,
      processing,
      recommendedContent,
    } = props

    // We expect this section to have items, so we want to render until we have data (and no items)
    if (hasData && !recommendedContent.size) {
      // List is empty
      return null
    }

    const titleClasses = ['section-recommended-content__title']
    if (hasData && processing) {
      titleClasses.push('section-recommended-content__title--refreshing')
    }
    const refreshIcon = <Icon iconClass={['icon--clock']} />

    return (
      <div
        className="section-recommended-content"
      >
        <div className="section-recommended-content__wrapper">
          <H4 className={titleClasses.join(' ')}>{sectionTitle}{refreshIcon}</H4>
          <div
            className="section-recommended-content__row"
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
      const username = state.user.getIn(['data', 'name'])
      const firstName = state.user.getIn(['data', 'firstName'])
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const recommendedContent = tabs.getIn([0, 'tabContent'], List())
      const staticText = state.staticText.getIn(['data', 'sectionRecommendedContent', 'data'], Map())
      const hasChildData = itemsHaveData(
        recommendedContent.slice(0, MAX_ROW_ITEMS),
        state.videos, state.series,
        language,
      )
      // Recommended for %{firstName} || %{userName}
      const titleTemplate = staticText.get('sectionTitle', '')
      let sectionTitle
      if (!firstName || firstName === 'Friend of' || firstName === 'Gaia') {
        sectionTitle = titleTemplate.replace(/%\{name\}/, username)
      } else {
        sectionTitle = titleTemplate.replace(/%\{name\}/, firstName)
      }

      return {
        username,
        firstName,
        adminTitle: section.getIn(['data', 'adminTitle']),
        staticText,
        sectionTitle,
        hasData: section.has('data'),
        processing: section.get('processing', false),
        recommendedContent,
        hasChildData,
        language,
        videoStore: hasChildData && state.videos,
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
)(SectionRecommendedContent)
