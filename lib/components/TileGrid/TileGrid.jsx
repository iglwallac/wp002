import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { fromJS } from 'immutable'
import _get from 'lodash/get'
import _isString from 'lodash/isString'
import _partial from 'lodash/partial'
import {
  RENDER_TYPE_TILE_GRID_GALLERY,
  RENDER_TYPE_TILE_GRID_ROW,
} from 'render'
import Tile from 'components/Tile'
import Icon from 'components/Icon'
import { TYPE_CONTENT_ARTICLE } from 'services/content-type'
import { isVisible as elementIsVisible, getResizeEventName } from 'services/dom'
import { requestAnimationFrame, cancelAnimationFrame } from 'services/animate'
import { H2, HEADING_TYPES } from 'components/Heading'

export const TILE_ROW_WIDTH_SMALL = 1
export const TILE_ROW_WIDTH_MEDIUM = 2
export const TILE_ROW_WIDTH_MEDIUM_LARGE = 3
export const TILE_ROW_WIDTH_LARGE = 4
export const TILE_ROW_WIDTH_XLARGE = 6

function createShowMoreInfo (type, moreInfoVisible) {
  if (type === TYPE_CONTENT_ARTICLE) {
    return false
  }
  return moreInfoVisible
}

function onClickMoreInfo (
  e,
  active,
  item,
  rowId,
  onChangeTileActive,
  onClickMoreInfoFunc,
  upstreamContext,
  itemIndex,
  itemId,
  itemContentType,
  rowType,
  rowIndex,
  destId,
  campaignId,
) {
  e.stopPropagation()
  if (onClickMoreInfoFunc) {
    onClickMoreInfoFunc(e)
  }
  let updatedUpstreamContext = upstreamContext.mergeDeep(fromJS({
    rowType,
    rowIndex,
    destId,
    campaignId,
  }))
  if (onChangeTileActive) {
    updatedUpstreamContext = upstreamContext.mergeDeep(fromJS({
      source: item.getIn(['reason', 'source'], null),
      score: item.getIn(['reason', 'score'], null),
      videoTasteSegment: item.getIn(['reason', 'videoTasteSegment'], null),
    }))
    onChangeTileActive(
      e,
      !active,
      item.get('id'),
      item.getIn(['type', 'content']),
      rowId,
      updatedUpstreamContext,
      itemIndex,
      itemId,
      itemContentType,
    )
  }
}

function setScrollableTileIndex (componentInstance, rowId, index) {
  const props = componentInstance.props
  if (props.setScrollableTileIndex) {
    if (props.scrollableTileIndex !== index) {
      props.setScrollableTileIndex(rowId, index)
    }
  }
}

function setScrollableRowWidth (componentInstance) {
  const props = componentInstance.props
  if (props.setScrollableRowWidth) {
    const rowWidth = getRowWidth(componentInstance)
    if (props.scrollableRowWidth !== rowWidth) {
      props.setScrollableRowWidth(rowWidth)
    }
  }
}

