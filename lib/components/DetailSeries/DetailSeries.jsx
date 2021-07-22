import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, Map } from 'immutable'
import { getBoundActions } from 'actions'
import _partial from 'lodash/partial'
import _assign from 'lodash/assign'
import _get from 'lodash/get'
import _concat from 'lodash/concat'
import _includes from 'lodash/includes'
import { TYPE_FEATURED_EPISODE, TYPE_SERIES_SEASON, TYPE_SERIES_EPISODES } from 'services/tiles'
import {
  STORE_KEY_DETAIL_SERIES,
  STORE_KEY_DETAIL,
  STORE_KEY_DETAIL_FEATURED_EPISODE,
  STORE_KEY_DETAIL_SERIES_SEASON,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_EPISODES_NEXT,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_FEATURED_EPISODE,
} from 'services/store-keys'
import {
  historyRedirect,
  HISTORY_METHOD_REPLACE,
} from 'services/navigation'
import Title from 'components/Title'
import Button from 'components/Button'
import Jumbotron from 'components/Jumbotron'
import Vote, { SIZE_LARGE as VOTE_SIZE_LARGE } from 'components/Vote'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import TileRows from 'components/TileRows'
import TileGrid from 'components/TileGrid'
import Tile from 'components/Tile'
import DetailSubtitle from 'components/DetailSubtitle'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import LoadMore from 'components/LoadMore'
import BackToTop from 'components/BackToTop'
import CommentsLoader from 'components/CommentsLoader'
import EmbedPdf from 'components/EmbedPdf'
import WatchAccess from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import { connect as connectTiles } from 'components/Tiles/connect'
import {
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_SERIES_YOGA,
  TYPE_CONTENT_SERIES_FITNESS,
  TYPE_CONTENT_SERIES_MEDITATION,
  TYPE_CONTENT_SEGMENTED,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
  isTypeSeriesAll,
  isTypeVideoAll,
  isTypeEpisodeAll,
} from 'services/content-type'
import InlineSeasonNav from 'components/InlineSeasonNav'
import {
  createUpstreamContext,
  SCREEN_TYPE_DETAIL_SERIES,
  SCREEN_TYPE_DETAIL_VIDEO,
} from 'services/upstream-context'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import WithAuth from 'components/WithAuth'
import { H5, HEADING_TYPES } from 'components/Heading'

const SEASON_DROPDOWN = 'season-dropdown'
const SEASON_LINK = 'season-link'


function isShow (path) {
  return path.indexOf('show') === 1
}

function renderTitle (type, titleText) {
  switch (type) {
    case TYPE_CONTENT_SERIES:
    case TYPE_CONTENT_SERIES_YOGA:
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      return <Title text={titleText} className={['detail-series__title']} />
    default:
      return null
  }
}

function renderSeriesMeta (totalSeasons, totalEpisodes, staticText) {
  return (
    <H5 as={HEADING_TYPES.H6} className="detail-series__series-meta">
      {totalSeasons}{' '}
      {totalSeasons > 1
        ? staticText.getIn(['data', 'seasons'])
        : staticText.getIn(['data', 'season'])},{' '}
      {`${totalEpisodes} ${staticText.getIn(['data', 'episodes'])}`}
    </H5>
  )
}

function renderDescription (description, id) {
  if (!description) {
    return null
  }
  // Break the description into paragraphs
  // Filter out all array items that are just whitespace
  const paragraphs = description
    .split(/[\r\n]{1,}/)
    .filter(v => v.replace(/[\s]+/g, '') !== '')
  // eslint-disable-next-line react/no-array-index-key
  return paragraphs.map((element, index) => <p className="detail-series__description" key={`${id}-${index}`}>{element.replace(/[\s]+/g, ' ').trim()}</p>)
}

