/* eslint-disable react/no-danger */
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List } from 'immutable'
import _partial from 'lodash/partial'
import _includes from 'lodash/includes'
import { getBoundActions } from 'actions'
import { markdownToHtml } from 'services/markdown'
import Recipe, { DELIMITER } from 'components/Recipe'
import Jumbotron from 'components/Jumbotron'
import CommunityMeta from 'components/CommunityMeta'
import TileRows from 'components/TileRows'
import TileGrid from 'components/TileGrid'
import CommentsLoader from 'components/CommentsLoader'
import DetailSubtitle from 'components/DetailSubtitle'
import {
  STORE_KEY_DETAIL,
  STORE_KEY_EPISODE_DETAIL_NEXT,
  STORE_KEY_DETAIL_EPISODE_RELATED,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_EPISODES_NEXT,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_FEATURED_EPISODE,
} from 'services/store-keys'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import {
  TYPE_CONTENT_EPISODE,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
} from 'services/content-type'
import { TYPE_NEXT_EPISODE, TYPE_RELATED } from 'services/tiles'
import EmbedPdf from 'components/EmbedPdf'
import ProgressBar from 'components/ProgressBar'
import { connect as connectTiles } from 'components/Tiles/connect'
import {
  createUpstreamContext,
  SCREEN_TYPE_DETAIL_VIDEO,
  CONTEXT_TYPE_VIDEO_ENTITY,
} from 'services/upstream-context'
import GaiaLogo, { TYPE_BLACK } from 'components/GaiaLogo'

const TEXT_FORMAT_MARKDOWN = 11
let recipe = ''

function renderDescription (description, id, title, isRecipe) {
  if (!description || typeof description !== 'string') {
    return null
  }

  if (isRecipe) {
    let html
    if (!_includes(description, DELIMITER)) {
      html = markdownToHtml(description)
    } else {
      const markdown = List(description.split(DELIMITER))
      html = markdownToHtml(markdown.get(0, List()))
      recipe = markdown.get(1, '')
    }

    return (
      <React.Fragment>
        <div className="recipe__print-title">{title}</div>
        <div className="detail-episode__recipe-description" dangerouslySetInnerHTML={{ __html: html }} />
        <GaiaLogo type={TYPE_BLACK} className={['detail-episode__gaia-logo']} />
      </React.Fragment>
    )
  }

  // Break the description into paragraphs
  // Filter out all array items that are just whitespace
  const paragraphs = description
    .split(/[\r\n]{1,}/)
    .filter(v => v.replace(/[\s]+/g, '') !== '')
  // eslint-disable-next-line react/no-array-index-key
  return paragraphs.map((element, index) => <p key={`${id}-${index}`}>{element.replace(/[\s]+/g, ' ').trim()}</p>)
}

