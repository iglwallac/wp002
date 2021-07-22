import _get from 'lodash/get'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _first from 'lodash/first'
import _last from 'lodash/last'
import _size from 'lodash/size'
import _isNumber from 'lodash/isNumber'
import { Map, List } from 'immutable'
import { authExists } from 'services/auth'
import {
  STORE_KEY_EPISODE_DETAIL_NEXT,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_EPISODES_NEXT,
} from 'services/store-keys'
import {
  get as getTiles,
  getPage as getPageTiles,
  getPlaceholderTitles,
  createTitlesSeriesLink,
  DEFAULT_LIMIT,
} from 'services/tiles'
import { setInPlaylist } from 'services/playlist'
import { legacyBatchGet as getUserNodeInfo } from 'services/user-node-info'
import { PRODUCTION_STATUS_ACTIVE } from 'services/shelf'
import {
  CLASSIC_FACET_YOGA,
  CLASSIC_FACET_FITNESS,
  CLASSIC_FACET_RECIPE,
  handleFilterResponse,
} from 'services/filter'
import { setFilterSetData } from 'services/filter-set/actions'

export const GET_TILES_DATA = 'GET_TILES_DATA'
export const APPEND_TILES_DATA_TITLES = 'APPEND_TILES_DATA_TITLES'
export const SET_TILES_DATA = 'SET_TILES_DATA'
export const DELETE_TILES = 'DELETE_TILES'
export const DELETE_TILES_DATA = 'DELETE_TILES_DATA'
export const DELETE_TILES_DATA_BY_ID = 'DELETE_TILES_DATA_BY_ID'
export const SET_TILES_ID_TYPE_PAGE_LIMIT_PATH_QUERY =
  'SET_TILES_ID_TYPE_PAGE_LIMIT_PATH_QUERY'
export const SET_TILES_PROCESSING = 'SET_TILES_PROCESSING'
export const SET_TILES_USER_INFO_PROCESSING = 'SET_TILES_USER_INFO_PROCESSING'
export const SET_TILES_DATA_PLACEHOLDER_TITLES =
  'SET_TILES_DATA_PLACEHOLDER_TITLES'
export const SET_TILES_SCROLLABLE_TILE_INDEX = 'SET_TILES_SCROLLABLE_TILE_INDEX'
export const SET_TILES_SCROLLABLE_ROW_WIDTH = 'SET_TILES_SCROLLABLE_ROW_WIDTH'
export const SET_TILES_PAGE = 'SET_TILES_PAGE'
export const APPEND_TILES_DATA_PLACEHOLDER_TITLES =
  'APPEND_TILES_DATA_PLACEHOLDER_TITLES'
export const SET_TILES_ACTIVE_ID = 'SET_TILES_ACTIVE_ID'
export const RESET_TILES_ACTIVE_ID = 'RESET_TILES_ACTIVE_ID'
export const GET_TILES_DATA_USER_INFO = 'GET_TILES_DATA_USER_INFO'
export const APPEND_TILES_DATA_USER_INFO = 'APPEND_TILES_DATA_USER_INFO'
export const SET_TILES_SEASON = 'SET_TILES_SEASON'
export const SET_TILES_SEASON_NUMS = 'SET_TILES_SEASON_NUMS'
export const SET_TILES_USER_PLAYLIST = 'SET_TILES_USER_PLAYLIST'
export const RESET_TILES = 'RESET_TILES'

const DEFAULT_PLACEHOLDER_SIZE = 4

function getStateByKey (storeKey, getState) {
  return getState().tiles.get(storeKey, Map())
}

function getDataTitleIds (data) {
  return _reduce(
    _get(data, 'titles'),
    (reduction, title) => {
      const id = _get(title, 'id', -1)
      if (id > -1) {
        return reduction.concat(id)
      }
      return reduction
    },
    [],
  )
}

export function setTileDataUserPlaylist (storeKey, id, inPlaylist, auth) {
  return function setTileDataUserPlaylistThunk (dispatch) {
    dispatch(setTileUserPlaylist(storeKey, id, inPlaylist))
    return setInPlaylist({ id, inPlaylist, auth }).catch(() => {
      dispatch(setTileUserPlaylist(storeKey, id, !inPlaylist))
    })
  }
}

