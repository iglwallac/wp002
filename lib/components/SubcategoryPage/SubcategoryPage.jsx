import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { get as getConfig } from 'config'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, Map } from 'immutable'
import { compose } from 'recompose'
import {
  STORE_KEY_SUBCATEGORY,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_EPISODES_NEXT,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_FEATURED_EPISODE,
} from 'services/store-keys'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import { RESOLVER_TYPE_CLASSIC_FACET, RESOLVER_TYPE_SUBCATEGORY } from 'services/resolver/types'
import {
  FILTER_SET_DEFAULT,
  FILTER_SET_YOGA,
  FILTER_SET_FITNESS,
  FILTER_SET_ORIGINAL,
  FILTER_SET_FILM,
} from 'services/filter-set'
import { connect as connectRedux } from 'react-redux'
import { connect as connectPage } from 'components/Page/connect'
// import _assign from 'lodash/assign'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _includes from 'lodash/includes'
import _parseInt from 'lodash/parseInt'
import _assign from 'lodash/assign'
import Loadable from 'react-loadable'
import Jumbotron from 'components/Jumbotron'
import FilterContainer from 'components/FilterContainer'
import FatFilterContainer from 'components/FatFilterContainer'
import TileGrid from 'components/TileGrid'
import TileRows from 'components/TileRows'
import BackToTop from 'components/BackToTop'
import LoadMore from 'components/LoadMore'
import Pager from 'components/Pager'
import CommentsLoader from 'components/CommentsLoader'
import FilterNoResults from 'components/FilterNoResults'
import { isSynced as resolverIsSynced } from 'components/Resolver/synced'
import { connect as connectTiles } from 'components/Tiles/connect'
import { connect as connectLanguage } from 'components/Language/connect'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { ERROR_TYPE_404 } from 'components/ErrorPage/types'
import YogaMultipack from 'components/YogaMultipack'
import {
  createUpstreamContext,
  SCREEN_TYPE_SUBCATEGORY,
  SCREEN_TYPE_CLASSIC_FACET,
  CONTEXT_TYPE_SUBCATEGORY_ENTITY,
  CONTEXT_TYPE_SUBCATEGORY_LIST,
  CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET_ENTITY,
  CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET,
  CONTEXT_TYPE_SUBCATEGORY_FITNESS_CLASSIC_FACET_ENTITY,
  CONTEXT_TYPE_SUBCATEGORY_FITNESSE_CLASSIC_FACET,
  CONTEXT_TYPE_SUBCATEGORY_INTERVIEW_CLASSIC_FACET_ENTITY,
  CONTEXT_TYPE_SUBCATEGORY_INTERVIEW_CLASSIC_FACET,
  CONTEXT_TYPE_CLASSIC_FACET_SPOTLIGHT,
} from 'services/upstream-context'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import { EN, ES } from 'services/languages/constants'

const config = getConfig()
const LoadableErrorPage = Loadable({
  loader: () => import('components/ErrorPage'),
  loading: () => <Sherpa type={TYPE_LARGE} />,
})

function createOnLanguageChange (actions) {
  return actions.tiles.resetTilesData
}

function getCurrentPage (props) {
  const { location } = props
  return _parseInt(_get(location, ['query', 'page']))
}

function getTilesState (props) {
  const { tiles } = props
  return tiles
}

function getJumbotronState (props) {
  const { jumbotron } = props
  return jumbotron
}

