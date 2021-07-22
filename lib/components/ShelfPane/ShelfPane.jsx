import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Loadable from 'react-loadable'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import { Map } from 'immutable'
import ButtonAdmin, {
  BUTTON_ADMIN_ALIGN_RIGHT_BOTTOM,
} from 'components/ButtonAdmin'
import { TILE_ROW_WIDTH_LARGE } from 'components/TileGrid'
import ToolTipArrow, { DIRECTION_LEFT } from 'components/ToolTipArrow'
import {
  isTypeVideo,
  isTypeYogaFitnessVideo,
  isTypeEpisode,
  isTypeYogaFitnessEpisode,
  isTypeSeries,
  isTypeYogaFitnessSeries,
} from 'services/content-type'

import {
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_FEATURED_EPISODE,
  STORE_KEY_SHELF_EPISODES_NEXT,
} from 'services/store-keys'
import { TYPE_TAB_EPISODES, TYPE_TAB_RELATED } from 'services/shelf'
import { CUSTOM_ROW_CLICK_EVENT } from 'services/event-tracking'
import {
  updateUpstreamContextFromObject,
  CONTEXT_TYPE_SHELF_VIDEO_ENTITY,
  CONTEXT_TYPE_SHELF_SERIES_ENTITY,
  CONTEXT_TYPE_SHELF_NEXT_VIDEOS_LIST,
  CONTEXT_TYPE_SHELF_RELATED_VIDEOS_LIST,
  CONTEXT_TYPE_SHELF_SEASON_EPISODES_LIST,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'

import { getTilesState } from './utils'

const LoadableShelfVideo = Loadable({
  loader: () => import('components/ShelfVideo'),
  loading: () => null,
})
const LoadableShelfVideoV2 = Loadable({
  loader: () => import('components/ShelfVideo.v2'),
  loading: () => null,
})
const LoadableShelfEpisode = Loadable({
  loader: () => import('components/ShelfEpisode'),
  loading: () => null,
})
const LoadableShelfEpisodeV2 = Loadable({
  loader: () => import('components/ShelfEpisode.v2'),
  loading: () => null,
})
const LoadableShelfSeries = Loadable({
  loader: () => import('components/ShelfSeries'),
  loading: () => null,
})
const LoadableShelfSeriesV2 = Loadable({
  loader: () => import('components/ShelfSeries.v2'),
  loading: () => null,
})
const LoadableShelfEpisodes = Loadable({
  loader: () => import('components/ShelfEpisodes'),
  loading: () => null,
})
const LoadableShelfNextEpisodes = Loadable({
  loader: () => import('components/ShelfNextEpisodes'),
  loading: () => null,
})
const LoadableShelfRelated = Loadable({
  loader: () => import('components/ShelfRelated'),
  loading: () => null,
})

/**
 * Shelf pane stateless component.
 * @param props
 * @returns {JSX}
 */
class ShelfPane extends PureComponent {
  setAnimationComponent = (component) => {
    this._animationComponent = component
  }

  renderPlaylistAddRemove ({ upstreamContext }) {
    const props = this.props
    const { auth, shelf } = props
    if (!auth.get('jwt')) {
      return null
    }
    const data = shelf.get('data')
    const type = shelf.getIn(['data', 'type', 'content'])
    const eventData = CUSTOM_ROW_CLICK_EVENT
      .set('eventLabel', upstreamContext.get(CONTEXT_NAME_ADMIN_TITLE))
      .set('contentInfo', `${data.get('title')} | ${type} | ${data.get('id')}`)
    return (
      <React.Fragment>
        <PlaylistAddRemove
          contentId={shelf.get('id')}
          upstreamContext={upstreamContext}
          merchEventData={eventData}
          circlularIcon
        />
        <ToolTipArrow
          direction={DIRECTION_LEFT}
          activeArrow="add-to-playlist-arrow"
        />
      </React.Fragment>
    )
  }

  renderShelfPaneOverview () {
    const props = this.props
    const {
      id,
      auth,
      shelf,
      tiles,
      location,
      getComments,
      getTilesData,
      upstreamContext,
      clearUpstreamContext,
      isShareable,
      v2,
      showHideContentButton,
      onClickClose,
    } = props

    const type = shelf.getIn(['data', 'type', 'content'])
    let aggregateUpstreamContext = upstreamContext
    if (isTypeVideo(type) || isTypeYogaFitnessVideo(type)) {
      aggregateUpstreamContext = updateUpstreamContextFromObject(upstreamContext, {
        shelfParam: id,
        videoId: id,
        contextType: CONTEXT_TYPE_SHELF_VIDEO_ENTITY,
      })
      return (
        v2 ?
          <LoadableShelfVideoV2
            id={id}
            shelf={shelf}
            auth={auth}
            isShareable={isShareable}
            location={location}
            playlistAddRemoveComponent={this.renderPlaylistAddRemove({
              upstreamContext: aggregateUpstreamContext,
            })}
            getComments={getComments}
            upstreamContext={aggregateUpstreamContext}
            clearUpstreamContext={clearUpstreamContext}
            showHideContentButton={showHideContentButton}
            onClickClose={onClickClose}
          />
          :
          <LoadableShelfVideo
            id={id}
            shelf={shelf}
            auth={auth}
            isShareable={isShareable}
            location={location}
            playlistAddRemoveComponent={this.renderPlaylistAddRemove({
              upstreamContext: aggregateUpstreamContext,
            })}
            getComments={getComments}
            upstreamContext={aggregateUpstreamContext}
            clearUpstreamContext={clearUpstreamContext}
            showHideContentButton={showHideContentButton}
            onClickClose={onClickClose}
          />
      )
    }

    if (isTypeEpisode(type) || isTypeYogaFitnessEpisode(type)) {
      aggregateUpstreamContext = updateUpstreamContextFromObject(upstreamContext, {
        shelfParam: id,
        videoId: id,
        contextType: CONTEXT_TYPE_SHELF_VIDEO_ENTITY,
      })
      return (
        v2 ?
          <LoadableShelfEpisodeV2
            id={id}
            shelf={shelf}
            auth={auth}
            isShareable={isShareable}
            location={location}
            playlistAddRemoveComponent={this.renderPlaylistAddRemove({
              upstreamContext: aggregateUpstreamContext,
            })}
            getComments={getComments}
            upstreamContext={aggregateUpstreamContext}
            clearUpstreamContext={clearUpstreamContext}
            showHideContentButton={showHideContentButton}
            onClickClose={onClickClose}
          />
          :
          <LoadableShelfEpisode
            id={id}
            shelf={shelf}
            auth={auth}
            isShareable={isShareable}
            location={location}
            playlistAddRemoveComponent={this.renderPlaylistAddRemove({
              upstreamContext: aggregateUpstreamContext,
            })}
            getComments={getComments}
            upstreamContext={aggregateUpstreamContext}
            clearUpstreamContext={clearUpstreamContext}
            showHideContentButton={showHideContentButton}
            onClickClose={onClickClose}
          />
      )
    }

    if (isTypeSeries(type) || isTypeYogaFitnessSeries(type)) {
      aggregateUpstreamContext = updateUpstreamContextFromObject(upstreamContext, {
        shelfParam: id,
        seriesId: id,
        contextType: CONTEXT_TYPE_SHELF_SERIES_ENTITY,
      })

      return (
        v2 ?
          <LoadableShelfSeriesV2
            id={id}
            shelf={shelf}
            auth={auth}
            location={location}
            featuredEpisode={tiles.get(
              STORE_KEY_SHELF_FEATURED_EPISODE,
              Map(),
            )}
            getComments={getComments}
            getTilesData={getTilesData}
            upstreamContext={aggregateUpstreamContext}
            clearUpstreamContext={clearUpstreamContext}
            showHideContentButton={showHideContentButton}
            onClickClose={onClickClose}
          />
          :
          <LoadableShelfSeries
            id={id}
            shelf={shelf}
            auth={auth}
            location={location}
            featuredEpisode={tiles.get(
              STORE_KEY_SHELF_FEATURED_EPISODE,
              Map(),
            )}
            getComments={getComments}
            getTilesData={getTilesData}
            upstreamContext={aggregateUpstreamContext}
            clearUpstreamContext={clearUpstreamContext}
            showHideContentButton={showHideContentButton}
            onClickClose={onClickClose}
          />
      )
    }
    return null
  }

  renderShelfPaneEpisodes () {
    const props = this.props
    const {
      id,
      auth,
      shelf,
      tiles,
      location,
      upstreamContext,
      updateTilesSeasonData,
      setTilesScrollableRowWidth,
      setTilesScrollableTileIndex,
      onClickClose,
    } = props
    const type = props.shelf.getIn(['data', 'type', 'content'])

    if (isTypeEpisode(type) || isTypeYogaFitnessEpisode(type)) {
      const scrollableTileIndex = props.tiles.getIn(
        [STORE_KEY_SHELF_EPISODES_NEXT, 'data', 'scrollableTileIndex'],
        0,
      )
      const scrollableRowWidth = props.tiles.get(
        'scrollableRowWidth',
        TILE_ROW_WIDTH_LARGE,
      )

      return (
        <LoadableShelfNextEpisodes
          id={id}
          shelf={shelf}
          tiles={getTilesState(props, STORE_KEY_SHELF_EPISODES_NEXT)}
          auth={auth}
          location={location}
          scrollableTileIndex={scrollableTileIndex}
          scrollableRowWidth={scrollableRowWidth}
          updateTilesSeasonData={updateTilesSeasonData}
          setTilesScrollableTileIndex={setTilesScrollableTileIndex}
          setTilesScrollableRowWidth={setTilesScrollableRowWidth}
          upstreamContext={updateUpstreamContextFromObject(upstreamContext, {
            contextType: CONTEXT_TYPE_SHELF_NEXT_VIDEOS_LIST,
            shelfParam: id,
          })}
          onClickClose={onClickClose}
        />
      )
    }

    if (isTypeSeries(type) || isTypeYogaFitnessSeries(type)) {
      const scrollableTileIndex = tiles.getIn(
        [STORE_KEY_SHELF_EPISODES, 'data', 'scrollableTileIndex'],
        0,
      )
      const scrollableRowWidth = tiles.get(
        'scrollableRowWidth',
        TILE_ROW_WIDTH_LARGE,
      )
      const episodesTiles = getTilesState(props, STORE_KEY_SHELF_EPISODES)
      return (
        <LoadableShelfEpisodes
          id={id}
          shelf={shelf}
          tiles={episodesTiles}
          auth={auth}
          location={location}
          scrollableTileIndex={scrollableTileIndex}
          scrollableRowWidth={scrollableRowWidth}
          updateTilesSeasonData={updateTilesSeasonData}
          setTilesScrollableTileIndex={setTilesScrollableTileIndex}
          setTilesScrollableRowWidth={setTilesScrollableRowWidth}
          upstreamContext={updateUpstreamContextFromObject(upstreamContext, {
            contextType: CONTEXT_TYPE_SHELF_SEASON_EPISODES_LIST,
            shelfParam: id,
            seasonNum: episodesTiles.get('season', null),
          })}
          onClickClose={onClickClose}
        />
      )
    }
    return null
  }

  renderShelfPaneRelated () {
    const props = this.props
    const {
      id,
      auth,
      shelf,
      location,
      upstreamContext,
      setTilesScrollableRowWidth,
      setTilesScrollableTileIndex,
    } = props
    const type = props.shelf.getIn(['data', 'type', 'content'])

    if (
      isTypeVideo(type) ||
      isTypeYogaFitnessVideo(type) ||
      isTypeEpisode(type) ||
      isTypeYogaFitnessEpisode(type) ||
      isTypeSeries(type) ||
      isTypeYogaFitnessSeries(type)
    ) {
      const scrollableTileIndex = props.tiles.getIn(
        [STORE_KEY_SHELF_RELATED, 'data', 'scrollableTileIndex'],
        0,
      )
      const scrollableRowWidth = props.tiles.get(
        'scrollableRowWidth',
        TILE_ROW_WIDTH_LARGE,
      )

      return (
        <LoadableShelfRelated
          id={id}
          shelf={shelf}
          tiles={getTilesState(props, STORE_KEY_SHELF_RELATED)}
          auth={auth}
          location={location}
          scrollableTileIndex={scrollableTileIndex}
          scrollableRowWidth={scrollableRowWidth}
          setTilesScrollableTileIndex={setTilesScrollableTileIndex}
          setTilesScrollableRowWidth={setTilesScrollableRowWidth}
          upstreamContext={updateUpstreamContextFromObject(upstreamContext, {
            contextType: CONTEXT_TYPE_SHELF_RELATED_VIDEOS_LIST,
            shelfParam: id,
          })}
        />
      )
    }
    return null
  }

  renderChild () {
    switch (this.props.shelf.get('activeTab')) {
      case TYPE_TAB_EPISODES:
        return this.renderShelfPaneEpisodes()
      case TYPE_TAB_RELATED:
        return this.renderShelfPaneRelated()
      default:
        return this.renderShelfPaneOverview()
    }
  }

  render () {
    const props = this.props
    const { auth, type } = props
    return (
      <div className="shelf__pane">
        {this.renderChild(props)}
        <ButtonAdmin
          auth={auth}
          id={parseInt(props.shelf.get('id'), 10)}
          align={BUTTON_ADMIN_ALIGN_RIGHT_BOTTOM}
          type={type}
        />
      </div>
    )
  }
}

/**
 * Define the prop types
 */
ShelfPane.propTypes = {
  shelf: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  app: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  setShelfDataUserPlaylist: PropTypes.func,
  updateTilesSeasonData: PropTypes.func.isRequired,
  getComments: PropTypes.func.isRequired,
  getTilesData: PropTypes.func.isRequired,
  upstreamContext: ImmutablePropTypes.map,
  clearUpstreamContext: PropTypes.func.isRequired,
}

export default ShelfPane