export function setTileUserPlaylist (storeKey, id, inPlaylist) {
  return {
    type: SET_TILES_USER_PLAYLIST,
    payload: { storeKey, id, inPlaylist },
  }
}

export function getTileSeason (seasons, productionStatus) {
  const isActiveSeries = productionStatus === PRODUCTION_STATUS_ACTIVE
  return isActiveSeries ? _last(seasons) : _first(seasons)
}

export function updateTilesSeasonData (
  storeKey,
  id,
  options,
  page,
  limit,
  updateData,
  location,
  uid,
  auth,
  seriesId,
  season,
) {
  return function updateTilesSeasonDataThunk (dispatch) {
    const optionsWithSeason = options.set('season', season)
    dispatch(
      getTilesData(
        storeKey,
        id,
        optionsWithSeason,
        page,
        limit,
        updateData,
        location,
        uid,
        auth,
        seriesId,
      ),
    )
    dispatch({
      type: SET_TILES_SEASON,
      payload: { season, storeKey },
    })
  }
}

export function getTilesEpisodeData (
  storeKey,
  seriesId,
  options,
  page,
  limit,
  updateData,
  location,
  uid,
  auth,
  seasonNums,
  productionStatus,
) {
  return function getTilesEpisodeSeasonThunk (dispatch) {
    dispatch(getTilesDataTransition(storeKey))
    dispatch(
      getTilesSeriesData(
        storeKey,
        seriesId,
        options,
        page,
        limit,
        updateData,
        location,
        uid,
        auth,
        seriesId,
        seasonNums,
        productionStatus,
      ),
    )
  }
}

export function getTilesSeriesData (
  storeKey,
  id,
  options,
  page,
  limit,
  updateData,
  location,
  uid,
  auth,
  seriesId,
  seasonNums,
  productionStatus,
  seasonNum,
) {
  return function getSeriesTilesDataThunk (dispatch) {
    const hasSeasons = seasonNums.length > 0
    const optionsWithReset = options.set('resetSeasonData', true)

    if (hasSeasons) {
      const season = seasonNum || getTileSeason(seasonNums, productionStatus)
      dispatch(
        updateTilesSeasonData(
          storeKey,
          id,
          optionsWithReset,
          page,
          limit,
          updateData,
          location,
          uid,
          auth,
          seriesId,
          season,
        ),
      )
      return dispatch({
        type: SET_TILES_SEASON_NUMS,
        payload: { storeKey, seasonNums },
      })
    }
    return dispatch(
      getTilesData(
        storeKey,
        id,
        optionsWithReset,
        page,
        limit,
        updateData,
        location,
        uid,
        auth,
        seriesId,
      ),
    )
  }
}

export function setTilesSeason (
  season,
  storeKey,
  id,
  options,
  page,
  limit,
  updateData,
  location,
  uid,
  auth,
  seriesId,
) {
  return function setTilesSeasonThunk (dispatch) {
    dispatch(deleteTilesData(storeKey))
    const optionsWithSeason = options.set('season', season)
    dispatch(
      getTilesData(
        storeKey,
        id,
        optionsWithSeason,
        page,
        limit,
        updateData,
        location,
        uid,
        auth,
        seriesId,
      ),
    )
    dispatch({
      type: SET_TILES_SEASON,
      payload: { season, storeKey },
    })
  }
}

export function getTilesDataTransition (storeKey) {
  return function getTilesDataTransitionThunk (dispatch) {
    dispatch(deleteTilesData(storeKey))
    dispatch(setTilesDataPlaceholderTitles(storeKey))
  }
}

