import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { compose } from 'recompose'
import _get from 'lodash/get'
import _partial from 'lodash/partial'
import _assign from 'lodash/assign'
import _omit from 'lodash/omit'
import _parseInt from 'lodash/parseInt'
import _isNil from 'lodash/isNil'
import _isFunction from 'lodash/isFunction'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { connect as connectRouter } from 'components/Router/connect'
import { PRODUCTION_STATUS_ACTIVE } from 'services/detail'
import { isSynced as resolverIsSynced } from 'components/Resolver/synced'

const COMPONENT_NAME = process.env.NODE_ENV === 'production' ? 'tc' : 'TilesConnect'
const ORIGINAL_PROGRAMS_PATH = '/seeking-truth/original-programs'
const YOGA_SERIES_PATH = '/yoga/yoga-series'

export default connect

export function connect (options) {
  const { storeKey } = options

  if (!storeKey) {
    throw new Error('The storeKey option is required.')
  }
  return _partial(wrapComponent, options)
}

function tilesEqualLocation (tiles, resolver) {
  try {
    const tilesQuery = tiles.get('query', Map()).reduce((reduction, queryItem, queryKey) => {
      // remove any falsy values from the query to prevent
      // mismatches between the query objects for null or empty string
      if (!queryItem) {
        return reduction
      }

      return reduction.update(queryKey, () => queryItem)
    }, Map())

    const resolverQuery = resolver.get('query', Map()).reduce((reduction, queryItem, queryKey) => {
      // remove any falsy values from the query to prevent
      // mismatches between the query objects for null or empty string
      if (!queryItem) {
        return reduction
      }

      return reduction.update(queryKey, () => queryItem)
    }, Map())

    return resolverQuery.equals(tilesQuery)
  } catch (e) {
    // Do nothing
    // eslint-disable-next-line no-console
    console.error('--- FAILED ---', e)
  }
  return true
}

function allowPlaceholderUpdate (props) {
  const { location, tilesConnect, resolver } = props
  const { tiles } = tilesConnect
  const queryAllow = !tilesEqualLocation(tiles, resolver)
  const pathAllow = location.pathname !== tiles.get('path')
  return (queryAllow || pathAllow) && !tiles.get('placeholderTitlesExist')
}

function updatePlaceholders (options, props) {
  const storeKey = getStoreKey(options, props)
  const { setTilesDataPlaceholderTitles, setShelfVisible } = props
  setShelfVisible(false)
  setTilesDataPlaceholderTitles(storeKey)
}

function getLang (tilesConnect) {
  const { user } = tilesConnect
  return user.getIn(['data', 'language'], List()) || List()
}

function allowUpdateData (options, prevProps, props) {
  const { tilesConnect: prevtilesConnect } = prevProps
  const { auth: prevAuth } = prevtilesConnect

  const { location, tilesConnect } = props
  const { auth, tiles, resolver } = tilesConnect
  if (tiles.get('processing') || !resolverIsSynced(resolver, location)) {
    return false
  }

  const authAllow = prevAuth.get('jwt') !== auth.get('jwt')
  const queryAllow = !tilesEqualLocation(tiles, resolver)
  const tilesAllow = getId(options, props) !== tiles.getIn(['data', 'id'])
  const langAllowed = !getLang(tilesConnect).equals(getLang(prevtilesConnect))

  return authAllow || queryAllow || tilesAllow || langAllowed
}

function getId (options, props) {
  const { id, propAsId, queryParamAsId, parentStateAsId } = options
  const { location, tilesConnect } = props
  const { resolver, parentState } = tilesConnect

  if (!_isNil(id)) {
    return id
  }

  if (!_isNil(propAsId)) {
    return _get(props, propAsId)
  }

  if (!_isNil(parentStateAsId)) {
    return parentState.getIn(['data', 'id'])
  }

  if (!_isNil(queryParamAsId)) {
    return _get(location, ['query', queryParamAsId], '')
  }

  return resolver.getIn(['data', 'id'])
}

function updateData (options, props) {
  getTilesDataCreate(options, props)
}