function renderTiles (props) {
  const {
    scrollable,
    auth,
    page,
    activeTileId,
    moreInfoVisible,
    rowId,
    tileGridData: data,
    scrollableTileIndex = 0,
    scrollableRowWidth = TILE_ROW_WIDTH_LARGE,
    onChangeTileActive,
    setEventSeriesVisited,
    setEventVideoVisited,
    upstreamContext,
    displayMoreInfoButton,
    vertical = false,
    rowType,
    rowIndex,
    destId,
    campaignId,
    displayRowIndex,
    useShelfV2,
  } = props
  if (data.size === 0) {
    return <div className="tile-grid__tiles-placeholder" />
  }

  const tiles = data.map((item, index) => {
    const contentType = item.getIn(['type', 'content'], 'unknown')
    if (contentType === 'unknown') {
      return null
    }
    const active =
      !!(activeTileId === item.get('id') && activeTileId !== undefined)
    // If this item is active represent these values using the next state
    // if the item were clicked again
    const tileStyleClasses = scrollable ? ['tile--row-item'] : []
    const lastIndex = scrollableTileIndex + (scrollableRowWidth - 1)
    if (vertical) {
      tileStyleClasses.push('tile--vertical')
    }
    if (scrollable) {
      if ((scrollableTileIndex > 0) && index === scrollableTileIndex - 1) {
        tileStyleClasses.push('tile--row-item--overflow-left')
      } else if ((index === lastIndex + 1) && (index < data.size)) {
        tileStyleClasses.push('tile--row-item--overflow-right')
      } else if (index >= scrollableTileIndex && index <= lastIndex) {
        tileStyleClasses.push('tile--row-item--visible')
      } else {
        tileStyleClasses.push('tile--row-item--hidden')
      }
    }
    const styles = tileStyleClasses.join(' ')

    /* eslint-enable no-param-reassign */
    return (
      <Tile
        displayMoreInfoButton={displayMoreInfoButton}
        ref={props.onRefActiveTile && active ? props.onRefActiveTile : null}
        auth={auth}
        page={page}
        active={active}
        tileData={item}
        rowId={rowId}
        itemIndex={index}
        rowType={rowType}
        rowIndex={rowIndex}
        destId={destId}
        campaignId={campaignId}
        displayRowIndex={displayRowIndex}
        tileClass={styles}
        showMoreInfo={createShowMoreInfo(data.get('type'), moreInfoVisible)}
        inRow={scrollable}
        setEventSeriesVisited={setEventSeriesVisited}
        setEventVideoVisited={setEventVideoVisited}
        shelfComponent={item.get('shelfComponent')}
        playlistEditComponent={item.get('playlistEditComponent')}
        hideWatchedEditComponent={item.get('hideWatchedEditComponent')}
        key={`${props.tileKeyPrefix
          ? `${props.tileKeyPrefix}-${item.get('id')}`
          : item.get('id')
        }-${item.get('url')}`}
        onClickMoreInfoFunc={onClickMoreInfo}
        onChangeTileActive={onChangeTileActive}
        upstreamContext={upstreamContext}
        vertical={vertical}
        useShelfV2={useShelfV2}
      />
    )
  })

  if (scrollable) {
    /* eslint-disable react/no-string-refs */
    return (
      <div
        ref="tileRow"
        className="tile-grid__tile-wrapper"
      >
        {tiles}
      </div>
    )
    /* eslint-enable react/no-string-refs */
  }
  return tiles
}

function renderArrows (props, componentInstance) {
  const {
    scrollable,
    tileGridData,
    scrollableRowWidth,
    vertical,
  } = props
  const { onClickPrevArrow, onClickNextArrow } = componentInstance
  if (!scrollable) {
    return null
  }
  const scrollableTileIndex = props.scrollableTileIndex
  const rightArrowClassNames = ['icon--right']
  const leftArrowClassNames = ['icon--left']

  rightArrowClassNames.push('tile-grid__icon--scroll-right-overflow')
  leftArrowClassNames.push('tile-grid__icon--scroll-left-overflow')

  const disabledArrowClassName = 'tile-grid__icon--scroll-disabled'
  const maxLength = scrollableTileIndex + scrollableRowWidth

  if (scrollableTileIndex === 0) {
    leftArrowClassNames.push(disabledArrowClassName)
  }
  if (maxLength >= tileGridData.size) {
    rightArrowClassNames.push(disabledArrowClassName)
  }

  return (
    <span className={vertical ? 'tile-grid__navigation tile-grid__navigation--vertical' : 'tile-grid__navigation'}>
      <Icon
        iconClass={leftArrowClassNames}
        onClick={onClickPrevArrow}
      />
      <Icon
        iconClass={rightArrowClassNames}
        onClick={onClickNextArrow}
      />
    </span>
  )
}