export function getTilesData (
  storeKey,
  id,
  options,
  page,
  limit,
  updateData,
  location,
  uid,
  auth,
  seriesId,
) {
  return function getTilesDataThunk (dispatch, getState) {
    const resolverType = options.get('type')
    const resetSeasonData = options.get('resetSeasonData')
    const state = getStateByKey(storeKey, getState)
    const query = location ? location.query : null

    // eslint-disable-next-line no-param-reassign
    limit = limit || state.get('limit', DEFAULT_LIMIT)
    // eslint-disable-next-line no-param-reassign
    page = page || 0

    if (resetSeasonData) {
      dispatch(deleteTilesData(storeKey))
    }
    if (updateData) {
      dispatch(
        appendTilesDataPlaceholderTitles(storeKey, DEFAULT_PLACEHOLDER_SIZE),
      )
    } else {
      dispatch(
        setTilesDataPlaceholderTitles(storeKey, DEFAULT_PLACEHOLDER_SIZE),
      )
    }

    dispatch(
      setTilesIdTypePageLimitPathQuery(
        storeKey,
        id,
        resolverType,
        page,
        limit,
        location.pathname,
        query,
      ),
    )

    return getTiles(
      id,
      options.toJS(),
      page,
      limit,
      query,
      uid,
      auth,
      seriesId,
    ).then((data) => {
      const ids = _map(_get(data, 'titles'), title => _get(title, 'id', -1))
      if (
        [
          STORE_KEY_EPISODE_DETAIL_NEXT,
          STORE_KEY_SHELF_EPISODES,
          STORE_KEY_SHELF_EPISODES_NEXT,
        ].indexOf(storeKey) !== -1
      ) {
        // eslint-disable-next-line no-param-reassign
        data.titles = createTitlesSeriesLink(data)
      }
      if (updateData) {
        dispatch(appendTilesDataTitles(storeKey, data.titles))
      } else {
        dispatch(setTilesData(storeKey, data))
      }
      if (authExists(auth) && ids.length > 0) {
        dispatch(getTitlesDataUserInfo(storeKey, ids, auth))
      }
      return data
    })
  }
}

function formatClassicFacetData (classicFacetData, language) {
  const type = Object.keys(classicFacetData)[0]
  const data = Object.values(classicFacetData)
  if (type === CLASSIC_FACET_YOGA
    || type === CLASSIC_FACET_FITNESS
    || type === CLASSIC_FACET_RECIPE
    // TODO: MER-1961  || type === CLASSIC_FACET_FILM
  ) {
    return { type, data: handleFilterResponse(type, data, language) }
  }
  return null
}

export function getTilesPageData (options) {
  return function getTilesPageDataThunk (dispatch) {
    const {
      storeKey,
      updateData,
      resolver,
      location,
      auth,
      locale,
      seriesId,
      seriesLink,
      user = Map(),
      sort,
      playlistType,
    } = options
    const { id, type, page = 0, limit = DEFAULT_LIMIT } = options
    const {
      filterSet = resolver.getIn(['data', 'filterSet']),
      filter = resolver.getIn(['data', 'filter']),
      country = auth.get('country'),
      season,
    } = options
    const query = _get(location, 'query', {})

    dispatch(
      setTilesPage(
        storeKey,
        id,
        location.pathname,
        query,
        page,
        limit,
        true,
        season,
      ),
    )

    const userLanguage = user.getIn(['data', 'language'], List())
    const language = userLanguage.size > 0 ? userLanguage.toJS() : undefined
    return getPageTiles({
      id,
      type,
      language,
      filterSet,
      filter,
      query,
      page,
      limit,
      locale,
      country,
      season,
      seriesId,
      seriesLink,
      auth,
      sort,
      playlistType,
    }).then((data) => {
      if (updateData) {
        dispatch(appendTilesDataTitles(storeKey, _get(data, 'titles', [])))
      } else {
        dispatch(setTilesData(storeKey, data))
      }
      if (authExists(auth)) {
        const ids = getDataTitleIds(data)
        if (_size(ids) > 0) {
          dispatch(getTitlesDataUserInfo(storeKey, ids, auth))
        }
      }
      const classicFacetData = _get(data, 'classicFacets', null)

      if (classicFacetData) {
        const formatedClassicFacetData = formatClassicFacetData(classicFacetData, language)
        const facetType = _get(formatedClassicFacetData, 'type')
        const facetData = _get(formatedClassicFacetData, 'data')
        if (type && facetData) {
          dispatch(setFilterSetData(facetType, facetData))
        }
      }
      return data
    })
  }
}