function renderMetadata (type, host, guest, language, staticText, isRecipe) {
  if (isRecipe) {
    return null
  }

  switch (type) {
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_SEGMENT_MEDITATION: {
      const formattedHost = host ? (
        <div className="detail-episode__meta-item"><span className="detail-episode__meta-item-label">{staticText.get(
          'instructor/Host',
        )}:</span> {host}</div>
      ) : null
      const formattedGuest = guest ? (
        <div className="detail-episode__meta-item"><span className="detail-episode__meta-item-label">{staticText.get(
          'featuring',
        )}:</span> {guest}</div>
      ) : null
      const formattedLanguage = language ? (
        <div className="detail-episode__meta-item"><span className="detail-episode__meta-item-label">{staticText.get(
          'videoLanguage',
        )}:</span> {language}</div>
      ) : null
      return (
        <div className="detail-episode__meta">
          {formattedHost}
          {formattedGuest}
          {formattedLanguage}
        </div>
      )
    }
    default:
      return null
  }
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
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      return (
        <div className="detail-episode__community-meta">
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

function getTilesState (storeKey, props) {
  const { tiles } = props
  return tiles.get(storeKey, Map())
}

function renderTileGrid (props, rowId, title, tileGridClass) {
  const {
    location,
    auth,
    detail,
    setEventSeriesVisited,
    setEventVideoVisited,
  } = props
  const tilesState = getTilesState(rowId, props)
  if (!tilesState.get('data')) {
    return null
  }
  return (
    <TileGrid
      title={title}
      rowId={rowId}
      tileGridClass={tileGridClass}
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

function renderFileAttachments (fileAttachments, staticText, isRecipe) {
  if (!fileAttachments || fileAttachments.size === 0 || isRecipe) {
    return null
  }
  return fileAttachments.map((attachment, index) => {
    if (!attachment.get('description')) {
      return null
    }
    /* eslint-disable react/no-array-index-key */
    return (
      <div
        key={`detail-episode-file-att-${index}`}
        className="detail-episode__file-attachment-wrapper"
      >
        {index === 0 ? (
          <div className="detail-episode__file-attachment-label">
            {staticText.get('supportingMaterials')}:
          </div>
        ) : null}
        <EmbedPdf
          url={attachment.get('url')}
          title={attachment.get('description')}
          className={['detail-episode__file-attachment']}
        />
      </div>
    )
    /* eslint-enable react/no-array-index-key */
  })
}

function renderDetailEpisodeProgressBar (userInfo, duration) {
  if (!userInfo || !duration || !userInfo.get('featurePosition')) {
    return null
  }
  return (
    <div className="detail-episode__progress-bar">
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

function reportEpisodeViewed (props) {
  const { detail, auth, location, page, app, setEventEpisodeVisited } = props
  if (detail.has('id')) {
    setEventEpisodeVisited({
      auth,
      location,
      page,
      id: detail.get('id'),
      app,
    })
  }
}

function resetDisplay (props) {
  const { setCommentsVisible, setShelfVisible, setTilesActiveId } = props
  setShelfVisible(false)
  setTilesActiveId(STORE_KEY_DETAIL_EPISODE_RELATED, null)
  setTilesActiveId(STORE_KEY_EPISODE_DETAIL_NEXT, null)
  setCommentsVisible(false)
}

class DetailEpisode extends PureComponent {
  componentDidMount () {
    updateDisplay(this.props)
    reportEpisodeViewed(this.props)
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
    const { location, detail, shelf, auth, staticText, tileRows, recipeTitle = '' } = props
    const {
      setTilesScrollableTileIndex,
      setTilesScrollableRowWidth,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
      setShelfVisible,
      getShelfData,
      isRecipe,
    } = props
    const data = detail.get('data', Map())
    const tileRowUpstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_DETAIL_VIDEO,
      screenParam: detail.getIn(['data', 'id']),
    })
    const jumbotronUpstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_DETAIL_VIDEO,
      contextType: CONTEXT_TYPE_VIDEO_ENTITY,
      screenParam: detail.getIn(['data', 'id']),
    })
    const description = data.get('description')

    if (!data) {
      return null
    }

    return (
      <article className="detail-episode">
        <Jumbotron
          storeKey={STORE_KEY_DETAIL}
          location={location}
          upstreamContext={jumbotronUpstreamContext}
        />
        <CommentsLoader />
        {renderDetailEpisodeProgressBar(
          data.get('userInfo', Map()),
          data.getIn(['feature', 'duration']),
        )}
        <div className="detail-episode__content">
          <div className="detail-episode__content-container">
            {isRecipe ?
              renderDescription(description, data.get('id'), recipeTitle, isRecipe)
              :
              <div className="detail-episode__description">
                {renderDescription(description, data.get('id'), recipeTitle, isRecipe)}
              </div>
            }
            {recipe !== '' && _includes(description, DELIMITER) ?
              <div className="detail-episode__recipe">
                <Recipe data={data} />
              </div>
              : null}
            {renderCommunityMeta(data, data.getIn(['type', 'content']), props)}
          </div>
          <div className="detail-episode__info">
            {renderMetadata(
              data.getIn(['type', 'content']),
              data.get('host'),
              data.get('guest'),
              data.get('language'),
              staticText,
              isRecipe,
            )}
            {renderFileAttachments(data.get('fileAttachments'), staticText, isRecipe)}
          </div>
        </div>
        <TileRows
          tileRows={tileRows}
          storeKey={STORE_KEY_EPISODE_DETAIL_NEXT}
          shelf={shelf}
          auth={auth}
          location={location}
          setScrollableTileIndex={setTilesScrollableTileIndex}
          setScrollableRowWidth={setTilesScrollableRowWidth}
          setTileRowsActiveId={setTileRowsActiveId}
          setTileRowsRowActiveId={setTileRowsRowActiveId}
          setShelfVisible={setShelfVisible}
          getShelfData={getShelfData}
          upstreamContext={tileRowUpstreamContext}
          useShelfV2
        >
          {renderTileGrid(
            props,
            STORE_KEY_EPISODE_DETAIL_NEXT,
            <DetailSubtitle>{staticText.get('nextEpisodes')}</DetailSubtitle>,
            ['detail-episode__next-episodes'],
          )}
        </TileRows>
        <TileRows
          tileRows={tileRows}
          storeKey={STORE_KEY_DETAIL_EPISODE_RELATED}
          shelf={shelf}
          auth={auth}
          location={location}
          setScrollableTileIndex={setTilesScrollableTileIndex}
          setScrollableRowWidth={setTilesScrollableRowWidth}
          setTileRowsActiveId={setTileRowsActiveId}
          setTileRowsRowActiveId={setTileRowsRowActiveId}
          setShelfVisible={setShelfVisible}
          getShelfData={getShelfData}
          upstreamContext={tileRowUpstreamContext}
          useShelfV2
        >
          {renderTileGrid(
            props,
            STORE_KEY_DETAIL_EPISODE_RELATED,
            <DetailSubtitle>{staticText.get('related')}</DetailSubtitle>,
            ['detail-episode__related'],
          )}
        </TileRows>
      </article>
    )
  }
}

DetailEpisode.propTypes = {
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
    storeKey: STORE_KEY_EPISODE_DETAIL_NEXT,
    type: TYPE_NEXT_EPISODE,
    attachProps: false,
    seriesLink: true,
    enablePageBehaviors: true,
  }),
  connectTiles({
    storeKey: STORE_KEY_DETAIL_EPISODE_RELATED,
    type: TYPE_RELATED,
    attachProps: false,
    enablePageBehaviors: true,
  }),
  connectRedux(
    (state) => {
      const storeKeyList = [
        STORE_KEY_DETAIL_EPISODE_RELATED,
        STORE_KEY_EPISODE_DETAIL_NEXT,
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
        page: state.page,
        app: state.app,
        language: state.user.getIn(['data', 'language'], List()),
        resolver: state.resolver,
        detail: state.detail,
        shelf: state.shelf,
        auth: state.auth,
        comments: state.comments,
        staticText: state.staticText.getIn(
          ['data', 'detailEpisode', 'data'],
          Map(),
        ),
        isRecipe: state.detail.getIn(['data', 'format']) === TEXT_FORMAT_MARKDOWN,
        recipeTitle: state.detail.getIn(['data', 'title'], ''),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
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
        setEventEpisodeVisited: actions.eventTracking.setEventEpisodeVisited,
      }
    },
  ),
)(DetailEpisode)
