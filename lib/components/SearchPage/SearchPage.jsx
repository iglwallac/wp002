import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compose } from 'recompose'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, Map } from 'immutable'
import Link from 'components/Link'
import UserAvatar from 'components/UserAvatar'
import { Tabs, Tab, TABS_TYPES } from 'components/Tabs'
import { H3 } from 'components/Heading'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import { connect as connectRedux } from 'react-redux'
import { get as getConfig } from 'config'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_LOCATION,
} from 'components/Page/connect'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import { TYPE_SEARCH } from 'services/tiles'
import {
  STORE_KEY_SEARCH,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_EPISODES_NEXT,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_FEATURED_EPISODE,
} from 'services/store-keys'
import SearchForm from 'components/SearchForm'
import TileRows from 'components/TileRows'
import TileGrid from 'components/TileGrid'
import LoadMore from 'components/LoadMore'
import BackToTop from 'components/BackToTop'
import CommentsLoader from 'components/CommentsLoader'
import { connect as connectTiles } from 'components/Tiles/connect'
import { connect as connectLanguage } from 'components/Language/connect'
import {
  SCREEN_TYPE_SEARCH_PAGE,
  createUpstreamContext,
} from 'services/upstream-context'

const config = getConfig()
const showPortals = _get(config, ['features', 'showUserPortalSearchResults'])

function createOnLanguageChange (actions) {
  return actions.tiles.resetTilesData
}

function getTilesState (storeKey, props) {
  const { tiles } = props
  return tiles.get(storeKey, Map())
}

function renderTileGrid (tileStoreKey, props, rowId) {
  const { auth, location } = props
  const tilesState = getTilesState(tileStoreKey, props)
  const tileGridData = tilesState.getIn(['data', 'titles'], List())

  if (!tilesState.get('data')) {
    return <div className="search__tile-grid-placeholder" />
  }

  if (tileGridData && tileGridData.size < 1) {
    return null
  }

  return (
    <TileGrid
      rowId={rowId}
      activeTileId={tilesState.get('activeId')}
      tileGridData={tileGridData}
      displayType={RENDER_TYPE_TILE_GRID_GALLERY}
      moreInfoVisible
      scrollable={false}
      location={location}
      auth={auth}
      upstreamContext={createUpstreamContext({
        screenType: SCREEN_TYPE_SEARCH_PAGE,
        screenParam: tilesState.get('id'),
        storeKey: rowId,
      })}
    />
  )
}

function renderLoadMore (props) {
  const { getTilesDataLoadMore } = props
  const tilesState = getTilesState(STORE_KEY_SEARCH, props)
  const titlesCount = tilesState.getIn(['data', 'titles'], List()).size
  const totalTilesCount = tilesState.getIn(['data', 'totalCount'], 0)
  const processing = tilesState.get('processing')
  return (
    <LoadMore
      onClickLoadMore={getTilesDataLoadMore}
      buttonClassName={['search__load-more-button', 'button--secondary']}
      currentCount={titlesCount}
      totalCount={totalTilesCount}
      processing={processing}
    />
  )
}

function renderSearchContent (props) {
  const {
    location,
    auth,
    shelf,
    tileRows,
    staticTextSearchPage,
    setShelfVisible,
    setTileRowsActiveId,
    setTileRowsRowActiveId,
    setTilesScrollableTileIndex,
    setTilesScrollableRowWidth,
    getShelfData,
  } = props

  const tilesState = getTilesState(SCREEN_TYPE_SEARCH_PAGE, props)

  return (
    <div className="search__search-content">
      { showPortals ?
        <H3 className="search__video-heading">
          {staticTextSearchPage.getIn(['data', 'videos'])}
        </H3> :
        null
      }
      <div className="search__results-container">
        <TileRows
          tileRows={tileRows}
          storeKey={STORE_KEY_SEARCH}
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
            screenType: SCREEN_TYPE_SEARCH_PAGE,
            screenParam: tilesState.get('id'),
          })}
          useShelfV2
        >
          {renderTileGrid(STORE_KEY_SEARCH, props, STORE_KEY_SEARCH)}
        </TileRows>
      </div>
    </div>
  )
}

