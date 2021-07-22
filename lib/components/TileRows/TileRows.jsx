import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { List, fromJS } from 'immutable'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import TileGrid from 'components/TileGrid'
import TileBanner from 'components/TileBanner'
import Loadable from 'react-loadable'
import _get from 'lodash/get'
import _partial from 'lodash/partial'
import _isNumber from 'lodash/isNumber'
import {
  getClassName,
  onClickCloseShelf,
  onChangePrevNext,
  onChangeTitleActive,
} from './utils'

const LoadableShelfLoader = Loadable({
  loader: () => import('components/ShelfLoader'),
  loading: () => null,
})

class TileRows extends PureComponent {
  componentWillReceiveProps (nextProps) {
    const { user: prevUser, shelf, auth } = this.props
    const { user } = nextProps

    const id = shelf.get('id')
    const prevLanguage = prevUser.getIn(['data', 'language'], List())
    const language = user.getIn(['data', 'language'], List())

    if (id && !language.equals(prevLanguage)) {
      nextProps.getShelfData({
        id,
        language: language.toJS(),
        contentType: shelf.get('type'),
        auth: auth.get('jwt'),
      })
    }
  }

  componentWillUnmount () {
    const {
      storeKey,
      setShelfVisibleId,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
    } = this.props

    setShelfVisibleId(null, false)
    setTileRowsActiveId(storeKey, null)
    setTileRowsRowActiveId(storeKey, null)
  }


  cloneTileGrid (child, defaultRowId) {
    const props = this.props
    const {
      storeKey,
      tileRows,
      useShelfV2,
    } = props
    const { props: childProps = {} } = child
    let { rowId } = childProps
    if (!_isNumber(rowId)) {
      rowId = defaultRowId
    }

    const isActiveTileRow = tileRows.getIn([storeKey, 'rowActiveId']) === rowId
    const activeTitleId = tileRows.getIn([storeKey, 'activeId'])

    let { tileGridData } = child.props

    if (isActiveTileRow && activeTitleId) {
      const activeIndex = tileGridData.findIndex(tile => tile.get('id') === activeTitleId)

      if (activeIndex !== -1) {
        const tile = tileGridData.get(activeIndex)
        tileGridData = tileGridData.set(
          activeIndex,
          tile.set('shelfComponent', this.renderShelfLoader(tile)),
        )
      }
    }

    const cloneProps = {
      useShelfV2,
      rowId,
      tileGridData,
      activeTileId: isActiveTileRow
        ? tileRows.getIn([storeKey, 'activeId'])
        : null,
      onClickNext: _partial(onChangePrevNext, props),
      onClickPrev: _partial(onChangePrevNext, props),
      onChangeTileActive: _partial(onChangeTitleActive, props),
    }

    return React.cloneElement(child, cloneProps)
  }

  renderShelfLoader (tileData) {
    const { props } = this
    const {
      shelf,
      location,
      upstreamContext,
      setScrollableRowWidth,
      setScrollableTileIndex,
      setTilesScrollableTileIndex,
      setTilesScrollableRowWidth,
      useShelfV2,
      showHideContentButton,
    } = props

    if (!shelf || !shelf.get('visible') || !shelf.get('data')) {
      return null
    }
    const updatedUpstreamContext = upstreamContext.mergeDeep(fromJS({
      source: tileData.getIn(['reason', 'source'], null),
      score: tileData.getIn(['reason', 'score'], null),
      videoTasteSegment: tileData.getIn(['reason', 'videoTasteSegment'], null),
    }))

    return (
      <LoadableShelfLoader
        location={location}
        upstreamContext={updatedUpstreamContext}
        onClickClose={_partial(onClickCloseShelf, props)}
        setTilesScrollableTileIndex={
          setTilesScrollableTileIndex || setScrollableTileIndex
        }
        setTilesScrollableRowWidth={
          setTilesScrollableRowWidth || setScrollableRowWidth
        }
        useShelfV2={useShelfV2}
        showHideContentButton={showHideContentButton}
      />
    )
  }

  renderChildren () {
    const props = this.props
    const { children } = props

    let rowCount = 0

    return React.Children.map(children, (child) => {
      const type = _get(child, 'type')
      if (
        type === TileGrid ||
        type === TileBanner
      ) {
        /* eslint-disable no-param-reassign */
        if (type === TileGrid) {
          child = this.cloneTileGrid(child, rowCount)
        }
      }
      /* eslint-disable no-plusplus */
      rowCount++
      return child
    })
  }

  render () {
    const props = this.props
    const { className } = props

    return (
      <div className={getClassName(className)}>{this.renderChildren()}</div>
    )
  }
}

TileRows.propTypes = {
  tileRows: ImmutablePropTypes.map.isRequired,
  className: PropTypes.array,
  auth: ImmutablePropTypes.map,
  storeKey: PropTypes.string.isRequired,
  shelf: ImmutablePropTypes.map,
  user: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object,
  setScrollableTileIndex: PropTypes.func.isRequired,
  setScrollableRowWidth: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func,
  setTilesScrollableRowWidth: PropTypes.func,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  setShelfVisibleId: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func,
  getShelfData: PropTypes.func,
  upstreamContext: ImmutablePropTypes.map,
  useShelfV2: PropTypes.bool,
}

TileRows.contextTypes = {
  store: PropTypes.object.isRequired,
}

const connectedTileRows = connectRedux(
  state => ({
    user: state.user,
    app: state.app,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setShelfVisibleId: actions.shelf.setShelfVisibleId,
      setEventShelfExpanded: actions.eventTracking.setEventShelfExpanded,
    }
  },
)(TileRows)

export default connectedTileRows
