import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import _partial from 'lodash/partial'
import _includes from 'lodash/includes'
import { getBoundActions } from 'actions'
import Jumbotron from 'components/Jumbotron'
import CommunityMeta from 'components/CommunityMeta'
import CommentsLoader from 'components/CommentsLoader'
import {
  TYPE_CONTENT_VIDEO,
  TYPE_CONTENT_VIDEO_YOGA,
  TYPE_CONTENT_VIDEO_FITNESS,
  TYPE_CONTENT_VIDEO_MEDITATION,
} from 'services/content-type'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import {
  STORE_KEY_DETAIL,
  STORE_KEY_DETAIL_VIDEO_RELATED,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_EPISODES_NEXT,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_FEATURED_EPISODE,
} from 'services/store-keys'
import { TYPE_RELATED } from 'services/tiles'
import TileRows from 'components/TileRows'
import TileGrid from 'components/TileGrid'
import DetailSubtitle from 'components/DetailSubtitle'
import EmbedPdf from 'components/EmbedPdf'
import ProgressBar from 'components/ProgressBar'
import { connect as connectTiles } from 'components/Tiles/connect'
import {
  SCREEN_TYPE_DETAIL_VIDEO,
  CONTEXT_TYPE_VIDEO_ENTITY,
  createUpstreamContext,
} from 'services/upstream-context'

function renderDescription (description, id) {
  if (!description) {
    return null
  }
  // Break the description into paragraphs
  // Filter out all array items that are just whitespace
  const paragraphs = description
    .split(/[\r\n]{1,}/)
    .filter(v => v.replace(/[\s]+/g, '') !== '')
  /* eslint-disable react/no-array-index-key */
  return paragraphs.map((element, index) => <p key={`${id}-${index}`}>{element.replace(/[\s]+/g, ' ').trim()}</p>)
  /* eslint-enable react/no-array-index-key */
}

function onClickViewAllComments (props, data) {
  const {
    auth,
    comments,
    refreshComments,
    clearUpstreamContext,
  } = props
  clearUpstreamContext()
  refreshComments({
    contentId: data.get('id'),
    commentsId: comments.getIn(['data', 'id']),
    metadata: data.toJS(),
    jwt: auth.get('jwt'),
  })
}

function renderCommunityMeta (data, type, props) {
  const videoId = props.detail.getIn(['data', 'id'])
  const upstreamContext = createUpstreamContext({
    screenType: SCREEN_TYPE_DETAIL_VIDEO,
    contextType: CONTEXT_TYPE_VIDEO_ENTITY,
    screenParam: videoId,
    videoId,
  })
  switch (type) {
    case TYPE_CONTENT_VIDEO:
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_VIDEO_MEDITATION:
      return (
        <div className="detail-video__community-meta">
          <CommunityMeta
            totalComments={data.get('commentTotalCount')}
            onClickViewAllComments={_partial(
              onClickViewAllComments,
              props,
              data,
              upstreamContext,
            )}
          />
        </div>
      )
    default:
      return null
  }
}

function renderTileGrid (props, rowId, title, tileGridClass) {
  const {
    tiles,
    location,
    auth,
    detail,
    setEventSeriesVisited,
    setEventVideoVisited,
  } = props
  const tilesState = tiles.get(STORE_KEY_DETAIL_VIDEO_RELATED, Map())
  if (!tilesState.get('data')) {
    return null
  }

  return (
    <TileGrid
      title={title}
      rowId={rowId}
      tileGridClass={tileGridClass}
      activeTileId={tilesState.get('activeId')}
      tileGridData={tilesState.getIn(['data', 'titles'])}
      displayType={RENDER_TYPE_TILE_GRID_GALLERY}
      moreInfoVisible
      scrollable={false}
      location={location}
      auth={auth}
      setEventSeriesVisited={setEventSeriesVisited}
      setEventVideoVisited={setEventVideoVisited}
      upstreamContext={createUpstreamContext({
        storeKey: rowId,
        screenType: SCREEN_TYPE_DETAIL_VIDEO,
        screenParam: detail.getIn(['data', 'id']),
      })}
    />
  )
}

function renderFileAttachments (fileAttachments, staticText) {
  if (!fileAttachments || fileAttachments.size === 0) {
    return null
  }
  return fileAttachments.map((attachment, index) => {
    if (!attachment.get('description')) {
      return null
    }
    /* eslint-disable react/no-array-index-key */
    return (
      <div
        key={`detail-video-file-att-${index}`}
        className="detail-video__file-attachment-wrapper"
      >
        {index === 0 ? (
          <div className="detail__file-attachment-label">{`${staticText.get(
            'supportingMaterials',
          )}: `}</div>
        ) : null}
        <EmbedPdf
          url={attachment.get('url')}
          title={attachment.get('description')}
          className={['detail-video__file-attachment']}
        />
      </div>
    )
    /* eslint-enable react/no-array-index-key */
  })
}

function renderDetailVideoProgressBar (userInfo, duration) {
  if (!userInfo || !duration || !userInfo.get('featurePosition')) {
    return null
  }
  return (
    <div className="detail-video__progress-bar">
      <ProgressBar duration={duration} userInfo={userInfo} />
    </div>
  )
}