function getRowWidth (componentInstance) {
  if (
    !process.env.BROWSER ||
    !componentInstance._rowMedium ||
    !componentInstance._rowLarge
  ) {
    return TILE_ROW_WIDTH_LARGE
  }
  const rowMediumVisible = elementIsVisible(componentInstance._rowMedium)
  const rowMediumLargeVisible = elementIsVisible(
    componentInstance._rowMediumLarge,
  )
  const rowLargeVisible = elementIsVisible(componentInstance._rowLarge)
  const rowXlargeVisible = elementIsVisible(componentInstance._rowXlarge)
  if (rowXlargeVisible) {
    return TILE_ROW_WIDTH_XLARGE
  } else if (rowLargeVisible && !rowXlargeVisible) {
    return TILE_ROW_WIDTH_LARGE
  } else if (rowMediumLargeVisible && !rowXlargeVisible && !rowLargeVisible) {
    return TILE_ROW_WIDTH_MEDIUM_LARGE
  } else if (
    rowMediumVisible &&
    !rowMediumLargeVisible &&
    !rowLargeVisible &&
    !rowXlargeVisible
  ) {
    return TILE_ROW_WIDTH_MEDIUM
  }
  return TILE_ROW_WIDTH_SMALL
}

function getWrapperClass (displayType) {
  const prefix = 'tile-grid__wrapper'
  const wrapperClass = [prefix]

  if (displayType === RENDER_TYPE_TILE_GRID_GALLERY) {
    wrapperClass.push(`${prefix}--gallery`)
  }
  if (displayType === RENDER_TYPE_TILE_GRID_ROW) {
    wrapperClass.push(`${prefix}--row`)
  }
  return wrapperClass.join(' ')
}

function updateScrollableTileIndex (
  componentInstance,
  rowWidth,
  rowId,
  firstIndex,
  lastIndex,
  dataSize,
  scrollableTileIndex,
  activeIndex,
  setScrollableTileIndexFunc,
) {
  // Determine the number of items at the end of the row
  const rowRemainder = dataSize % rowWidth
  // Set the number of items at the end of the row
  // If the number of items is the same as the rowWidth, set it to the rowWidth
  const rowEndItems = rowRemainder > 0 ? rowRemainder : rowWidth
  // Determine what index takes priority based on if there is an activeIndex
  const properIndex = activeIndex || scrollableTileIndex
  const rowBeginning = properIndex < rowWidth
  const rowEnd = properIndex > lastIndex - rowEndItems
  const rowMiddle = !rowBeginning && !rowEnd
  // Set the activeFrame for TILE_ROW_WIDTH_SMALL
  let activeFrame = properIndex
  // For medium, large, and xlarge rowWidth, set the activeFrame
  if (rowWidth !== TILE_ROW_WIDTH_SMALL) {
    if (!activeIndex) {
      if (scrollableTileIndex % rowWidth === 0) {
        activeFrame = Math.ceil(scrollableTileIndex / rowWidth) + 1
      } else {
        activeFrame = Math.ceil(scrollableTileIndex / rowWidth)
      }
    } else {
      activeFrame = Math.ceil((properIndex + 1) / rowWidth)
    }
  }
  // Determine the proper index so we show the correct frame for the user
  const newScrollableTileIndex =
    /* eslint-disable no-mixed-operators */
    rowWidth === TILE_ROW_WIDTH_SMALL
      ? activeFrame
      : activeFrame * rowWidth - rowWidth
  /* eslint-enable no-mixed-operators */

  // If we are at the beginning of the row
  if (rowBeginning) {
    if (!activeIndex) {
      setScrollableTileIndexFunc(componentInstance, rowId, 0)
    } else {
      setScrollableTileIndexFunc(
        componentInstance,
        rowId,
        newScrollableTileIndex,
      )
    }
  } else if (rowMiddle) {
    // If we are in the middle of a row
    if (rowWidth === TILE_ROW_WIDTH_SMALL) {
      setScrollableTileIndexFunc(componentInstance, rowId, activeFrame)
    } else {
      setScrollableTileIndexFunc(
        componentInstance,
        rowId,
        newScrollableTileIndex,
      )
    }
  } else if (rowEnd) {
    // If we are at the end of the row
    if (!activeIndex) {
      setScrollableTileIndexFunc(
        componentInstance,
        rowId,
        dataSize - rowEndItems,
      )
    } else {
      setScrollableTileIndexFunc(
        componentInstance,
        rowId,
        newScrollableTileIndex,
      )
    }
  }
}