function renderPreview (detail, auth, staticText) {
  const path = detail.get('path')
  const preview = detail.getIn(['data', 'preview'], Map())
  if (preview.get('id') < 0) {
    return null
  }
  return (
    <WatchAccess
      preview={preview}
      feature={preview}
      auth={auth}
    >
      <WatchAccessAllowed>
        <Button
          text={staticText.getIn(['data', 'watchPreview'])}
          url={path}
          query={{ fullplayer: 'preview' }}
          iconClass={['icon-v2--preview']}
          buttonClass={[
            'button--with-icon',
            'detail-series__preview-button',
          ]}
        />
      </WatchAccessAllowed>
    </WatchAccess>
  )
}

function renderActionItems (
  type,
  vote,
  voteDown,
  voteId,
  auth,
  staticText,
) {
  switch (type) {
    case TYPE_CONTENT_SERIES:
    case TYPE_CONTENT_SERIES_YOGA:
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      return (
        <div className="detail-series__actions">
          <div className="detail-series__action-item">
            <Vote
              size={VOTE_SIZE_LARGE}
              vote={vote}
              voteDown={voteDown}
              text={staticText.getIn(['data', 'recommend'])}
              className="vote--series-detail"
              voteId={voteId}
              auth={auth}
            />
          </div>
        </div>
      )
    default:
      return null
  }
}

function renderCommentsLink (type, commentsCount, staticText, onCommentsClick) {
  switch (type) {
    case TYPE_CONTENT_SERIES:
    case TYPE_CONTENT_SERIES_YOGA:
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      return (
        <Link
          to={URL_JAVASCRIPT_VOID}
          onClick={onCommentsClick}
          className="detail-series__comments-link"
        >{`${staticText.getIn([
            'data',
            'viewAll',
          ])} ${commentsCount} ${staticText.getIn(['data', 'comments'])}`}</Link>
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
    detail,
    setEventSeriesVisited,
    setEventVideoVisited,
  } = props
  const tilesState = getTilesState(rowId, props)
  if (!tilesState.get('data')) {
    return null
  }
  const seasonNum = tilesState.get('season', 1)

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
      location={props.location}
      auth={props.auth}
      setEventSeriesVisited={setEventSeriesVisited}
      setEventVideoVisited={setEventVideoVisited}
      upstreamContext={createUpstreamContext({
        storeKey: rowId,
        screenType: SCREEN_TYPE_DETAIL_SERIES,
        screenParam: detail.getIn(['data', 'id']),
        seasonNum,
      })}
    />
  )
}

function renderProductionStatusNotice ({ language, text }) {
  if (!text || !language.contains('en')) {
    return null
  }

  return (
    <div className="detail-series__production-status-notice">{text}</div>
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
        key={`detail-episode-file-att-${index}`}
        className="detail-series__file-attachment-wrapper"
      >
        {index === 0 ? (
          <div className="detail-series__file-attachment-label">{`${staticText.getIn(
            ['data', 'supportingMaterials'],
          )}:`}</div>
        ) : null}
        <EmbedPdf
          url={attachment.get('url')}
          title={attachment.get('description')}
          className={['detail-series__file-attachment']}
        />
      </div>
    )
    /* eslint-enable react/no-array-index-key */
  })
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
  const { setShelfVisible, setTilesActiveId, setCommentsVisible } = props
  setShelfVisible(false)
  setTilesActiveId(STORE_KEY_DETAIL_SERIES_SEASON, null)
  setCommentsVisible(false)
}

