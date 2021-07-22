import React from 'react'
import { getBoundActions } from 'actions'
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
import VisibilitySensor from 'react-visibility-sensor'
import Row from 'components/Row.v2'
import { MAX_ROW_ITEMS, itemsHaveData, sendCustomRowImpressionGAEvent } from 'services/pm-section'
import { H4 } from 'components/Heading'
import { get as getConfig } from 'config'
import { URL_PLAYLIST_WATCH_LATER } from 'services/url/constants'
import TileHoverVideo from '../TileHover/TileHoverVideo'

const CONTEXT_TYPE_PLAYLIST_LIST = 'pm/my-playlist-list'
const CONTEXT_TYPE_PLAYLIST_SECTION = 'pm/my-playlist-section'
const HEADER_LABEL_PLAYLIST = 'playlist'

const config = getConfig()

class SectionPlaylist extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
    } = props

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_PLAYLIST_LIST,
      sectionId,
      sectionIndex,
      headerLabel: HEADER_LABEL_PLAYLIST,
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
      playlistItems,
    } = props
    if (isVisible && hasChildData) {
      const unsetIndexes = visibleIndexes.filter(index => !sentIndexes.includes(index))
      if (unsetIndexes.length) {
        sendCustomRowImpressionGAEvent(setDefaultGaEvent, unsetIndexes,
          playlistItems, adminTitle, language, videoStore, seriesStore)
        unsetIndexes.forEach(index => sentIndexes.push(index))
      }
    }
  }

  handleViewAllClick = () => {
    const { state, props } = this
    const { upstreamContext } = state
    const { setUpstreamContext } = props
    const updatedContext = upstreamContext.set('contextType', CONTEXT_TYPE_PLAYLIST_SECTION)

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
    const { props, renderItem, state } = this
    const { upstreamContext, visibilitySensorEnabled } = state
    const {
      hasPlaylistData,
      hasChildData,
      playlistItems,
      shelfOpened,
      handleOpenShelf,
      closeShelf,
      clearOpenShelfIndex,
      adminTitle,
    } = props

    let items = playlistItems.slice(0, MAX_ROW_ITEMS)

    // Render placeholders when section data or child data is missing
    if (!hasPlaylistData || !hasChildData) {
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
        >{(item, data) => renderItem(item, data)}
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
      hasSectionData,
      hasPlaylistData,
      processing,
      playlistItems,
    } = props

    const url = config.features.multiplePlaylists
      ? URL_PLAYLIST_WATCH_LATER
      : '/playlist'

    if (!hasSectionData) {
      return null
    }

    // We expect this section to have items, so we want to render until we have data (and no items)
    if (hasPlaylistData && !playlistItems.size) {
      // List is empty
      return null
    }

    const titleClasses = ['section-playlist__title']
    if (hasPlaylistData && processing) {
      titleClasses.push('section-playlist__title--refreshing')
    }
    const refreshIcon = <Icon iconClass={['icon--clock']} />
    const chevronIcon = <Icon iconClass={['icon--right', 'member-home-v2__icon-right']} />

    return (
      <div className="section-playlist">
        <div className="section-playlist__background" />
        <div className="section-playlist__wrapper">
          <Link to={url} className="section-playlist__view" onClick={handleViewAllClick}>{staticText.get('viewAllLinkText')} {chevronIcon}</Link>
          <H4 className={titleClasses.join(' ')}>{staticText.get('sectionTitle')}{refreshIcon}</H4>
          <div
            className="section-playlist__items"
            onMouseLeave={this.handleMouseLeave}
            onMouseEnter={this.handleMouseEnter}
          >
            {renderItems()}
          </div>
          <Link to={url} className="section-playlist__view-mobile" onClick={handleViewAllClick}>{staticText.get('viewAllLinkText')} {chevronIcon}</Link>
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
      const section = state.pmSection.get(sectionId)
      const sectionStore = state.pmSection.get(sectionId, Map())
      const hasSectionData = sectionStore.has('data')
      const tabs = state.pmSection.getIn([sectionId, 'data', 'data', 'tabs'], List())

      // Get playlist
      const playlistItems = tabs.getIn([0, 'tabContent'], List())

      const language = state.user.getIn(['data', 'language', 0], 'en')
      const hasChildData = itemsHaveData(playlistItems.slice(0, MAX_ROW_ITEMS),
        state.videos, state.series, language)

      return {
        staticText: state.staticText.getIn(['data', 'sectionPlaylist', 'data'], Map()),
        hasSectionData,
        adminTitle: section.getIn(['data', 'adminTitle']),
        sectionId,
        hasPlaylistData: hasSectionData,
        processing: sectionStore.get('processing', false),
        playlistItems,
        language,
        hasChildData,
        videoStore: hasChildData && state.videos,
        seriesStore: hasChildData && state.series,
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
)(SectionPlaylist)