function onTileRowResizeDelay (
  componentInstance,
  tileGridData,
  tileActiveId,
  rowId,
  scrollableTileIndex,
  scrollableRowWidth,
) {
  cancelAnimationFrame(componentInstance._onResizeDelay)
  /* eslint-disable no-param-reassign */
  componentInstance._onResizeDelay = requestAnimationFrame(
    _partial(
      onTileRowResize,
      componentInstance,
      tileGridData,
      tileActiveId,
      rowId,
      scrollableTileIndex,
      scrollableRowWidth,
    ),
    100,
  )
  /* eslint-enable no-param-reassign */
}

function onTileRowResize (
  componentInstance,
  tileGridData,
  tileActiveId,
  rowId,
  scrollableTileIndex,
  scrollableRowWidth,
) {
  if (componentInstance._onResizeDelay) {
    /* eslint-disable no-param-reassign */
    componentInstance._onResizeDelay = null
    /* eslint-enable no-param-reassign */
  }
  const rowWidth = getRowWidth(componentInstance)
  if (rowWidth === scrollableRowWidth) {
    return
  }
  const lastIndex = tileGridData.size - 1
  const dataSize = tileGridData.size
  const firstIndex = 0
  const activeIndex = tileActiveId
    ? tileGridData.findIndex(v => v.get('id') === tileActiveId)
    : null

  updateScrollableTileIndex(
    componentInstance,
    rowWidth,
    rowId,
    firstIndex,
    lastIndex,
    dataSize,
    scrollableTileIndex,
    activeIndex,
    setScrollableTileIndex,
  )
  setScrollableRowWidth(componentInstance)
}

function setResizeListener (
  componentInstance,
  tileGridData,
  tileActiveId,
  rowId,
  scrollableTileIndex,
  scrollableRowWidth,
) {
  destroyResizeListener(componentInstance)
  /* eslint-disable no-param-reassign */
  componentInstance._onResize = _partial(
    onTileRowResizeDelay,
    componentInstance,
    tileGridData,
    tileActiveId,
    rowId,
    scrollableTileIndex,
    scrollableRowWidth,
  )
  window.addEventListener(getResizeEventName(), componentInstance._onResize)
  /* eslint-enable no-param-reassign */
}

function destroyResizeListener (componentInstance) {
  if (componentInstance._onResize) {
    window.removeEventListener(
      getResizeEventName(),
      componentInstance._onResize,
    )
  }
}

function renderTitle (title) {
  if (!title) {
    return null
  }
  if (_isString(title)) {
    return <H2 as={HEADING_TYPES.H4} className="tile-grid__title">{title}</H2>
  }
  return <div className="tile-grid__title-container">{title}</div>
}