function getLocationPath (location) {
  return location.pathname.replace(/^\//, '')
}

function getPathIsInOptions (options, path) {
  return options.some(option => option.get('path') === path)
}

function getPathOptionValue (options, path) {
  const match = options.find(option => option.get('path') === path)
  if (match) {
    return match.get('value')
  }
  return null
}

function getFilterValueForKnownPath (props) {
  const { filterSet, location } = props
  const selectedFilterSet = getSelectedFilterSet(props)
  const data = filterSet.getIn([selectedFilterSet, 'data'])

  if (!data || data.size === 0) {
    return null
  }

  const path = getLocationPath(location)
  const knownFilterPath = data.some((item) => {
    const options = item.getIn(['filter', 'options'], List())
    return getPathIsInOptions(options, path)
  })
  if (knownFilterPath) {
    const pathOption = data.reduce((reduction, item) => {
      const options = item.getIn(['filter', 'options'], List())
      if (getPathIsInOptions(options, path)) {
        const value = getPathOptionValue(options, path)
        if (value) {
          return {
            [item.get('param')]: getPathOptionValue(options, path),
          }
        }
      }
      return reduction
    }, {})
    return pathOption
  }
  return null
}

function getSelectedFilterSet (props) {
  const { location, resolver } = props
  const resolverFilterSet = resolver.getIn(['data', 'filterSet'])


  let selectedFilterSet =
    _get(location, ['query', 'filter-set']) ||
    resolverFilterSet ||
    FILTER_SET_DEFAULT
  if (
    _has(config, ['features', 'filters', selectedFilterSet]) &&
    !_get(config, ['features', 'filters', selectedFilterSet], false)
  ) {
    selectedFilterSet = FILTER_SET_DEFAULT
  }
  if (_get(location, 'pathname') === '/yoga/practices') {
    selectedFilterSet = 'yoga'
  }
  return selectedFilterSet
}

function getScreenType (props) {
  const contextType = getListContextType(props)
  if (contextType !== CONTEXT_TYPE_SUBCATEGORY_LIST) {
    return SCREEN_TYPE_CLASSIC_FACET
  }
  return SCREEN_TYPE_SUBCATEGORY
}

function getScreenParam (props) {
  const contextType = getListContextType(props)
  if (contextType === CONTEXT_TYPE_SUBCATEGORY_LIST) {
    const tiles = getTilesState(props)
    return tiles.get('id')
  }
  return null
}

// eslint-disable-next-line no-unused-vars
function getEntityContextType (props) {
  // save for GA events
  const selectedFilterSet = getSelectedFilterSet(props)
  let contextType = CONTEXT_TYPE_SUBCATEGORY_ENTITY
  switch (selectedFilterSet) {
    case FILTER_SET_YOGA:
      contextType = CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET_ENTITY
      break
    case FILTER_SET_FITNESS:
      contextType = CONTEXT_TYPE_SUBCATEGORY_FITNESS_CLASSIC_FACET_ENTITY
      break
    case FILTER_SET_ORIGINAL:
      contextType = CONTEXT_TYPE_SUBCATEGORY_INTERVIEW_CLASSIC_FACET_ENTITY
      break
    case FILTER_SET_DEFAULT:
    default:
      contextType = CONTEXT_TYPE_SUBCATEGORY_ENTITY
  }
  return contextType
}

function getListContextType (props) {
  const selectedFilterSet = getSelectedFilterSet(props)
  let contextType = CONTEXT_TYPE_SUBCATEGORY_LIST
  switch (selectedFilterSet) {
    case FILTER_SET_YOGA:
      contextType = CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET
      break
    case FILTER_SET_FITNESS:
      contextType = CONTEXT_TYPE_SUBCATEGORY_FITNESSE_CLASSIC_FACET
      break
    case FILTER_SET_ORIGINAL:
      contextType = CONTEXT_TYPE_SUBCATEGORY_INTERVIEW_CLASSIC_FACET
      break
    case FILTER_SET_DEFAULT:
    default:
      contextType = CONTEXT_TYPE_SUBCATEGORY_LIST
  }
  return contextType
}

function getActiveSort (props) {
  const { resolver, defaultSort } = props
  return resolver.getIn(['query', 'sort']) || defaultSort
}

function getActiveFilters (props) {
  const { resolver } = props
  let filters = resolver.get('query', {}).toJS()
  filters = _assign({}, filters, getFilterValueForKnownPath(props))
  return filters
}

function renderTileGrid (props, rowId, tileGridClass) {
  const {
    history,
    location,
    jumbotron,
    resolver,
    auth,
    setEventSeriesVisited,
    setEventVideoVisited,
  } = props
  const tilesState = getTilesState(props)
  const resolverTypeClassicFacet =
    resolver.getIn(['data', 'type']) === RESOLVER_TYPE_CLASSIC_FACET
  if (!tilesState.get('data')) {
    return null
  }
  if (
    tilesState.getIn(['data', 'totalCount']) <= 0 &&
    !tilesState.get('processing', false)
  ) {
    if (resolverTypeClassicFacet) {
      const selectedFilterSet =
        _get(location, ['query', 'filter-set']) ||
        jumbotron.getIn(['data', 'filterSet'])

      return (
        <FilterNoResults
          history={history}
          location={location}
          selectedFilterSet={selectedFilterSet}
        />
      )
    }
    return (
      <div className="subcategory__tiles-empty-result">
        {'Sorry, no results.'}
      </div>
    )
  }

  return (
    <TileGrid
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
        screenType: getScreenType(props),
        screenParam: getScreenParam(props),
        contextType: getListContextType(props),
        filters: getActiveFilters(props),
        sort: getActiveSort(props),
      })}
    />
  )
}

