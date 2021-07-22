/* eslint-disable no-bitwise */
import React from 'react'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { List, Map, fromJS } from 'immutable'
import compose from 'recompose/compose'
import {
  SCREEN_TYPE_MEMBER_HOME,
} from 'services/upstream-context'
import CommentsLoader from 'components/CommentsLoader'
import TooltipV2 from 'components/ToolTip.v2'
import { TYPE_HIDE_CONTENT } from 'services/dialog'
import { TOUR_STEPS_MOBILE, TOUR_STEPS_DESKTOP } from 'components/ToolTip.v2/steps'
import _get from 'lodash/get'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import { FEATURE_NAME_ESP_ANNOUNCEMENT_MODAL, FEATURE_NAME_MANAGE_SERIES_TOOLTIP, FEATURE_NAME_WATCH_HISTORY_TOOLTIP } from 'services/feature-tracking/constants'
import { isMemberCustomizationToolTipEligible } from 'services/feature-tracking'
import SectionManager from '../SectionManager'

class MemberHome extends React.Component {
  constructor (props) {
    super(props)
    this.listenerBound = false

    this.state = {
      openShelfIndex: null,
      removedRows: [],
      showHideContentTooltip: true,
      showSiteTourTooltip: true,
    }
  }

  componentDidMount () {
    const { props } = this
    const { getPmScreen, setTouchDevice, language, campaign, variation } = props
    const campaignId = _get(campaign, 'friendlyId')
    const variationId = _get(variation, 'friendlyId')

    getPmScreen(SCREEN_TYPE_MEMBER_HOME, language)
    global.addEventListener('touchstart', function onFirstTouch () {
      setTouchDevice(true)
      // we only need to know about one touch, so we can stop listening now
      global.removeEventListener('touchstart', onFirstTouch, false)
    }, false)
    this.toolTipEligible = campaignId === 'ME-3043' && variationId === 1 &&
      isMemberCustomizationToolTipEligible(props.featureTracking, props.userStore,
        FEATURE_NAME_ESP_ANNOUNCEMENT_MODAL)
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const { language, username, getPmScreen } = props
    if (language !== prevProps.language || username !== prevProps.username) {
      getPmScreen(SCREEN_TYPE_MEMBER_HOME, language)
    }
  }

  componentWillUnmount () {
    const {
      language,
      clearVideosImpressionData,
      clearSeriesImpressionData,
    } = this.props
    clearVideosImpressionData(language)
    clearSeriesImpressionData(language)
  }

  onClickHideContentTooltip = (resetTooltips) => {
    const { dismissModal, incrementFeatureImpressionCount,
      resetFeatureImpressionCount } = this.props
    if (resetTooltips) {
      resetFeatureImpressionCount(FEATURE_NAME_MANAGE_SERIES_TOOLTIP)
      resetFeatureImpressionCount(FEATURE_NAME_WATCH_HISTORY_TOOLTIP)
    }
    incrementFeatureImpressionCount(FEATURE_NAME_ESP_ANNOUNCEMENT_MODAL)
    this.setState({ showHideContentTooltip: false })
    dismissModal()
  }
  onReturnFocusHideContentTooltip = () => {
    return null
  }

  setOpenShelfIndex = (openShelfIndex) => {
    if (openShelfIndex !== this.state.openShelfIndex) {
      this.setState({ openShelfIndex })
    }
  }

  removeRowHandler = (id) => {
    this.props.setFeatureTrackingDataPersistent({ data: fromJS({ hidePmSectionIds: [id] }) })
    const s = new Set(this.state.removedRows)
    s.add(id)
    this.setState({ removedRows: Array.from(s) })
  }

  addBackHandler = (id) => {
    this.props.setFeatureTrackingDataPersistent({ data: fromJS({ showPmSectionIds: [id] }) })
    this.setState(state => ({
      removedRows: state.removedRows.filter(x => x !== id),
    }))
  }

  clearOpenShelfIndex = () => {
    this.setOpenShelfIndex(null)
  }