function getStoreKey (options, props) {
  const { storeKey } = options

  if (_isFunction(storeKey)) {
    return storeKey(options, props)
  }
  return storeKey
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

function getDetailSeriesSeason (options, props, params) {
  const { location, tilesConnect } = props
  const { parentState } = tilesConnect

  const season = _get(params, ['season']) || _get(location, ['query', 'season'])

  if (season) {
    return _parseInt(season)
  }

  const seasonNums = parentState.getIn(['data', 'seasonNums'], List())
  const isActiveSeries =
    parentState.getIn(['data', 'productionStatus']) === PRODUCTION_STATUS_ACTIVE

  return isActiveSeries ? seasonNums.last() : seasonNums.first()
}

function getTilesDataCreate (options, props, params) {
  const { location, tilesConnect, getTilesPageData, defaultSort } = props
  const { tiles, resolver, auth, locale, user, parentState } = tilesConnect
  const {
    type = resolver.getIn(['data', 'type']),
    seriesLink,
    ignoreEmptyId,
    limit: limitOverride,
  } = options

  const storeKey = getStoreKey(options, props)
  const queryPage = _get(location, ['query', 'page'])
  const limit = limitOverride || tiles.get('limit')
  const page = queryPage ? _parseInt(queryPage) - 1 : 0
  const season = getDetailSeriesSeason(options, props, params)
  const seriesId = parentState.getIn(['data', 'seriesId'])
  const id = getId(options, props)
  const sort = defaultSort || null

  if (ignoreEmptyId && !id) {
    return
  }

  getTilesPageData({
    storeKey,
    id,
    type,
    resolver,
    location,
    auth,
    tiles,
    locale,
    user,
    page,
    limit,
    season,
    seriesId,
    seriesLink,
    sort,
  })
}

function getTilesDataLoadMore (options, props, params) {
  const {
    location,
    tilesConnect,
    getTilesPageData,
    appendTilesDataPlaceholderTitles,
    defaultSort,
  } = props
  const { tiles, resolver, auth, locale, user, parentState } = tilesConnect
  const { type = resolver.getIn(['data', 'type']), seriesLink, ignoreEmptyId } = options

  const storeKey = getStoreKey(options, props)
  const limit = tiles.get('limit')
  const page = tiles.get('page', 0) + 1
  const season = getDetailSeriesSeason(options, props, params)
  const seriesId = parentState.getIn(['data', 'seriesId'])
  const id = getId(options, props)
  const sort = defaultSort || null

  appendTilesDataPlaceholderTitles(storeKey)
  if (ignoreEmptyId && !id) {
    return
  }

  getTilesPageData({
    storeKey,
    id,
    type,
    resolver,
    location,
    auth,
    tiles,
    locale,
    user,
    page,
    limit,
    season,
    seriesId,
    seriesLink,
    updateData: true,
    sort,
  })
}

function createWrappedProps (options, props) {
  const { attachProps = true } = options
  const cleanProps = _omit(props, ['tilesConnect'])

  if (attachProps) {
    return _assign({}, cleanProps, {
      getTilesDataCreate: _partial(getTilesDataCreate, options, props),
      getTilesDataLoadMore: _partial(getTilesDataLoadMore, options, props),
      getDetailSeriesSeason: _partial(getDetailSeriesSeason, options, props),
    })
  }
  return cleanProps
}

function wrapComponent (options, WrappedComponent) {
  const { enablePageBehaviors = false } = options

  class TilesConnect extends PureComponent {
    componentDidMount () {
      const { props } = this

      if (enablePageBehaviors && allowPlaceholderUpdate(props)) {
        updatePlaceholders(options, props)
      }
    }

    componentDidUpdate (prevProps) {
      const { props } = this

      if (!process.env.BROWSER || !enablePageBehaviors) {
        return
      }

      if (allowPlaceholderUpdate(props)) {
        updatePlaceholders(options, props)
      } else if (allowUpdateData(options, prevProps, props)) {
        updateData(options, props)
      }
    }

    render () {
      const { props } = this

      if (!WrappedComponent) {
        return null
      }

      return <WrappedComponent {...createWrappedProps(options, props)} />
    }
  }

  TilesConnect.displayName = `${COMPONENT_NAME}(${getDisplayName(
    WrappedComponent,
  )})`

  TilesConnect.propTypes = {
    location: PropTypes.object.isRequired,
    tilesConnect: PropTypes.shape({
      resolver: ImmutablePropTypes.map.isRequired,
      tiles: ImmutablePropTypes.map.isRequired,
      auth: ImmutablePropTypes.map.isRequired,
      user: ImmutablePropTypes.map.isRequired,
      parentState: ImmutablePropTypes.map.isRequired,
    }),
    getTilesPageData: PropTypes.func.isRequired,
    setTilesDataPlaceholderTitles: PropTypes.func.isRequired,
    appendTilesDataPlaceholderTitles: PropTypes.func.isRequired,
    setShelfVisible: PropTypes.func.isRequired,
  }

  return compose(
    connectRouter(),
    connectRedux(
      (state, props) => {
        // When modifying redux state props namespace the props
        // used in the HOC to protect other components
        const storeKey = getStoreKey(options, props)
        // default to 'detail' until we can update that code as well
        const { parentStateKey = 'detail' } = options
        const language = state.user.getIn(['data', 'language', 0])
        const resolver = state.resolver
        let defaultSort = props.defaultSort
        const isRecentPath =
          resolver.get('path') === ORIGINAL_PROGRAMS_PATH ||
          resolver.get('path') === YOGA_SERIES_PATH

        if (isRecentPath && language !== 'en') {
          defaultSort = 'recent'
        }

        return {
          defaultSort,
          tilesConnect: {
            resolver: state.resolver,
            tiles: state.tiles.get(storeKey, Map()),
            parentState: _get(state, parentStateKey, Map()),
            auth: state.auth,
            user: state.user,
            jumbotron: state.jumbotron.get(storeKey, Map()),
          },
        }
      },
      (dispatch) => {
        const actions = getBoundActions(dispatch)
        return {
          getTilesPageData: actions.tiles.getTilesPageData,
          setTilesDataPlaceholderTitles:
            actions.tiles.setTilesDataPlaceholderTitles,
          appendTilesDataPlaceholderTitles:
            actions.tiles.appendTilesDataPlaceholderTitles,
          setShelfVisible: actions.shelf.setShelfVisible,
        }
      },
    ),
  )(TilesConnect)
}