function updateDisplay (props) {
  const { detail } = props
  if (
    !detail.get('placeholderExists') &&
    location.pathname !== detail.get('path')
  ) {
    resetDisplay(props)
  }
}

function resetDisplay (props) {
  const { setCommentsVisible, setShelfVisible, setTilesActiveId } = props
  setShelfVisible(false)
  setTilesActiveId(STORE_KEY_DETAIL_VIDEO_RELATED, null)
  setCommentsVisible(false)
}

class DetailVideo extends PureComponent {
  componentDidMount () {
    updateDisplay(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (!process.env.BROWSER) {
      return
    }
    updateDisplay(nextProps)
  }

  componentWillUnmount () {
    resetDisplay(this.props)
  }

  render () {
    const { props } = this
    const { location, detail, staticText, tileRows, shelf, auth } = props
    const {
      setTilesScrollableTileIndex,
      setTilesScrollableRowWidth,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
      setShelfVisible,
      getShelfData,
    } = props
    const data = detail.get('data')

    if (!data) {
      return null
    }

    return (
      <article className="detail-video">
        <Jumbotron
          storeKey={STORE_KEY_DETAIL}
          location={location}
          upstreamContext={createUpstreamContext({
            screenType: SCREEN_TYPE_DETAIL_VIDEO,
            contextType: 'video-entity',
            screenParam: detail.getIn(['data', 'id']),
          })}
        />
        <CommentsLoader />
        {renderDetailVideoProgressBar(
          data.get('userInfo', Map()),
          data.getIn(['feature', 'duration']),
        )}
        <div className="detail-video__content">
          <div className="detail-video__info">
            {renderDescription(data.get('description'), data.get('id'))}
            {renderFileAttachments(data.get('fileAttachments'), staticText)}
            <div className="detail-video__meta">
              {data.get('guest') ? (
                <div className="detail-video__meta-item"><span className="detail-video__meta-item-label">{staticText.get(
                  'featuring',
                )}:</span> {data.get('guest')}</div>
              ) : null}
            </div>
          </div>
          {renderCommunityMeta(data, data.getIn(['type', 'content']), props)}
        </div>
        <TileRows
          tileRows={tileRows}
          storeKey={STORE_KEY_DETAIL_VIDEO_RELATED}
          shelf={shelf}
          auth={auth}
          location={location}
          setScrollableTileIndex={setTilesScrollableTileIndex}
          setScrollableRowWidth={setTilesScrollableRowWidth}
          setTileRowsActiveId={setTileRowsActiveId}
          setTileRowsRowActiveId={setTileRowsRowActiveId}
          setShelfVisible={setShelfVisible}
          getShelfData={getShelfData}
          upstreamContext={createUpstreamContext({
            screenType: SCREEN_TYPE_DETAIL_VIDEO,
            screenParam: detail.getIn(['data', 'id']),
          })}
          useShelfV2
        >
          {renderTileGrid(
            props,
            STORE_KEY_DETAIL_VIDEO_RELATED,
            <DetailSubtitle>{staticText.get('related')}</DetailSubtitle>,
            ['detail-video__related'],
          )}
        </TileRows>
      </article>
    )
  }
}

DetailVideo.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  tileRows: ImmutablePropTypes.map.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  detail: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  comments: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setTilesActiveId: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  getShelfData: PropTypes.func.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  refreshComments: PropTypes.func.isRequired,
  clearUpstreamContext: PropTypes.func.isRequired,
}

export default compose(
  connectTiles({
    storeKey: STORE_KEY_DETAIL_VIDEO_RELATED,
    type: TYPE_RELATED,
    attachProps: false,
    enablePageBehaviors: true,
  }),
  connectRedux(
    (state) => {
      const storeKeyList = [
        STORE_KEY_DETAIL_VIDEO_RELATED,
        STORE_KEY_SHELF_EPISODES,
        STORE_KEY_SHELF_EPISODES_NEXT,
        STORE_KEY_SHELF_RELATED,
        STORE_KEY_SHELF_FEATURED_EPISODE,
      ]
      const tiles = state.tiles.filter((val, key) => _includes(storeKeyList, key) || key === 'scrollableRowWidth')
      const tileRows = state.tileRows.filter((val, key) => _includes(storeKeyList, key))
      return {
        tiles,
        tileRows,
        resolver: state.resolver,
        detail: state.detail,
        shelf: state.shelf,
        auth: state.auth,
        comments: state.comments,
        staticText: state.staticText.getIn(
          ['data', 'detailVideo', 'data'],
          Map(),
        ),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getTilesData: actions.tiles.getTilesData,
        setTilesActiveId: actions.tiles.setTilesActiveId,
        setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        updateTilesSeasonData: actions.tiles.updateTilesSeasonData,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setShelfVisible: actions.shelf.setShelfVisible,
        getShelfData: actions.shelf.getShelfData,
        setCommentsVisible: actions.comments.setCommentsVisible,
        refreshComments: actions.comments.refreshComments,
        setEventVideoVisited: actions.eventTracking.setEventVideoVisited,
        setEventSeriesVisited: actions.eventTracking.setEventSeriesVisited,
        clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
      }
    },
  ),
)(DetailVideo)
