import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { List, Map } from 'immutable'
import Link from 'components/Link'
import Icon from 'components/Icon'
import _get from 'lodash/get'
import {
  createUpstreamContext,
  SCREEN_TYPE_MEMBER_HOME,
  updateUpstreamContext,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import ToolTip from 'components/ToolTip'
import { ICON_TYPES } from 'components/Icon.v2'
import { Button, TYPES, SIZES } from 'components/Button.v2'
import { getBoundActions } from 'actions'
import VisibilitySensor from 'react-visibility-sensor'
import { TYPE_SERIES_FOLLOWING, MAX_ROW_ITEMS, itemsHaveData, sendCustomRowImpressionGAEvent } from 'services/pm-section'
import Row, { STYLES } from 'components/Row.v2'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import { FEATURE_NAME_MANAGE_SERIES_TOOLTIP } from 'services/feature-tracking/constants'
import { isMemberCustomizationToolTipEligible } from 'services/feature-tracking'
import TileHoverSeries from '../TileHover/TileHoverSeries'

const CONTEXT_TYPE_MY_SERIES_LIST = 'pm/my-series-list'
const HEADER_LABEL_MY_SERIES = 'my series'
const CONTEXT_TYPE_FOLLOWED_SERIES = 'pm/followed-series-list'
const HEADER_LABEL_FOLLOWED_SERIES = 'followed series'

class SectionMySeries extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
      following,
      campaign,
      variation,
    } = props

    const campaignId = _get(campaign, 'friendlyId')
    const variationId = _get(variation, 'friendlyId')
    this.toolTipEligible = campaignId === 'ME-3043' && variationId === 1 &&
      isMemberCustomizationToolTipEligible(props.featureTracking, props.userStore,
        FEATURE_NAME_MANAGE_SERIES_TOOLTIP)

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: following ? CONTEXT_TYPE_FOLLOWED_SERIES : CONTEXT_TYPE_MY_SERIES_LIST,
      sectionId,
      sectionIndex,
      headerLabel: following ? HEADER_LABEL_FOLLOWED_SERIES : HEADER_LABEL_MY_SERIES,
    })

    this.isVisible = false
    this.visibleIndexes = []
    this.sentIndexes = []
    this.state = {
      visibilitySensorEnabled: false,
      upstreamContext,
      showTooltip: true,
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
      mySeriesContent,
    } = props
    if (isVisible && hasChildData) {
      const unsetIndexes = visibleIndexes.filter(index => !sentIndexes.includes(index))
      if (unsetIndexes.length) {
        sendCustomRowImpressionGAEvent(setDefaultGaEvent, unsetIndexes,
          mySeriesContent, adminTitle, language, videoStore, seriesStore)
        unsetIndexes.forEach(index => sentIndexes.push(index))
      }
    }
  }

  handleViewAllClick = () => {
    // save this for GA events
  }

  renderTooltip = () => {
    const { state, props } = this
    const { showTooltip } = state
    const { staticText } = props

    return (
      <div>
        {this.toolTipEligible && showTooltip ?
          <ToolTip
            visible
            className={['me-2686-tooltip']}
            arrowClassName={[
              'tool-tip__arrow',
            ]}
            featureName={FEATURE_NAME_MANAGE_SERIES_TOOLTIP}
          >
            <Button
              className="topics-tooltip__close"
              icon={ICON_TYPES.CLOSE}
              onClick={() => this.setState({ showTooltip: false })}
              size={SIZES.DEFAULT}
              type={TYPES.ICON}
            />
            <p className="topics-tooltip__title">
              {staticText.get('manageYourSeries')}
            </p>
            <p className="topics-tooltip__text">
              {staticText.get('seriesTooltip')}
            </p>
          </ToolTip>
          : null
        }
      </div>
    )
  }

  renderItems = () => {
    const { props, renderItem, state } = this
    const { upstreamContext, visibilitySensorEnabled } = state
    const {
      clearOpenShelfIndex,
      hasData,
      hasChildData,
      mySeriesContent,
      shelfOpened,
      handleOpenShelf,
      closeShelf,
      adminTitle,
    } = props

    let items = mySeriesContent.slice(0, MAX_ROW_ITEMS)

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
          onRenderContent={this.onRenderContent}
          clearOpenShelfIndex={clearOpenShelfIndex}
          style={STYLES.S12345}
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
    } = props

    const seriesId = Number(item.get('contentId'))
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
        adminTitle={adminTitle}
      />
    )
  }

  render () {
    const {
      renderItems,
      props,
      handleViewAllClick,
    } = this
    const { staticText, hasData, processing, mySeriesContent, following, sectionTitle } = props
    // We expect this section to have items, so we want to render until we have data (and no items)
    if (hasData && !mySeriesContent.size) {
      // List is empty
      return null
    }

    const titleClasses = ['section-my-series__title']
    if (hasData && processing) {
      titleClasses.push('section-my-series__title--refreshing')
    }
    const refreshIcon = <Icon iconClass={['icon--clock']} />
    const chevronIcon = <Icon iconClass={['icon--right', 'member-home-v2__icon-right']} />

    return (
      <div className="section-my-series">
        <div className="section-my-series__wrapper">
          { following ?
            <TestarossaSwitch>
              <TestarossaCase campaign="ME-3043" variation={[1]} unwrap>
                {() => (
                  <Link to="/account/settings" className="section-my-series__view" onClick={handleViewAllClick}>
                    {staticText.get('manageMySeries')} {chevronIcon}
                  </Link>
                )}
              </TestarossaCase>
              <TestarossaDefault unwrap>
                <Link to="/notifications/manage" className="section-my-series__view" onClick={handleViewAllClick}>
                  {staticText.get('manageMySeries')} {chevronIcon}
                </Link>
              </TestarossaDefault>
            </TestarossaSwitch>
            :
            <Link to="/seeking-truth/original-programs" className="section-my-series__view" onClick={handleViewAllClick}>
              {staticText.get('viewAllLinkText')} {chevronIcon}
            </Link>
          }
          <div className={titleClasses.join(' ')}>{sectionTitle}{refreshIcon}</div>
          { this.renderTooltip() }
          <div className="section-my-series__items">{renderItems()}</div>
          { following ?
            <TestarossaSwitch>
              <TestarossaCase campaign="ME-3043" variation={[1]} unwrap>
                {() => (
                  <Link to="/account/settings" className="section-my-series__view-mobile" onClick={handleViewAllClick}>
                    {staticText.get('manageMySeries')} {chevronIcon}
                  </Link>
                )}
              </TestarossaCase>
              <TestarossaDefault unwrap>
                <Link to="/notifications/manage" className="section-my-series__view-mobile" onClick={handleViewAllClick}>
                  {staticText.get('manageMySeries')} {chevronIcon}
                </Link>
              </TestarossaDefault>
            </TestarossaSwitch>
            :
            <Link to="/seeking-truth/original-programs" className="section-my-series__view-mobile" onClick={handleViewAllClick}>
              {staticText.get('viewAllLinkText')} {chevronIcon}
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
      const { sectionId, type } = props
      // Get section
      const section = state.pmSection.get(sectionId, Map())
      const sectionStore = state.pmSection.get(sectionId, Map())
      const tabs = state.pmSection.getIn([sectionId, 'data', 'data', 'tabs'], List())
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const mySeriesContent = tabs.getIn([0, 'tabContent'], List())
      const staticText = state.staticText.getIn(['data', 'sectionMySeries', 'data'], Map())
      const sectionTitle = staticText.get(type === TYPE_SERIES_FOLLOWING ? 'sectionTitleFollowing' : 'sectionTitle')
      const hasChildData = itemsHaveData(mySeriesContent.slice(0, MAX_ROW_ITEMS),
        state.videos, state.series, language)
      return {
        auth: state.auth,
        adminTitle: section.getIn(['data', 'adminTitle']),
        sectionId,
        staticText,
        hasData: sectionStore.has('data'),
        processing: sectionStore.get('processing', false),
        mySeriesContent,
        sectionTitle,
        language,
        hasChildData,
        videoStore: hasChildData && state.videos,
        seriesStore: hasChildData && state.series,
        featureTracking: state.featureTracking,
        userStore: state.user,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(SectionMySeries)
