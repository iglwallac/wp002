import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ShelfTabs from 'components/ShelfTabs'
import ShelfPane from 'components/ShelfPane'
import Icon from 'components/Icon'
import ShelfPlaceholder from 'components/ShelfPlaceholder'
import HeroImage from 'components/HeroImage'
import ScrollTo from 'components/ScrollTo'
import _partial from 'lodash/partial'
import { List } from 'immutable'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import { requestAnimationFrame } from 'services/animate'
import {
  TYPE_PLACEHOLDER,
  TYPE_PRODUCT_SINGLE,
  TYPE_PRODUCT_EPISODIC,
  TYPE_PRODUCT_SEGMENTED,
} from 'services/content-type'
import { ANIMATION_STATES } from 'services/shelf/constants'
import { getClassName, getShelfComments, updateCommentsIfOpen } from './utils'

class Shelf extends PureComponent {
  componentDidMount () {
    this.updateAnimationState()
  }

  componentWillReceiveProps (nextProps) {
    const previousShelf = this.props.shelf
    const nextShelf = nextProps.shelf
    const commentsVisible = nextProps.comments.get('visible', false)
    const commentsId = nextProps.comments.getIn(['metadata', 'id'])

    if (
      previousShelf.get('processing') === true &&
      nextShelf.get('processing') === false
    ) {
      updateCommentsIfOpen(nextProps, commentsVisible, commentsId)
    }
  }

  componentDidUpdate () {
    const { shelf } = this.props
    const isProcessing = shelf.get('processing', false)
    const animationState = shelf.get('animationState', ANIMATION_STATES.NONE)
    const isLoaded =
      isProcessing !== true && animationState === ANIMATION_STATES.FINISHED
    // eslint-disable-next-line react/no-string-refs
    const rootElement = this.refs.rootElement

    if (isLoaded && rootElement.classList.contains('shelf-v2--loaded') !== true) {
      requestAnimationFrame(() => {
        rootElement.classList.add('shelf-v2--loaded')
      })
    }
  }

  componentWillUnmount () {
    const { setShelfAnimationState } = this.props
    setShelfAnimationState(ANIMATION_STATES.NONE)
  }

  // eslint-disable-next-line class-methods-use-this
  onRefScrollToComponent (componentInstance, component) {
    // eslint-disable-next-line no-param-reassign
    componentInstance._scrollToComponent = component
  }

  updateAnimationState () {
    const { setShelfAnimationState, shelf } = this.props
    let state = shelf.get('animationState', ANIMATION_STATES.NONE)

    switch (state) {
      case ANIMATION_STATES.NONE:
        state = ANIMATION_STATES.SCROLL
        break
      case ANIMATION_STATES.SCROLL:
      default:
        state = ANIMATION_STATES.FINISHED
    }

    setShelfAnimationState(state)
  }

  renderScrollTo () {
    const { shelf } = this.props
    const state = shelf.get('animationState', ANIMATION_STATES.NONE)

    if (state === ANIMATION_STATES.SCROLL) {
      return (
        <ScrollTo
          ref={_partial(this.onRefScrollToComponent, this)}
          finish={() => {
            this.updateAnimationState()
          }}
          duration={500}
          offset={-210}
          runOnMount
          easing="easeOutQuart"
        />
      )
    }
    return null
  }

  renderHeroImage () {
    const { shelf } = this.props

    const data = shelf.get('data')
    const contentType = data.getIn(['type', 'content'])
    const state = shelf.get('animationState', ANIMATION_STATES.NONE)

    if (
      contentType !== TYPE_PLACEHOLDER &&
      state === ANIMATION_STATES.FINISHED
    ) {
      return (
        <HeroImage
          className={['shelf-v2__background-hero']}
          hasOverlay
          smallUrl={data.getIn(['backgroundImage', 'small'])}
          mediumSmallUrl={data.getIn(['backgroundImage', 'mediumSmall'])}
          mediumUrl={data.getIn(['backgroundImage', 'medium'])}
          largeUrl={data.getIn(['backgroundImage', 'large'])}
        />
      )
    }
    return null
  }

  renderIconClose () {
    const { shelf, onClickClose } = this.props

    const data = shelf.get('data')
    const contentType = data.getIn(['type', 'content'])
    const state = shelf.get('animationState', ANIMATION_STATES.NONE)

    if (contentType === TYPE_PLACEHOLDER) {
      return <div className="shelf_icon-close-placholder" />
    }

    if (state === ANIMATION_STATES.FINISHED) {
      return (
        <Icon
          iconClass={['icon--close', 'icon--white', 'shelf-v2__close-icon']}
          onClick={onClickClose}
        />
      )
    }
    return null
  }