function jumbotronSynced (props) {
  const { resolver, location } = props
  const jumbotron = getJumbotronState(props)
  return (
    resolverIsSynced(resolver, location) &&
    jumbotron.getIn(['data', 'id']) === resolver.getIn(['data', 'id'])
  )
}

function renderFilterContainer (props) {
  const { location, history } = props
  const { features } = config
  const isYoga = _get(location, 'pathname') === '/yoga/practices'
  if (!jumbotronSynced(props) && !isYoga) {
    return null
  }
  const selectedFilterSet = getSelectedFilterSet(props)
  const filmFiltersEnabled = _get(features, ['filmFilters', 'enabled'])
  if (selectedFilterSet === FILTER_SET_FILM && filmFiltersEnabled) {
    return (
      <FatFilterContainer
        selectedFilterSet={selectedFilterSet}
        location={location}
        history={history}
      />
    )
  }

  return (
    <FilterContainer
      selectedFilterSet={selectedFilterSet}
      location={location}
      history={history}
    />
  )
}

function updateData ({
  resolver,
  auth,
  inboundTracking,
  setInboundTrackingContentImpression,
}) {
  const isProcessing = resolver.get('processing')
  const isSubcatType = resolver.getIn(['data', 'type']) === RESOLVER_TYPE_SUBCATEGORY ||
    resolver.getIn(['data', 'type']) === RESOLVER_TYPE_CLASSIC_FACET

  if (!isProcessing && isSubcatType) {
    const trackedId = inboundTracking.getIn(['data', 'ci_id'])
    const cid = resolver.getIn(['data', 'id'])

    if (trackedId !== cid) {
      setInboundTrackingContentImpression({
        uid: auth.get('uid'),
        ci_id: cid,
        ci_type: 'subcat',
      })
    }
  }
}

class SubcategoryPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { loadMoreVisible: false }
  }

  componentDidMount () {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(() => ({ loadMoreVisible: true }))
    updateData(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (!process.env.BROWSER) {
      return
    }

    updateData(nextProps)
  }

  componentWillUnmount () {
    const { props } = this
    const { setShelfVisible, resetTilesActiveId, setCommentsVisible } = props
    setShelfVisible(false)
    resetTilesActiveId(STORE_KEY_SUBCATEGORY)
    setCommentsVisible(false)
  }

  onClickLoadMore = (e) => {
    const { props } = this
    const { getTilesDataLoadMore } = props

    getTilesDataLoadMore(e)
  }

  showYogaMultipack = (language, location) => {
    const { auth } = this.props
    const isYoga = _get(location, 'pathname') === '/yoga/practices'
    return isYoga && auth.get('jwt') && [EN, ES].includes(language)
  }

  useShelfV2 = () => {
    // If there is a page that should still use V1,
    // add conditional logic here
    return true
  }

  render () {
    const { props, state, onClickLoadMore, showYogaMultipack } = this
    const { tileRows, location, auth, shelf, history } = props
    const { loadMoreVisible } = state
    const tilesState = getTilesState(props)
    const {
      setTilesScrollableTileIndex,
      setTilesScrollableRowWidth,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
      setShelfVisible,
      getShelfData,
      user,
    } = props
    const titlesCount = tilesState.getIn(['data', 'titles'], List()).size
    const totalTilesCount = tilesState.getIn(['data', 'totalCount'], 0)
    const totalPages = tilesState.getIn(['data', 'totalPages'], 0)
    const totalCount = tilesState.getIn(['data', 'totalCount'], 0)
    const processing = tilesState.get('processing')
    const placeholderTitlesExist = tilesState.get('placeholderTitlesExist')
    const queryPage = getCurrentPage(props)
    const currentPage = queryPage || 1
    const language = user.getIn(['data', 'language', 0])

    if (queryPage <= 1 ||
      (titlesCount === 0 && totalPages > 0 && totalCount > 0)
    ) {
      return (
        <LoadableErrorPage history={history} location={location} code={ERROR_TYPE_404} />
      )
    }
    return (
      <div className={'subcategory subcategory--wrapper'}>
        <CommentsLoader />
        <TestarossaSwitch>
          <TestarossaCase campaign="ME-100" variation={1}>
            {() => (
              showYogaMultipack(language, location)
                ? <YogaMultipack
                  auth={auth}
                  location={location}
                  upstreamContext={createUpstreamContext({
                    screenType: getScreenType(props),
                    screenParam: getScreenParam(props),
                    contextType: CONTEXT_TYPE_CLASSIC_FACET_SPOTLIGHT,
                    filters: getActiveFilters(props),
                    sort: getActiveSort(props),
                  })}
                />
                : <Jumbotron storeKey={STORE_KEY_SUBCATEGORY} location={location} />
            )}
          </TestarossaCase>
          <TestarossaDefault>
            {() => (
              <Jumbotron storeKey={STORE_KEY_SUBCATEGORY} location={location} />
            )}
          </TestarossaDefault>
        </TestarossaSwitch>
        {renderFilterContainer(props)}
        <TileRows
          tileRows={tileRows}
          storeKey={STORE_KEY_SUBCATEGORY}
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
            screenType: getScreenType(props),
            screenParam: getScreenParam(props),
            contextType: getListContextType(props),
            filters: getActiveFilters(props),
            sort: getActiveSort(props),
          })}
          useShelfV2={this.useShelfV2()}
        >
          {renderTileGrid(props, STORE_KEY_SUBCATEGORY, [
            'subcategory__container',
          ])}
          <div className="subcategory__bottom">
            {placeholderTitlesExist ||
            processing ||
            !loadMoreVisible ||
            totalPages < 2 ||
            currentPage === totalPages ||
            currentPage !== 1 ? null :
              (
                <LoadMore
                  onClickLoadMore={onClickLoadMore}
                  buttonClassName={[
                    'subcategory__load-more-button',
                    'button--secondary',
                  ]}
                  currentCount={titlesCount}
                  totalCount={totalTilesCount}
                  processing={processing}
                />
              )}
            {placeholderTitlesExist ||
            processing ||
            (loadMoreVisible && currentPage === 1) ||
            totalPages < 2 ? null :
              (
                <Pager location={location} history={history} total={totalPages} />
              )}
            <BackToTop />
          </div>
        </TileRows>
      </div>
    )
  }
}