class TileGrid extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      rowMediumExists: false,
      rowLargeExists: false,
      rowXlargeExists: false,
    }
  }

  componentDidMount () {
    const props = this.props
    if (props.scrollable) {
      setScrollableRowWidth(this)
      setResizeListener(
        this,
        props.tileGridData,
        props.activeTileId,
        props.rowId,
        props.scrollableTileIndex,
        props.scrollableRowWidth,
      )
    }
  }

  componentWillReceiveProps (nextProps) {
    if (process.env.BROWSER && nextProps.scrollable) {
      setScrollableRowWidth(this)
      setResizeListener(
        this,
        nextProps.tileGridData,
        nextProps.activeTileId,
        nextProps.rowId,
        nextProps.scrollableTileIndex,
        nextProps.scrollableRowWidth,
      )
    }
  }

  componentWillUnmount () {
    destroyResizeListener(this)
  }

  onClickPrevArrow = (e) => {
    const { props } = this
    const {
      onClickPrev,
      scrollableTileIndex,
      scrollableRowWidth,
      rowId,
      tileGridData,
    } = props
    const prevIndex = scrollableTileIndex - scrollableRowWidth
    setScrollableTileIndex(this, rowId, prevIndex)
    if (onClickPrev) {
      const item = tileGridData.get(prevIndex)
      onClickPrev(
        e,
        true,
        item.get('id'),
        item.getIn(['type', 'content']),
        rowId,
      )
    }
  }

  onClickNextArrow = (e) => {
    const { props } = this
    const {
      onClickNext,
      scrollableTileIndex,
      scrollableRowWidth,
      upstreamContext,
      rowId,
      tileGridData,
      rowType,
      rowIndex,
      destId,
      campaignId,
      displayRowIndex,
    } = props
    const nextIndex = scrollableTileIndex + scrollableRowWidth
    setScrollableTileIndex(this, rowId, nextIndex)
    if (onClickNext) {
      let newContext = upstreamContext
      const item = tileGridData.get(nextIndex)
      newContext =
        newContext
          .set('itemIndex', scrollableTileIndex)
          .set('rowType', rowType)
          .set('rowIndex', rowIndex)
          .set('destId', destId)
          .set('campaignId', campaignId)
          .set('displayRowIndex', displayRowIndex)
      if (newContext.get('destId') < 0) {
        newContext = newContext.delete('destId')
      }
      onClickNext(
        e,
        true,
        item.get('id'),
        item.getIn(['type', 'content']),
        rowId,
      )
    }
  }

  setRowMediumComponent = (component) => {
    this._rowMedium = component
    this.setState(() => ({ rowMediumExists: true }))
  }

  setRowMediumLargeComponent = (component) => {
    this._rowMediumLarge = component
    this.setState(() => ({ rowMediumLargeExists: true }))
  }

  setRowLargeComponent = (component) => {
    this._rowLarge = component
    this.setState(() => ({ rowLargeExists: true }))
  }

  setRowXlargeComponent = (component) => {
    this._rowXlarge = component
    this.setState(() => ({ rowXlargeExists: true }))
  }

  render () {
    const props = this.props
    const { title, tileGridData, tileGridClass } = props
    const {
      setRowMediumComponent,
      setRowMediumLargeComponent,
      setRowLargeComponent,
      setRowXlargeComponent,
    } = this
    const itemClass = Array.isArray(tileGridClass)
      ? tileGridClass.join(' ')
      : tileGridClass
    const rowHiddenClass = tileGridData.size ? '' : ' tile-grid--hide'
    return (
      <div
        data-rowlabel={_get(title, ['props', 'label'], '')}
        className={itemClass ? `tile-grid${rowHiddenClass} ${itemClass}` : `tile-grid${rowHiddenClass}`}
      >
        {renderTitle(title)}
        <div ref={setRowMediumComponent} className="tile-grid__row-medium" />
        <div
          ref={setRowMediumLargeComponent}
          className="tile-grid__row-medium-large"
        />
        <div ref={setRowLargeComponent} className="tile-grid__row-large" />
        <div ref={setRowXlargeComponent} className="tile-grid__row-xlarge" />
        <div className={getWrapperClass(props.displayType)}>
          {renderTiles(props, this)}
          {renderArrows(props, this)}
        </div>
      </div>
    )
  }
}

TileGrid.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  activeTileId: PropTypes.number,
  tileGridClass: PropTypes.array,
  tileGridData: ImmutablePropTypes.list.isRequired,
  tileKeyPrefix: PropTypes.string,
  displayType: PropTypes.number.isRequired,
  rowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRefActiveTile: PropTypes.func,
  onTileRef: PropTypes.func,
  scrollable: PropTypes.bool,
  scrollableTileIndex: PropTypes.number,
  setScrollableTileIndex: PropTypes.func,
  scrollableRowWidth: PropTypes.number,
  setScrollableRowWidth: PropTypes.func,
  moreInfoVisible: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  onChangeTileActive: PropTypes.func,
  onClickPrev: PropTypes.func,
  onClickNext: PropTypes.func,
  setEventSeriesVisited: PropTypes.func,
  setEventVideoVisited: PropTypes.func,
  upstreamContext: ImmutablePropTypes.map,
}

export default TileGrid