  renderShelfPane () {
    const { shelf } = this.props
    const state = shelf.get('animationState', ANIMATION_STATES.NONE)
    const isShareable = shelf.getIn(['data', 'feature', 'shareAllowed'], false)

    if (state === ANIMATION_STATES.FINISHED) {
      const {
        app,
        auth,
        location,
        tiles,
        page,
        setEventShelfExpanded,
        comments,
        setOverlayDialogVisible,
        setTilesScrollableTileIndex,
        setTilesScrollableRowWidth,
        updateTilesSeasonData,
        setShelfDataUserPlaylist,
        getTilesData,
        upstreamContext,
        clearUpstreamContext,
        showHideContentButton,
        onClickClose,
      } = this.props

      const data = shelf.get('data')
      const commentsId = comments.getIn(['metadata', 'id'])
      const getShelfCommentsPartial = _partial(
        getShelfComments,
        this.props,
        data,
        commentsId,
      )

      return (
        <ShelfPane
          id={data.get('id')}
          shelf={shelf}
          tiles={tiles}
          auth={auth}
          page={page}
          app={app}
          isShareable={isShareable}
          location={location}
          setEventShelfExpanded={setEventShelfExpanded}
          setOverlayDialogVisible={setOverlayDialogVisible}
          setTilesScrollableTileIndex={setTilesScrollableTileIndex}
          setTilesScrollableRowWidth={setTilesScrollableRowWidth}
          updateTilesSeasonData={updateTilesSeasonData}
          setShelfDataUserPlaylist={setShelfDataUserPlaylist}
          getComments={getShelfCommentsPartial}
          getTilesData={getTilesData}
          upstreamContext={upstreamContext}
          clearUpstreamContext={clearUpstreamContext}
          v2
          showHideContentButton={showHideContentButton}
          onClickClose={onClickClose}
        />
      )
    }
    return null
  }

  renderShelfContent () {
    return (
      <div className="shelf-v2__content">
        {this.renderScrollTo()}
        {this.renderHeroImage()}
        <div className="shelf-v2__wrapper">
          {this.renderIconClose()}
          {this.renderShelfPane()}
        </div>
      </div>
    )
  }

  renderShelfTabs () {
    const props = this.props
    const contentType = props.shelf.getIn(['data', 'type', 'content'])
    const productType = props.shelf.getIn(['data', 'type', 'product'])
    const showRelatedTab =
      productType !== TYPE_PRODUCT_EPISODIC &&
      productType !== TYPE_PRODUCT_SEGMENTED

    return (
      <ShelfTabs
        shelf={props.shelf}
        tiles={props.tiles}
        auth={props.auth}
        contentType={contentType}
        showRelatedTab={showRelatedTab}
        showEpisodeTab={
          props.shelf.getIn(['data', 'type', 'product']) !== TYPE_PRODUCT_SINGLE
        }
        seriesId={props.shelf.getIn(['data', 'seriesId'])}
        getTilesData={props.getTilesData}
        activeTab={props.shelf.get('activeTab')}
        setShelfActiveTab={props.setShelfActiveTab}
        getTilesSeriesData={props.getTilesSeriesData}
        getTilesEpisodeData={props.getTilesEpisodeData}
        location={props.location}
        setOverlayDialogVisible={props.setOverlayDialogVisible}
      />
    )
  }

  render () {
    const isVisible = this.props.shelf.get('visible')
    const className = getClassName(this.props.className, isVisible)
    return (
      <div className="shelfV2-outer">
        {/* eslint-disable-next-line react/no-string-refs */}
        <div ref="rootElement" className={className}>
          <ShelfPlaceholder />
          {this.renderShelfContent()}
          {this.renderShelfTabs()}
        </div>
      </div>
    )
  }
}

Shelf.propTypes = {
  shelf: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  app: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  setShelfActiveTab: PropTypes.func.isRequired,
  getTilesData: PropTypes.func.isRequired,
  className: PropTypes.array,
  onClickClose: PropTypes.func,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  setShelfDataUserPlaylist: PropTypes.func,
  getTilesSeriesData: PropTypes.func.isRequired,
  getTilesEpisodeData: PropTypes.func.isRequired,
  updateTilesSeasonData: PropTypes.func.isRequired,
  refreshComments: PropTypes.func.isRequired,
  comments: ImmutablePropTypes.map.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  setEventShelfExpanded: PropTypes.func,
  setShelfAnimationState: PropTypes.func.isRequired,
  upstreamContext: ImmutablePropTypes.map,
  clearUpstreamContext: PropTypes.func.isRequired,
}

export default connect(
  state => ({
    shelf: state.shelf,
    tiles: state.tiles,
    auth: state.auth,
    app: state.app,
    comments: state.comments,
    page: state.page,
    language: state.user.getIn(['data', 'language'], List()),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setShelfActiveTab: actions.shelf.setShelfActiveTab,
      getTilesData: actions.tiles.getTilesData,
      setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      setShelfDataUserPlaylist: actions.shelf.setShelfDataUserPlaylist,
      getTilesSeriesData: actions.tiles.getTilesSeriesData,
      getTilesEpisodeData: actions.tiles.getTilesEpisodeData,
      updateTilesSeasonData: actions.tiles.updateTilesSeasonData,
      refreshComments: actions.comments.refreshComments,
      setCommentsVisible: actions.comments.setCommentsVisible,
      setEventShelfExpanded: actions.eventTracking.setEventShelfExpanded,
      setShelfAnimationState: actions.shelf.setShelfAnimationState,
      clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
    }
  },
)(Shelf)