function renderSearchBottom (props) {
  return (
    <div className="search__bottom">
      {renderLoadMore(props)}
      <BackToTop />
    </div>
  )
}

function getMessage (tiles, auth) {
  //
  const messages = tiles.getIn(['data', 'messages'], List())

  if (!messages || !messages.size) {
    return null
  }

  let message = messages.get(0)

  if (messages.size > 1) {
    const uniqueMessage = messages.find(m => m.get('type') !== 'no-results')
    const defaultMessage = messages.find(m => m.get('type') === 'no-results')
    message = auth.get('jwt') ? (uniqueMessage || defaultMessage) : defaultMessage
  }

  if (!message) {
    return null
  }

  const url = message.get('url', '')
  const text = message.get('text', '')
  const isAbsolutePath = /^http/.test(url)
  const urlLabel = message.get('urlLabel')
  const linkProps = { to: url }

  if (isAbsolutePath) {
    linkProps.target = '_blank'
    linkProps.directLink = true
  }

  return (
    <p>
      {text}
      {text ? <br /> : null}
      {url ? (
        <Link {...linkProps}>
          {urlLabel}
        </Link>
      ) : null}
    </p>
  )
}

class SearchPage extends Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      viewAllProfiles: false,
      activeTab: 0,
    }
  }

  componentWillUnmount () {
    const { setShelfVisible, setCommentsVisible } = this.props
    setShelfVisible(false)
    setCommentsVisible(false)
  }

  viewAllProfiles = () => {
    this.setState(() => ({
      viewAllProfiles: !this.state.viewAllProfiles,
    }))
  }

  renderUserPortalSearchResults () {
    const { state, props, viewAllProfiles } = this
    const { portalSearchResults, staticTextSearchPage } = props

    if (!portalSearchResults || !portalSearchResults.size) {
      return null
    }

    const sliceLength = state.viewAllProfiles ? portalSearchResults.size : 4

    return (
      <div className="search__user-portal-results">
        <H3 className="search__user-portal-heading">
          {staticTextSearchPage.getIn(['data', 'members'])}
        </H3>
        <p className="search__user-portal-count">{portalSearchResults.size}</p>
        {portalSearchResults.size > 5 ?
          <Link to="" onClick={viewAllProfiles}>
            {staticTextSearchPage.getIn(['data', 'viewAllProfiles'])}
          </Link> : null
        }
        <div className="search__user-results-container">
          {portalSearchResults.slice(0, sliceLength).map((portal) => {
            return (
              <div key={portal.get('username')} className="search__user-portal">
                <Link
                  to={`/portal/${portal.get('url')}`}
                  onClick={() => { }}
                >
                  <UserAvatar
                    path={portal.get('profilePicture', '')}
                    className={['search__avatar']}
                  />
                </Link>
                <Link
                  to={`/portal/${portal.get('url')}`}
                  className="search__username-link"
                >{portal.get('username')}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  renderNoResults = () => {
    const { props } = this
    const { staticTextSearchPage } = props
    return (
      <div className="search__no-user-results">
        {/* eslint-disable-next-line */}
        <div role="presentation" alt="sasquatch" className="search__sasquatch" />
        <p>{staticTextSearchPage.getIn(['data', 'foundSasquatch'])}</p>
      </div>
    )
  }

  renderLegacySearch () {
    const { props } = this
    const { location, auth } = props
    const q = _get(location, ['query', 'q'])
    const tilesState = getTilesState(STORE_KEY_SEARCH, props)
    const titles = tilesState.getIn(['data', 'titles'], List())
    const message = getMessage(tilesState, auth)

    return (
      <div className="search__body">
        {message}
        {!message && q && titles && titles.size > 0 ? renderSearchContent(props) : null}
        {!message && q && titles && titles.size > 0 ? renderSearchBottom(props) : null}
      </div>
    )
  }

  renderNewSearchResults () {
    const { props } = this
    const { auth, location, portalSearchResults, staticTextSearchPage } = props
    const q = _get(location, ['query', 'q'])
    const tilesState = getTilesState(STORE_KEY_SEARCH, props)
    const titles = tilesState.getIn(['data', 'titles'], List())
    const message = getMessage(tilesState, auth)
    // const hasResults = (portalSearchResults && portalSearchResults.size > 0)
    //   || (titles && titles.size > 0)

    return (
      <div className="search__body search__modify-tile-wrapper">
        <div className="search__hide-in-desktop">
          {message}
          {!message && q && portalSearchResults && portalSearchResults.size > 0
            ? this.renderUserPortalSearchResults()
            : this.renderNoResults()
          }
          {!message && q && titles && titles.size > 0 ? renderSearchContent(props) : null}
          {!message && q && titles && titles.size > 0 ? renderSearchBottom(props) : null}
        </div>
        <div className="search__hide-in-mobile">
          <Tabs type={TABS_TYPES.VERTICAL} noMobileSupport>
            <Tab label={staticTextSearchPage.getIn(['data', 'all'])}>
              {message}
              {!message && q && portalSearchResults && portalSearchResults.size > 0
                ? this.renderUserPortalSearchResults()
                : null
              }
              {!message && q && titles && titles.size > 0 ? renderSearchContent(props) : null}
              {!message && q && titles && titles.size > 0 ? renderSearchBottom(props) : null}
            </Tab>
            <Tab label={staticTextSearchPage.getIn(['data', 'videos'])}>
              {message}
              {!message && q && titles && titles.size > 0 ? renderSearchContent(props) : null}
              {!message && q && titles && titles.size > 0 ? renderSearchBottom(props) : null}
            </Tab>
            <Tab label={staticTextSearchPage.getIn(['data', 'members'])}>
              {message}
              {!message && q && portalSearchResults && portalSearchResults.size > 0 ?
                this.renderUserPortalSearchResults() : null
              }
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }

  render () {
    const { props } = this
    const {
      history,
      location,
    } = props
    const q = _get(location, ['query', 'q'])
    const sort = _get(location, ['query', 'sort'], '')
    return (
      <section className="search">
        <CommentsLoader />
        <SearchForm
          autofocus
          className={['search__search-form']}
          hasButton
          location={location}
          defaultSearchTerm={q}
          defaultSearchSort={sort}
          history={history}
          iconClass={['search__search-icon']}
        />
        {showPortals ?
          this.renderNewSearchResults() :
          this.renderLegacySearch()
        }
      </section>
    )
  }
}

SearchPage.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  tileRows: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  staticTextSearchPage: ImmutablePropTypes.map.isRequired,
  setPageSeo: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  togglePlaylistEditMode: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  getTilesDataLoadMore: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  getShelfData: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectLanguage({ createOnLanguageChange }),
  connectRedux(
    (state) => {
      const storeKeyList = [
        STORE_KEY_SEARCH,
        STORE_KEY_SHELF_EPISODES,
        STORE_KEY_SHELF_EPISODES_NEXT,
        STORE_KEY_SHELF_RELATED,
        STORE_KEY_SHELF_FEATURED_EPISODE,
      ]
      const tileRows = state.tileRows.filter((val, key) => _includes(storeKeyList, key))
      const tiles = state.tiles.filter((val, key) => _includes(storeKeyList, key) || key === 'scrollableRowWidth')
      return {
        tiles,
        tileRows,
        auth: state.auth,
        portalSearchResults: state.portal.get('searchResults'),
        page: state.page,
        shelf: state.shelf,
        staticTextSearchPage: state.staticText.getIn(
          ['data', 'searchPage'],
          Map(),
        ),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
        setShelfVisible: actions.shelf.setShelfVisible,
        setCommentsVisible: actions.comments.setCommentsVisible,
        togglePlaylistEditMode: actions.playlist.togglePlaylistEditMode,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        getShelfData: actions.shelf.getShelfData,
      }
    },
  ),
  connectTiles({
    storeKey: STORE_KEY_SEARCH,
    type: TYPE_SEARCH,
    queryParamAsId: 'q',
    ignoreEmptyId: true,
    enablePageBehaviors: true,
  }),
)(SearchPage)