export function setTilesPage (
  storeKey,
  id,
  path,
  query,
  page,
  limit,
  processing = true,
  season,
) {
  return {
    type: SET_TILES_PAGE,
    payload: { storeKey, id, path, query, processing, page, limit, season },
  }
}

export function appendTilesDataTitles (
  storeKey,
  titles,
  processing = false,
  filterPlaceholders = true,
) {
  return {
    type: APPEND_TILES_DATA_TITLES,
    payload: { storeKey, titles, filterPlaceholders, processing },
  }
}

export function setTilesData (storeKey, data, processing = false) {
  return {
    type: SET_TILES_DATA,
    payload: { storeKey, data, processing },
  }
}

export function resetTilesData () {
  return {
    type: RESET_TILES,
    payload: {},
  }
}

export function deleteTiles (storeKey) {
  return {
    type: DELETE_TILES,
    payload: storeKey,
  }
}

export function deleteTilesData (storeKey) {
  return {
    type: DELETE_TILES_DATA,
    payload: storeKey,
  }
}

export function deleteTilesDataById (storeKey, ids) {
  return {
    type: DELETE_TILES_DATA_BY_ID,
    payload: { ids, storeKey },
  }
}

export function setTilesIdTypePageLimitPathQuery (
  storeKey,
  id,
  type,
  page,
  limit,
  path,
  query,
  processing = true,
) {
  return {
    type: SET_TILES_ID_TYPE_PAGE_LIMIT_PATH_QUERY,
    payload: { storeKey, id, type, page, limit, path, query, processing },
  }
}

export function setTilesProcessing (storeKey, processing) {
  return {
    type: SET_TILES_PROCESSING,
    payload: { processing, storeKey },
  }
}

export function setTilesUserInfoProcessing (storeKey, processing) {
  return {
    type: SET_TILES_USER_INFO_PROCESSING,
    payload: { processing, storeKey },
  }
}

export function setTilesDataPlaceholderTitles (
  storeKey,
  titles = DEFAULT_PLACEHOLDER_SIZE,
) {
  return {
    type: SET_TILES_DATA_PLACEHOLDER_TITLES,
    payload: {
      storeKey,
      titles: _isNumber(titles) ? getPlaceholderTitles(titles) : titles,
    },
  }
}

export function appendTilesDataPlaceholderTitles (
  storeKey,
  titles = DEFAULT_PLACEHOLDER_SIZE,
) {
  return {
    type: APPEND_TILES_DATA_PLACEHOLDER_TITLES,
    payload: {
      storeKey,
      titles: _isNumber(titles) ? getPlaceholderTitles(titles) : titles,
    },
  }
}

export function setTilesScrollableTileIndex (storeKey, scrollableTileIndex) {
  return {
    type: SET_TILES_SCROLLABLE_TILE_INDEX,
    payload: { scrollableTileIndex, storeKey },
  }
}

export function setTilesScrollableRowWidth (value) {
  return {
    type: SET_TILES_SCROLLABLE_ROW_WIDTH,
    payload: value,
  }
}

export function setTilesActiveId (storeKey, activeId) {
  return {
    type: SET_TILES_ACTIVE_ID,
    payload: { storeKey, activeId },
  }
}

export function resetTilesActiveId (storeKey) {
  return {
    type: SET_TILES_ACTIVE_ID,
    payload: { storeKey },
  }
}

export function getTitlesDataUserInfo (storeKey, ids, auth) {
  return function getTitlesDataUserInfoThunk (dispatch) {
    dispatch(setTilesUserInfoProcessing(storeKey, true))
    return getUserNodeInfo({ ids, auth }).then((data) => {
      dispatch(appendTilesDataUserInfo(storeKey, data))
      return data
    })
  }
}

export function appendTilesDataUserInfo (
  storeKey,
  userInfo,
  userInfoProcessing = false,
) {
  return {
    type: APPEND_TILES_DATA_USER_INFO,
    payload: { userInfo, userInfoProcessing, storeKey },
  }
}