SubcategoryPage.propTypes = {
  totalPages: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  jumbotron: ImmutablePropTypes.map.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  tileRows: ImmutablePropTypes.map.isRequired,
  filterSet: ImmutablePropTypes.map.isRequired,
  inboundTracking: ImmutablePropTypes.map.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  resetTilesActiveId: PropTypes.func.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  getTilesDataLoadMore: PropTypes.func.isRequired,
  getShelfData: PropTypes.func.isRequired,
  setInboundTrackingContentImpression: PropTypes.func.isRequired,
  setEventSeriesVisited: PropTypes.func.isRequired,
  setEventVideoVisited: PropTypes.func.isRequired,
}

export default compose(
  connectLanguage({ createOnLanguageChange }),
  connectTiles({
    storeKey: STORE_KEY_SUBCATEGORY,
    enablePageBehaviors: true,
  }),
  connectRedux(
    (state) => {
      const storeKeyList = [
        STORE_KEY_SUBCATEGORY,
        STORE_KEY_SHELF_EPISODES,
        STORE_KEY_SHELF_RELATED,
        STORE_KEY_SHELF_FEATURED_EPISODE,
        STORE_KEY_SHELF_EPISODES_NEXT,
      ]
      const tileRows = state.tileRows.filter((val, key) => _includes(storeKeyList, key))
      return {
        totalPages: state.tiles.getIn(
          [STORE_KEY_SUBCATEGORY, 'data', 'totalPages'],
          0,
        ),
        jumbotron: state.jumbotron.get(STORE_KEY_SUBCATEGORY, Map()),
        tiles: state.tiles.get(STORE_KEY_SUBCATEGORY, Map()),
        tileRows,
        resolver: state.resolver,
        inboundTracking: state.inboundTracking,
        shelf: state.shelf,
        auth: state.auth,
        user: state.user,
        page: state.page,
        filterSet: state.filterSet,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setShelfVisible: actions.shelf.setShelfVisible,
        resetTilesActiveId: actions.tiles.resetTilesActiveId,
        setCommentsVisible: actions.comments.setCommentsVisible,
        getShelfData: actions.shelf.getShelfData,
        setInboundTrackingContentImpression:
          actions.inboundTracking.setInboundTrackingContentImpression,
        setEventVideoVisited: actions.eventTracking.setEventVideoVisited,
        setEventSeriesVisited: actions.eventTracking.setEventSeriesVisited,
      }
    },
  ),
  connectPage({ storeKey: STORE_KEY_SUBCATEGORY, storeBranch: 'jumbotron' }),
)(SubcategoryPage)