  renderSections = () => {
    const { props } = this
    const { sectionIds, history } = props
    if (!sectionIds.size) {
      return null
    }

    return sectionIds.map((sectionId, index) => {
      const shelfOpened = index === this.state.openShelfIndex
      const setShelfOpen = () => {
        this.setOpenShelfIndex(index)
      }
      return (
        <TestarossaSwitch key={sectionId}>
          <TestarossaCase campaign="ME-3043" variation={[1]} unwrap>
            {() => (
              <SectionManager
                key={sectionId}
                index={index}
                shelfOpened={shelfOpened}
                setShelfOpen={setShelfOpen}
                history={history}
                clearOpenShelfIndex={this.clearOpenShelfIndex}
                id={sectionId}
                removeRowHandler={() => { this.removeRowHandler(sectionId) }}
                addBackHandler={() => { this.addBackHandler(sectionId) }}
                removed={this.state.removedRows.includes(sectionId)}
              />
            )}
          </TestarossaCase>
          <TestarossaDefault unwrap>
            <SectionManager
              key={sectionId}
              index={index}
              shelfOpened={shelfOpened}
              setShelfOpen={setShelfOpen}
              history={history}
              clearOpenShelfIndex={this.clearOpenShelfIndex}
              id={sectionId}
            />
          </TestarossaDefault>
        </TestarossaSwitch>
      )
    })
  }

  // TODO: REMOVE OR PRODUCTIZE AFTER ME-2622
  renderSiteTourTooltip = () => {
    return (
      <TestarossaSwitch>
        <TestarossaCase campaign="ME-2622" variation={[1]} unwrap>
          {campaign => (
            <div>
              <TooltipV2
                mobileSteps={TOUR_STEPS_MOBILE}
                desktopSteps={TOUR_STEPS_DESKTOP}
                closeTooltip={() => this.setState({ showSiteTourTooltip: false })}
                featureName={FEATURE_NAME_ESP_ANNOUNCEMENT_MODAL}
                campaign={campaign}
              />
            </div>
          )}
        </TestarossaCase>
        <TestarossaDefault unwrap>
          {() => (
            null
          )}
        </TestarossaDefault>
      </TestarossaSwitch>
    )
  }

  renderHideContentTooltip = () => {
    const { props } = this
    const { staticText, renderModal } = props
    return (
      renderModal(TYPE_HIDE_CONTENT, {
        title: staticText.getIn(['data', 'hideContentTooltipHeader']),
        className: 'hidecontent__tooltip',
        staticText,
        onClick: this.onClickHideContentTooltip,
        onDismiss: this.onClickHideContentTooltip,
        onReturnFocus: this.onReturnFocusHideContentTooltip,
        hideOverflow: true,
      })
    )
  }

  render () {
    const { renderSections, state } = this
    const { showHideContentTooltip, showSiteTourTooltip } = state
    return (
      <article className="member-home" >
        <div className="member-home-v2">
          {this.toolTipEligible && showHideContentTooltip && this.renderHideContentTooltip()}
          { showSiteTourTooltip && this.renderSiteTourTooltip() }
          <CommentsLoader />
          {renderSections()}
        </div>
      </article>
    )
  }
}

export default compose(
  connectStaticText({ storeKey: 'memberHomeV2' }),
  connectRedux(
    (state) => {
      const username = state.auth.get('username')
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const screenStore = state.pmScreen.getIn([SCREEN_TYPE_MEMBER_HOME, language]) || Map()
      const sectionIds = screenStore.getIn(['data', 'sectionIds']) || List()
      return {
        language,
        username,
        sectionIds,
        featureTracking: state.featureTracking,
        userStore: state.user,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getPmScreen: actions.pmScreen.getPmScreen,
        setFeatureTrackingDataPersistent: actions.featureTracking.setFeatureTrackingDataPersistent,
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
        setTouchDevice: actions.page.setPageTouchDevice,
        clearVideosImpressionData: actions.videos.clearVideosImpressionData,
        clearSeriesImpressionData: actions.series.clearSeriesImpressionData,
        renderModal: actions.dialog.renderModal,
        dismissModal: actions.dialog.dismissModal,
        incrementFeatureImpressionCount: actions.featureTracking.incrementFeatureImpressionCount,
        resetFeatureImpressionCount: actions.featureTracking.resetFeatureImpressionCount,
      }
    },
  ),
)(MemberHome)
