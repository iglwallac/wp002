/* eslint-disable max-len */
import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { List, Map } from 'immutable'
import _replace from 'lodash/replace'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import { get as getConfig } from 'config'
import {
  createUpstreamContext,
  SCREEN_TYPE_MEMBER_HOME,
} from 'services/upstream-context'
import { getBoundActions } from 'actions'
import { MAX_ROW_ITEMS, itemsHaveData, sendCustomRowImpressionGAEvent } from 'services/pm-section'
import VisibilitySensor from 'react-visibility-sensor'
import Row, { STYLES } from 'components/Row.v2'
import TileHoverVideo from 'components/TileHover/TileHoverVideo'
import SliderBar from 'components/SliderBar/SliderBar'
import { CATEGORY_YOGA } from 'components/FilterContainer'

const config = getConfig()
const CONTEXT_TYPE_MY_PRACTICES_LIST = 'pm/recommended-practices-list'

class SectionRecommendedPractices extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
    } = props

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_MY_PRACTICES_LIST,
      sectionId,
      sectionIndex,
    })

    this.isVisible = false
    this.visibleIndexes = []
    this.sentIndexes = []
    this.state = {
      upstreamContext,
      currentDuration: 0,
      visibilitySensorEnabled: false,
    }
  }

  componentDidMount () {
    const {
      getPmRecommendedPracticesFilters,
      language,
    } = this.props

    getPmRecommendedPracticesFilters(CATEGORY_YOGA, language)
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

  // eslint-disable-next-line no-unused-vars
  setFilterTabClicked = (index, termId) => {
    // save for GA events
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
      recommendedPracticesItems,
    } = props
    if (isVisible && hasChildData) {
      const unsetIndexes = visibleIndexes.filter(index => !sentIndexes.includes(index))
      if (unsetIndexes.length) {
        sendCustomRowImpressionGAEvent(setDefaultGaEvent, unsetIndexes,
          recommendedPracticesItems, adminTitle, language, videoStore, seriesStore, termsStore)
        unsetIndexes.forEach(index => sentIndexes.push(index))
      }
    }
  }

  updateDuration = (e, index) => {
    const { setFilterTabClicked, props } = this
    const { getPmRecommendedPractices, language, recommendedPracticeFilters } = props
    e.preventDefault()
    const filter = recommendedPracticeFilters.get(index)
    const durationId = filter.get('value')
    setFilterTabClicked(index, durationId)
    getPmRecommendedPractices(language, durationId)
    this.setState({ currentDuration: index })
  }


  renderItem = (item, params) => {
    const { props, state } = this
    const { openShelf, focused, index, itemShelfIsOpen, hideShelf } = params
    const { upstreamContext } = state
    const { location,
      shelfOpened,
      adminTitle,
    } = props
    const videoId = Number(item.get('id'))

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
      />
    )
  }

  renderPracticesFilters = () => {
    const {
      updateDuration,
      props,
    } = this
    const { recommendedPracticeFilters } = props
    // below is a special requirement for the experiment
    // this was added to fulfill a requirement to remove 75 min and 90 min yoga durations
    const blacklistedTids = _get(config, ['features', 'recommendedPractices', 'blacklistedTermIds'])
    const filtered = recommendedPracticeFilters.filter((item) => {
      if (!_includes(blacklistedTids, item.get('value'))) {
        return item
      }
      return null
    })

    return (
      <SliderBar
        className="section-recommended-practices__filters"
        items={filtered.map((filter) => {
          return {
            value: filter.get('value'),
            label: _replace(filter.get('name'), 'Minutes', 'min'),
          }
        })}
        onclick={updateDuration}
      />
    )
  }

  renderItems = () => {
    const { props, renderItem, state } = this
    const { upstreamContext, visibilitySensorEnabled } = state
    const {
      hasData,
      hasChildData,
      recommendedPracticesItems,
      shelfOpened,
      handleOpenShelf,
      closeShelf,
      clearOpenShelfIndex,
    } = props

    let items = recommendedPracticesItems.slice(0, MAX_ROW_ITEMS)

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
          upstreamContext={upstreamContext}
          createAccessor={() => null}
          onRenderContent={this.onRenderContent}
          clearOpenShelfIndex={clearOpenShelfIndex}
          style={STYLES.S12345}
        >{(item, data, index, hovered) => renderItem(item, data, index, hovered)}
        </Row>
      </VisibilitySensor>
    )
  }

  render () {
    const {
      renderItems,
      props,
      renderPracticesFilters,
    } = this

    const {
      hasData,
      sectionTitle,
      recommendedPracticesItems,
    } = props

    // We expect this section to have items, so we want to render until we have data (and no items)
    if (hasData && !recommendedPracticesItems.size) {
      // List is empty
      return null
    }

    return (
      <div className="section-recommended-practices">
        <div className="section-recommended-practices__wrapper">
          <div className="section-recommended-practices__title">{sectionTitle}</div>
          {renderPracticesFilters()}
          <div
            className="section-recommended-practices__items"
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
    (state, props) => {
      const { sectionId } = props
      const section = state.pmSection.getIn([sectionId, 'data'], Map())
      const username = state.user.getIn(['data', 'name'])
      const firstName = state.user.getIn(['data', 'firstName'])
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const recommendedPracticesStore = state.pmRecommendedPractices.get(language, Map())
      const recommendedPracticesItems = recommendedPracticesStore.get('data', List())
      // Recommended for %{firstName} || %{userName}
      const titleTemplate = staticText.get('sectionTitle', '')
      let sectionTitle
      if (!firstName || firstName === 'Friend of' || firstName === 'Gaia') {
        sectionTitle = titleTemplate.replace(/%\{name\}/, username)
      } else {
        sectionTitle = titleTemplate.replace(/%\{name\}/, firstName)
      }
      const staticText = state.staticText.getIn(['data', 'sectionRecommendedPractices', 'data'], Map())
      const hasChildData = itemsHaveData(recommendedPracticesItems.slice(0, MAX_ROW_ITEMS), state.videos, state.series, language)
      return {
        username,
        firstName,
        sectionId,
        sectionTitle,
        adminTitle: section.getIn(['data', 'adminTitle']),
        staticText,
        hasData: recommendedPracticesStore.has('data'),
        processing: recommendedPracticesStore.get('processing', false),
        recommendedPracticesItems,
        language,
        hasChildData,
        videoStore: hasChildData && state.videos,
        seriesStore: hasChildData && state.series,
        recommendedPracticeFilters: recommendedPracticesStore.getIn(['filterSet', 3, 'filter', 'options'], List()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
        getPmRecommendedPractices: actions.pmRecommendedPractices.getPmRecommendedPractices,
        getPmRecommendedPracticesFilters: actions.pmRecommendedPractices.getPmRecommendedPracticesFilters,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(SectionRecommendedPractices)
