import { List, Map, fromJS } from 'immutable'
import { TYPE_PLACEHOLDER } from 'services/content-type'
import _isArray from 'lodash/isArray'
import { SET_AUTH_LOGIN_SUCCESS } from 'services/auth/actions'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_AUTH_LOGIN_SUCCESS:
    // TODO: this reducer section is part of Skunk 150 - progressive series page
    // - if the user just logged in, we want to blow out the userInfoProcessing
    //   for detailSeries
    // - it should be removed upon completion of the Skunk 150 test
    // - This solves an issue where userInfo is not properly applied to tile data
    //   when the user logs in while already on a 'series' page
    // - It's an edge case, but causes quite a jarring UI experience
      return state.withMutations(mutateState => mutateState.update(
        'detailSeries',
        Map(),
        updateState => updateState
          .remove('userInfoProcessing'),
      ))
    case actions.SET_TILES_PAGE:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        updateState => updateState
          .set('processing', action.payload.processing)
          .set('id', action.payload.id)
          .set('path', action.payload.path)
          .set('page', action.payload.page)
          .set('limit', action.payload.limit)
          .set('season', action.payload.season)
          .set('query', fromJS(action.payload.query)),
      ))
    case actions.APPEND_TILES_DATA_TITLES:
      // We should keep the current titles and remove any placeholders.
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        updateState => updateState
          .set('processing', action.payload.processing)
          .set('placeholderTitlesExist', false)
          .updateIn(['data', 'titles'], List(), (
            titles,
          ) => {
            if (action.payload.filterPlaceholders) {
              // eslint-disable-next-line no-param-reassign
              titles = titles.filter(
                tile =>
                  tile.getIn(['type', 'content']) !== TYPE_PLACEHOLDER,
              )
            }
            return titles.concat(fromJS(action.payload.titles))
          }),
      ))
    case actions.SET_TILES_DATA:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        updateState => updateState
          .set('processing', action.payload.processing)
          .set('placeholderTitlesExist', false)
          .set('data', fromJS(action.payload.data)),
      ))
    case actions.DELETE_TILES_DATA:
      return state.withMutations(mutateState => mutateState
        .deleteIn([action.payload, 'data'])
        .deleteIn([action.payload, 'season'])
        .deleteIn([action.payload, 'seasonNums']))
    case actions.RESET_TILES:
      return initialState
    case actions.DELETE_TILES:
      return state.withMutations((mutateState) => {
        const keys = List(
          _isArray(action.payload) ? action.payload : [action.payload],
        )
        return keys.reduce(
          (reduction, value) => reduction.delete(value),
          mutateState,
        )
      })
    case actions.DELETE_TILES_DATA_BY_ID:
      return state.withMutations(mutateState => mutateState.updateIn(
        [action.payload.storeKey, 'data', 'titles'],
        List(),
        tiles => tiles.filter(
          tile => !action.payload.ids.includes(tile.get('id')),
        ),
      ).updateIn(
        [action.payload.storeKey, 'data', 'totalCount'],
        0,
        totalCount => totalCount - action.payload.ids.size,
      ))
    case actions.SET_TILES_DATA_PLACEHOLDER_TITLES:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        updateState => updateState
          .delete('data')
          .setIn(['data', 'titles'], fromJS(action.payload.titles))
          .set('placeholderTitlesExist', true)
          .delete('activeId'),
      ))
    case actions.APPEND_TILES_DATA_PLACEHOLDER_TITLES:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        updateState => updateState
          .updateIn(['data', 'titles'], List(), titles =>
            titles.concat(fromJS(action.payload.titles)),
          )
          .set('placeholderTitlesExist', true)
          .delete('activeId'),
      ))
    case actions.SET_TILES_SCROLLABLE_TILE_INDEX:
      return state.setIn(
        [action.payload.storeKey, 'data', 'scrollableTileIndex'],
        action.payload.scrollableTileIndex,
      )
    case actions.SET_TILES_SCROLLABLE_ROW_WIDTH:
      return state.set('scrollableRowWidth', action.payload)
    case actions.SET_TILES_ID_TYPE_PAGE_LIMIT_PATH_QUERY:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        value => value
          .set('id', action.payload.id)
          .set('type', action.payload.type)
          .set('page', action.payload.page)
          .set('limit', action.payload.limit)
          .set('path', action.payload.path)
          .set('query', fromJS(action.payload.query))
          .set('processing', action.payload.processing),
      ))
    case actions.SET_TILES_PROCESSING:
      return state.setIn(
        [action.payload.storeKey, 'processing'],
        action.payload.processing,
      )
    case actions.SET_TILES_USER_INFO_PROCESSING:
      return state.setIn(
        [action.payload.storeKey, 'userInfoProcessing'],
        action.payload.processing,
      )
    case actions.SET_TILES_ACTIVE_ID:
      return state.setIn(
        [action.payload.storeKey, 'activeId'],
        action.payload.activeId,
      )
    case actions.RESET_TILES_ACTIVE_ID:
      return state.delete([action.payload.storeKey, 'activeId'])
    case actions.SET_TILES_USER_PLAYLIST:
      return state.withMutations(mutateState => mutateState.updateIn(
        [action.payload.storeKey, 'data', 'titles'],
        titles => titles.map((title) => {
          if (title.get('id') === action.payload.id) {
            return title.setIn(
              ['userInfo', 'playlist'],
              action.payload.inPlaylist,
            )
          }
          return title
        }),
      ))
    case actions.APPEND_TILES_DATA_USER_INFO:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        updateState => updateState
          .set('userInfoProcessing', action.payload.userInfoProcessing)
          .updateIn(
            ['data', 'titles'],
            List(),
            (titles) => {
              const userInfoData = fromJS(action.payload.userInfo)
              // Map the userInfo onto existing titles by id
              return titles.map((title) => {
                const userInfo = userInfoData.find(
                  _userInfo => title.get('id') === _userInfo.get('id'),
                )
                // If we found userInfo add it otherwise use the original userInfo or a new Map.
                return title.set(
                  'userInfo',
                  userInfo || title.get('userInfo', Map()),
                )
              })
            },
          ),
      ))
    case actions.SET_TILES_SEASON:
      return state.setIn(
        [action.payload.storeKey, 'season'],
        action.payload.season,
      )
    case actions.SET_TILES_SEASON_NUMS:
      return state.setIn(
        [action.payload.storeKey, 'seasonNums'],
        fromJS(action.payload.seasonNums),
      )
    default:
      return state
  }
}