class DetailSeries extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      impressionsTracked: false,
    }
  }

  componentDidMount () {
    updateDisplay(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const { state, trackImpressions } = this
    if (!process.env.BROWSER) {
      return
    }
    updateDisplay(nextProps)

    const featuredEpisodeData = nextProps.tiles.getIn(
      [STORE_KEY_DETAIL_FEATURED_EPISODE, 'data', 'titles', 0],
      Map(),
    )

    if (
      featuredEpisodeData &&
      featuredEpisodeData.get('featuredTileCampaignId') &&
      state.impressionsTracked === false
    ) {
      trackImpressions(nextProps, featuredEpisodeData)
    }
  }

  componentWillUnmount () {
    resetDisplay(this.props)
  }

  onClickSeasonLink = (e) => {
    const {
      historyRedirectOnSeasonChange,
    } = this
    const season = e.target.getAttribute('data-season')

    historyRedirectOnSeasonChange(season)
  }

  trackImpressions = (props, featuredEpisodeData) => {
    const {
      auth,
      detail,
      setEventVideoImpressed,
      setEventSeriesImpressed,
      clearUpstreamContext,
      app,
      page,
      language,
    } = props

    const campaignId = featuredEpisodeData.get('featuredTileCampaignId')
    const id = featuredEpisodeData.get('id')
    const type = featuredEpisodeData.get('contentType')

    const upstreamContextSeries = createUpstreamContext({
      storeKey: STORE_KEY_DETAIL_FEATURED_EPISODE,
      screenType: SCREEN_TYPE_DETAIL_SERIES,
      screenParam: detail.getIn(['data', 'id']),
      campaignId,
      seriesId: id,
    })

    const upstreamContextVideo = createUpstreamContext({
      storeKey: STORE_KEY_DETAIL_FEATURED_EPISODE,
      screenType: SCREEN_TYPE_DETAIL_VIDEO,
      screenParam: detail.getIn(['data', 'id']),
      campaignId,
      videoId: id,
    })

    if (featuredEpisodeData.get('featuredTileType') === 'merchandising-campaign') {
      if (isTypeVideoAll(type) || isTypeEpisodeAll(type)) {
        setEventVideoImpressed({
          auth,
          location,
          page,
          app,
          upstreamContext: upstreamContextVideo,
          language,
        })
        clearUpstreamContext()
      }
      if (isTypeSeriesAll(type)) {
        setEventSeriesImpressed({
          auth,
          location,
          page,
          app,
          upstreamContext: upstreamContextSeries,
          language,
        })
        clearUpstreamContext()
      }
      this.setState({ impressionsTracked: true })
    }
  }

  historyRedirectOnSeasonChange = (season) => {
    const { props } = this
    const { history, location, auth, language } = props
    const { pathname, query } = location

    // If season is in the query do a replace so we don't get a a confusing history.
    const historyMethod = _get(location, ['query', 'season'])
      ? HISTORY_METHOD_REPLACE
      : undefined
    historyRedirect({
      history,
      url: pathname,
      query: _assign({}, query, { season }),
      auth,
      language,
      historyMethod,
    })
  }

  renderSeasonsFilter = () => {
    const {
      props,
      onClickSeasonLink,
    } = this
    const {
      detail,
      staticText,
      getDetailSeriesSeason,
    } = props

    const tileSeason = getDetailSeriesSeason()
    const seasons = detail
      .getIn(['data', 'seasonNums'], List())
      .reduce((list, seasonNumber) => {
        const season = Map({
          name: `${staticText.getIn(['data', 'season'])} ${seasonNumber}`,
          value: seasonNumber,
          element: SEASON_DROPDOWN,
        })
        return list.push(season)
      }, List())

    const defaultOption = seasons.find(season => season.get('value') === tileSeason) || Map()

    return (
      <div className="detail-series__season-filter-wrapper">
        <InlineSeasonNav
          seasons={seasons}
          element={SEASON_LINK}
          onClickSeasonLink={onClickSeasonLink}
          currentSeason={defaultOption.get('value', null)}
        />
      </div>
    )
  }

  renderFeaturedEpisode = () => {
    const { props } = this

    const {
      auth,
      tiles,
      detail,
      setEventVideoVisited,
      setEventSeriesVisited,
    } = props

    const featuredEpisodeData = tiles.getIn(
      [STORE_KEY_DETAIL_FEATURED_EPISODE, 'data', 'titles', 0],
      null,
    )

    if (!featuredEpisodeData || !featuredEpisodeData.count()) {
      return null
    }

    const upstreamContext = createUpstreamContext({
      storeKey: STORE_KEY_DETAIL_FEATURED_EPISODE,
      screenType: SCREEN_TYPE_DETAIL_SERIES,
      screenParam: detail.getIn(['data', 'id']),
    })


    return (
      <div className="detail-series__featured-episode">
        <Tile
          single
          auth={auth}
          tileData={featuredEpisodeData}
          showMoreInfo={false}
          setEventVideoVisited={setEventVideoVisited}
          setEventSeriesVisited={setEventSeriesVisited}
          upstreamContext={upstreamContext}
        />
      </div>
    )
  }

  render () {
    const {
      props,
      renderSeasonsFilter,
      renderFeaturedEpisode,
    } = this
    const {
      detail,
      resolver,
      location,
      auth,
      tileRows,
      shelf,
      staticText,
      language,
    } = props
    const { getTilesDataLoadMore } = props
    const {
      setTilesScrollableTileIndex,
      setTilesScrollableRowWidth,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
      setShelfVisible,
      getShelfData,
    } = props

    const data = detail.get('data', Map())
    if (!data) {
      return null
    }

    const tilesState = getTilesState(STORE_KEY_DETAIL_SERIES_SEASON, props)
    const titlesCount = tilesState.getIn(['data', 'titles'], List()).size
    const totalTilesCount = tilesState.getIn(['data', 'totalCount'], 0)
    const seasonNumbers = detail.getIn(['data', 'seasonNums'], List())

    const tilesProcessing = tilesState.get('processing')
    const shouldRenderCommentsLink = data.get('commentTotalCount') > 0

    const onCommentsClickPartial = _partial(onClickViewAllComments, props, data)
    const totalSeasons = data.get('totalSeasons', 0)
    const totalEpisodes = data.get('totalEpisodes', 0)
    // ======================================================
    // Skunk 150 - rearranged variable declarations here
    // These declarations can be reverted to commit 87c34a06038d9a9 state when Skunk 150 is complete
    const pathname = location.pathname
    const seriesIsHpm = pathname === '/series/hidden-power-meditation'
    const storeKey = seriesIsHpm
      ? STORE_KEY_DETAIL_SERIES
      : STORE_KEY_DETAIL_SERIES_SEASON
    const shouldRenderSeasonsFilter = seriesIsHpm
      ? false
      : seasonNumbers.size > 1
    const tileGridClassName = _concat(
      ['detail-series__episode-listing'],
      shouldRenderSeasonsFilter
        ? ['detail-series__episode-listing--with-season']
        : [],
    )
    // ======================================================
    return (
      <article className="detail">
        <Jumbotron storeKey={STORE_KEY_DETAIL} location={location} />
        {renderProductionStatusNotice({ language, text: data.get('productionStatusText') })}
        <CommentsLoader />
        <div className="detail-series__content">
          <div className="detail-series__info">
            {renderTitle(data.getIn(['type', 'content']), data.get('title'))}
            <H5 as={HEADING_TYPES.H6} className="detail-series__host">{data.get('host')}</H5>
            {renderSeriesMeta(totalSeasons, totalEpisodes, staticText)}
            <div className="detail-series__button-container">
              {renderPreview(detail, auth, staticText)}
              <WithAuth>
                <NotificationsFollowButton
                  subscriptionType={SUBSCRIPTION_TYPES.SERIES}
                  type={BUTTON_TYPES.ROUND}
                  contentId={data.get('id')}
                  showTooltip
                />
              </WithAuth>
            </div>
            {isShow(resolver.get('path'))
              ? renderDescription(data.get('teaser'), data.get('id'))
              : renderDescription(data.get('description'), data.get('id'))}
            {renderFileAttachments(
              data.get('fileAttachments', List()),
              staticText,
            )}
            {renderActionItems(
              data.getIn(['type', 'content']),
              data.get('vote'),
              data.get('voteDown'),
              data.get('id'),
              auth,
              staticText,
              onCommentsClickPartial,
            )}
            {shouldRenderCommentsLink &&
              renderCommentsLink(
                data.getIn(['type', 'content']),
                data.get('commentTotalCount'),
                staticText,
                onCommentsClickPartial,
              )}
          </div>
          {renderFeaturedEpisode()}
        </div>
        {shouldRenderSeasonsFilter
          ? renderSeasonsFilter()
          : null}
        {
          (
            <TileRows
              tileRows={tileRows}
              storeKey={storeKey}
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
                screenType: SCREEN_TYPE_DETAIL_SERIES,
                screenParam: detail.getIn(['data', 'id']),
              })}
              useShelfV2
            >
              {renderTileGrid(
                props,
                storeKey,
                <DetailSubtitle>
                  {staticText.getIn(['data', 'episodes'])}
                </DetailSubtitle>,
                tileGridClassName,
              )}
              <div className="detail-series__bottom">
                {tilesProcessing ? null : (
                  <LoadMore
                    onClickLoadMore={getTilesDataLoadMore}
                    buttonClassName={[
                      'detail-series__load-more-button',
                      'button--secondary',
                    ]}
                    currentCount={titlesCount}
                    totalCount={totalTilesCount}
                    processing={tilesProcessing}
                  />
                )}
                <BackToTop />
              </div>
            </TileRows>
          )
        }
      </article>
    )
  }
}

DetailSeries.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  tileRows: ImmutablePropTypes.map.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  detail: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  comments: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setTilesActiveId: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  getShelfData: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  refreshComments: PropTypes.func.isRequired,
  getTilesDataLoadMore: PropTypes.func.isRequired,
  getDetailSeriesSeason: PropTypes.func.isRequired,
  setEventVideoImpressed: PropTypes.func,
  setEventSeriesImpressed: PropTypes.func,
  clearUpstreamContext: PropTypes.func.isRequired,
}

export default compose(
  // ======================================================
  // This connectTiles invokation only applies to Skunk 150 test
  // Can be removed when the test is complete
  connectTiles({
    storeKey: STORE_KEY_DETAIL_SERIES,
    type: TYPE_SERIES_EPISODES,
    enablePageBehaviors: true,
    limit: 20, // hard-coded for hidden power of meditation progressive series test
  }),
  // ======================================================
  connectTiles({
    storeKey: STORE_KEY_DETAIL_SERIES_SEASON,
    type: TYPE_SERIES_SEASON,
    enablePageBehaviors: true,
  }),
  connectTiles({
    storeKey: STORE_KEY_DETAIL_FEATURED_EPISODE,
    type: TYPE_FEATURED_EPISODE,
    attachProps: false,
    enablePageBehaviors: true,
  }),
  connectRedux(
    (state) => {
      const storeKeyList = [
        STORE_KEY_DETAIL_SERIES,
        STORE_KEY_DETAIL_FEATURED_EPISODE,
        STORE_KEY_DETAIL_SERIES_SEASON,
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
        resolver: state.resolver,
        detail: state.detail,
        shelf: state.shelf,
        auth: state.auth,
        user: state.user,
        comments: state.comments,
        staticText: state.staticText.getIn(['data', 'detailSeries'], Map()),
        language: state.user.getIn(['data', 'language'], List()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setTilesActiveId: actions.tiles.setTilesActiveId,
        setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setShelfVisible: actions.shelf.setShelfVisible,
        getShelfData: actions.shelf.getShelfData,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setCommentsVisible: actions.comments.setCommentsVisible,
        refreshComments: actions.comments.refreshComments,
        setEventVideoVisited: actions.eventTracking.setEventVideoVisited,
        setEventSeriesVisited: actions.eventTracking.setEventSeriesVisited,
        setEventVideoImpressed: actions.eventTracking.setEventVideoImpressed,
        setEventSeriesImpressed: actions.eventTracking.setEventSeriesImpressed,
        clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
      }
    },
  ),
)(DetailSeries)
