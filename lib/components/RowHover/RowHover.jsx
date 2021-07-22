import React from 'react'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import map from 'lodash/map'
import fill from 'lodash/fill'
import find from 'lodash/find'
import _get from 'lodash/get'
import { Map } from 'immutable'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { ROW_SCROLL_ARROW_CLICKED } from 'services/event-tracking'
import { BREAKPOINTS_SIX } from 'services/row-hover'
import { H3 } from 'components/Heading'
import Shelf from 'components/Shelf'

export const VIEWPORT_ELEMENT = 'VIEWPORT_ELEMENT'
const SMALL_BREAKPOINT = 420

class RowHover extends React.Component {
  //
  constructor (props) {
    super(props)
    const { staticRow } = this.props
    this.listenerBound = false
    this.state = {
      breakpoint: null,
      position: 0,
      fullRowOverflowRight: true,
      fullRowOverflowLeft: false,
      hoverIndex: null,
      staticRow,
      shelfContentType: null,
      shelfContentId: null,
    }
  }

  componentDidMount () {
    const { listenerBound, setBreakpoint } = this
    if (listenerBound !== true && global.addEventListener) {
      global.addEventListener('resize', setBreakpoint, false)
      this.listenerBound = true
    }
    setBreakpoint()
  }

  componentWillUnmount () {
    const { listenerBound, setBreakpoint } = this
    if (listenerBound && global.removeEventListener) {
      global.removeEventListener('resize', setBreakpoint)
      this.listenerBound = false
    }
  }

  onToggleRow = (back) => {
    return (e) => {
      e.preventDefault()
      const { state, props } = this
      const { breakpoint, position = 0 } = state
      const { items, setRowEvent } = props
      if (breakpoint && items && items.size) {
        if (setRowEvent) {
          setRowEvent(ROW_SCROLL_ARROW_CLICKED)
        }
        // TODO: come up with better scroll behavior than "holds - 2"
        let holds = this.visibleCapacity()
        const fullRow = holds - 1 === items.size
        this.setState({ fullRow })
        if (fullRow) {
          if (back) {
            this.setState({
              fullRowOverflowLeft: false,
              fullRowOverflowRight: true,
            })
          }
          if (!back) {
            this.setState({
              fullRowOverflowLeft: true,
              fullRowOverflowRight: false,
            })
          }
          return
        }
        if (position === 0) {
          holds -= 1
        }
        if (back && position > 0) {
          let p = position - (holds - 2)
          if (holds === 2 || holds === 3) p = position - 1
          if (p < 0) p = 0
          this.setState(() => ({
            position: p,
          }))
        } else if (!back) {
          let p = position + (holds - 2)
          if (p > ((items.size) - holds)) {
            p = (items.size + 1) - holds
          }
          if (holds === 2 || holds === 3) p = position + 1
          this.setState(() => ({
            position: p,
          }))
        }
      }
    }
  }

  getViewportWidth () {
    const { props } = this
    const { viewport } = props
    if (this.container) {
      return viewport === VIEWPORT_ELEMENT
        ? this.container.offsetWidth
        : global.innerWidth
    }
    return 0
  }

  getBreakpoints = () => {
    const { breakpoints } = this.props
    return breakpoints || BREAKPOINTS_SIX
  }

  getBreakpoint () {
    const { state, getBreakpoints } = this
    const { breakpoint } = state
    const width = this.getViewportWidth()
    const breakpoints = getBreakpoints()
    const newBreakpoint = find(breakpoints, bp => (
      width <= bp.size
    )) || null

    if (breakpoint !== newBreakpoint) {
      if (breakpoint === null
        || newBreakpoint === null
        || breakpoint.size !== newBreakpoint.size
      ) {
        return newBreakpoint
      }
    }
    return breakpoint
  }

  setBreakpoint = () => {
    const { state, props } = this
    const { position } = state
    const { items } = props
    const nextBreakpoint = this.getBreakpoint()
    const holds = this.visibleCapacity()
    let nextPosition = position
    const smallScreen = _get(nextBreakpoint, 'size') <= SMALL_BREAKPOINT

    if (items && items.size) {
      while ((nextPosition + holds) > (items.size)) {
        nextPosition -= 1
      }
    }
    if (nextPosition === 0) {
      this.setState(() => ({
        fullRowOverflowLeft: false,
      }))
    }
    this.setState(() => ({
      breakpoint: nextBreakpoint,
      position: Math.max(0, nextPosition),
      smallScreen,
    }))
  }

  setContainer = (el) => {
    this.container = el
  }

  getItemClassNames = (data) => {
    const { state, props } = this
    const { shelfOpened } = props
    const {
      fullRowOverflowLeft,
      breakpoint,
      rightHover,
      leftHover,
      firstTileHovered,
      lastTileHovered,
      staticRow,
    } = state
    const {
      index,
      max,
      hideOverflowRight,
      position,
      fullRow,
      hoverIndex,
    } = data

    let classNames = ['row-hover__item']
    const showArrows = _get(breakpoint, 'showArrows')

    if (staticRow && !showArrows) {
      classNames = ['row-hover__item--no-overflow']
    } else {
      if (index + 1 === max && !hideOverflowRight) {
        classNames.push('row-hover__item--overflow-right')
        if (rightHover) {
          classNames.push('row-hover__item--arrow-hover')
        }
      }
      if (index === position && position !== 0) {
        classNames.push('row-hover__item--overflow-left')
        if (leftHover) {
          classNames.push('row-hover__item--arrow-hover')
        }
      }

      if (position === 0) {
        classNames.push('row-hover__item--zero')
      }
      if (position > 0 && hideOverflowRight) {
        classNames.push('row-hover__item--scrolled')
      }
    }
    // fullrow classes
    if (fullRow) {
      if (fullRowOverflowLeft && index === 0) {
        classNames.push('row-hover__item--overflow-left')
        if (leftHover) {
          classNames.push('row-hover__item--arrow-hover')
        }
      }
      if (fullRowOverflowLeft) {
        classNames.push('row-hover__item--scrolled')
      }
      if (position === 0 && !fullRowOverflowLeft && index + 1 === max) {
        classNames.push('row-hover__item--overflow-right')
        if (rightHover) {
          classNames.push('row-hover__item--arrow-hover')
        }
      }
    }

    // hover classes
    if (hoverIndex !== null) {
      // hovered tile
      if (shelfOpened) {
        return classNames
      }
      if (index === hoverIndex) {
        if (firstTileHovered) {
          classNames.push('row-hover__item--hovered-move-right')
        }
        if (lastTileHovered) {
          classNames.push('row-hover__item--hovered-move-left')
        }
        if (!firstTileHovered && !lastTileHovered) {
          classNames.push('row-hover__item--hovered')
        }
      }
      // non hovered tiles
      if (index !== hoverIndex) {
        if (firstTileHovered) {
          if (index < hoverIndex) {
            classNames.push('row-hover__item--move-left')
          }
          if (index > hoverIndex) {
            classNames.push('row-hover__item--move-right-first')
          }
        }
        if (lastTileHovered) {
          if (index < hoverIndex) {
            classNames.push('row-hover__item--move-left-last')
          }
          if (index > hoverIndex) {
            classNames.push('row-hover__item--move-right')
          }
        }
        if (!firstTileHovered && !lastTileHovered) {
          if (index > hoverIndex) {
            classNames.push('row-hover__item--move-right')
          }
          if (index < hoverIndex) {
            classNames.push('row-hover__item--move-left')
          }
        }
      }
    }

    return classNames
  }

  setShelfContent = (type, id, legacyContentType) => {
    const {
      auth,
      language,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
      getShelfData,
      setShelfVisibleId,
    } = this.props

    this.setState({
      shelfContentType: type,
      shelfContentId: id,
    })

    // temporary things
    const contentType = legacyContentType
    const storeKey = 'memberHome'
    const active = true
    const rowId = 0
    const jwt = auth.get('jwt')

    // Do what onChangeTitleActive() does
    setTileRowsActiveId(storeKey, active ? id : null)
    setTileRowsRowActiveId(storeKey, active ? rowId : null)

    getShelfData({ id, language, contentType, auth: jwt })

    const shelfId = `${id}.row${rowId}`
    setShelfVisibleId(shelfId, true)
  }

  visibleCapacity () {
    const { props, state } = this
    const { maxItemsInView } = props
    const { breakpoint } = state
    if (breakpoint) {
      const { holds } = breakpoint
      const val = maxItemsInView > 0 && maxItemsInView <= holds
        ? maxItemsInView
        : holds
      return val
    }
    return null
  }

  handleMouseEnter = (index, max, hideOverflowRight, fullRow) => {
    const {
      position,
      fullRowOverflowLeft,
      staticRow,
      smallScreen,
    } = this.state
    const { onHoverChange } = this.props

    // no hover < 420 px wide
    if (smallScreen) return null

    if (!staticRow) {
      const firstTileHovered =
        (position === 0 && index === 0) ||
        (position !== 0 && index - 1 === position) ||
        (fullRow && fullRowOverflowLeft && index === 1)

      const lastTileHovered =
        (index + 2 === max && !hideOverflowRight) ||
        (index + 1 === max && hideOverflowRight) ||
        (fullRow && !fullRowOverflowLeft && index === max - 2)

      this.setState(() => ({
        hoverIndex: index,
        firstTileHovered,
        lastTileHovered,
      }))
    }

    if (staticRow) {
      const firstTileHovered = index === 0
      const lastTileHovered = index + 1 === max

      this.setState(() => ({
        hoverIndex: index,
        firstTileHovered,
        lastTileHovered,
      }))
    }
    onHoverChange(true)
    return null
  }

  handleMouseLeave = () => {
    const { onHoverChange } = this.props
    this.setState(() => ({ hoverIndex: null }))
    onHoverChange(false)
  }

  renderShelf = () => {
    const {
      shelf,
      shelfOpened,
      closeShelf,
      setTilesScrollableTileIndex,
      setTilesScrollableRowWidth,
      upstreamContext,
    } = this.props

    const { breakpoint } = this.state

    if (!shelfOpened) {
      return null
    }

    if (breakpoint) {
      const holds = this.visibleCapacity()

      if (holds === 0) {
        return null
      }
    }

    const onClickClose = (e) => {
      e.preventDefault()
      closeShelf()
    }

    if (!shelf || !shelf.get('visible') || !shelf.get('data')) {
      return null
    }

    return (
      <div className="row-hover__shelf">
        <Shelf
          location={location}
          onClickClose={onClickClose}
          setTilesScrollableTileIndex={setTilesScrollableTileIndex}
          setTilesScrollableRowWidth={setTilesScrollableRowWidth}
          upstreamContext={upstreamContext}
        />
      </div>
    )
  }

  renderLeftArrow () {
    const { onToggleRow, props, state } = this
    const { breakpoint, position, fullRowOverflowLeft, fullRow, staticRow } = state
    const { title = '', items } = props
    const holds = _get(breakpoint, 'holds')
    const showArrows = _get(breakpoint, 'showArrows')
    if ((holds > items.size && !fullRow) || (!showArrows && staticRow)) {
      return null
    }
    if (breakpoint && items && items.size && !breakpoint.hideArrow) {
      return (
        <button
          disabled={position === 0 && !fullRowOverflowLeft}
          onClick={onToggleRow(true)}
          aria-label={`View previous ${title}`}
          className="icon icon--left row-hover__control row-hover__controls--back"
          onMouseEnter={() => this.setState({ leftHover: true })}
          onMouseLeave={() => this.setState({ leftHover: false })}
        />
      )
    }
    return null
  }

  renderRightArrow () {
    const { onToggleRow, props, state } = this
    const { breakpoint, position, fullRowOverflowLeft, staticRow } = state
    const { title = '', items } = props
    const showArrows = _get(breakpoint, 'showArrows')
    if (breakpoint && items && items.size && !breakpoint.hideArrow) {
      let holds = this.visibleCapacity()
      if (position === 0) {
        holds -= 1
      }

      const fullRow = items.size === holds
      const singleScroll = position === 1 && holds === 3

      if ((holds > items.size && !fullRow) || (!showArrows && staticRow)) {
        return null
      }
      let showArrow = position + holds < items.size
      if (items.size + 1 >= holds && (position === 0 || singleScroll)) {
        showArrow = true
      }

      return (
        <button
          disabled={!showArrow || (fullRow && fullRowOverflowLeft)}
          onClick={onToggleRow(false)}
          aria-label={`View more ${title}`}
          className="icon icon--right row-hover__control row-hover__control--forward"
          onMouseEnter={() => this.setState({ rightHover: true })}
          onMouseLeave={() => this.setState({ rightHover: false })}
        />
      )
    }
    return null
  }
  renderContent () {
    const {
      props,
      state,
      handleMouseEnter,
      handleMouseLeave,
    } = this

    const { items, children, staticRow, shelfOpened } = props
    const {
      breakpoint,
      position,
      hoverIndex,
      shelfContentType,
      shelfContentId,
      smallScreen,
      fullRowOverflowLeft,
    } = state

    if (breakpoint) {
      let holds = this.visibleCapacity()

      if (holds === 0) {
        return null
      }
      const showArrows = _get(breakpoint, 'showArrows')
      const hideOverflowRight =
        position + holds > (items.size - 1) &&
        items.size !== holds

      // at position 0 there are less items b/c there is no overflow left
      const minusOne = !staticRow || (staticRow && showArrows)
      if (minusOne && (position === 0 || hideOverflowRight)) {
        holds -= 1
      }

      const max = position + holds
      const fullRow = holds === items.size

      const placeholderCount = minusOne ? holds - 1 : holds

      let itemList = items
      if (breakpoint.skipOne) {
        itemList = itemList.shift()
      }

      const rowClassNames = ['row-hover__content', `row-hover__holds-${holds}`]
      if (hoverIndex !== null) rowClassNames.push('row-hover__content--hovered')
      if (position === 0) rowClassNames.push('row-hover__zero')
      if ((position > 0 && hideOverflowRight) || (fullRow && fullRowOverflowLeft)) {
        rowClassNames.push('row-hover__scrolled')
      }

      const onOpenShelf = (type, id, legacyContentType) => {
        props.openShelf()
        this.setShelfContent(type, id, legacyContentType)
      }

      const propsPlus = {
        ...props,
        onOpenShelf,
      }

      const classData = {
        fullRow,
        hideOverflowRight,
        max,
        position,
        hoverIndex,
      }

      return (
        <div className={rowClassNames.join(' ')}>
          {
            itemList && itemList.size ? (
              itemList.valueSeq().map((item, index) => {
                let newIndex = index
                // this prevents skipping of the 2nd item when the "holds" value changes
                if (smallScreen && holds === 3) {
                  newIndex += 1
                }

                if (newIndex >= position && newIndex < max) {
                  const itemShelfOpened = item.get('type') === shelfContentType && item.get('id') === shelfContentId
                  const itemClassNames = this.getItemClassNames({ ...classData, index: newIndex })
                  const hovered = index === hoverIndex
                  const key = `item-${newIndex}`

                  const arrowClassNames = ['row-hover__shelf-arrow']
                  if (shelfOpened && itemShelfOpened) {
                    arrowClassNames.push('row-hover__shelf-arrow--opened')
                  }

                  const notchClassNames = ['row-hover__shelf-notch']
                  if (shelfOpened && itemShelfOpened) {
                    notchClassNames.push('row-hover__shelf-notch--opened')
                  }

                  return (
                    <div
                      key={key}
                      className={itemClassNames.join(' ')}
                      onMouseEnter={() => handleMouseEnter(index, max, hideOverflowRight, fullRow)}
                      onMouseLeave={() => handleMouseLeave()}
                    >
                      <div className="row-hover__item-shadow">
                        { children(item, { ...propsPlus, itemShelfOpened }, index, hovered) }
                      </div>
                      <div className={arrowClassNames.join(' ')} />
                      <div className={notchClassNames.join(' ')} />
                    </div>
                  )
                }
                return null
              }).toJS()
            ) : (
              map(fill(Array(placeholderCount), 1), (item, index) => {
                const itemClassNames = this.getItemClassNames({ ...classData, index })
                const key = `placeholder-${index}`
                return (
                  <div key={key} className={itemClassNames.join(' ')}>
                    {children(Map(), propsPlus, index)}
                  </div>
                )
              })
            )
          }
          <div className="row-hover__controls">
            { hoverIndex === null ? this.renderLeftArrow() : null }
            { hoverIndex === null ? this.renderRightArrow() : null }
          </div>
        </div>
      )
    }
    return null
  }

  renderLabel () {
    const { props } = this
    const { label } = props

    if (label) {
      return (
        <H3 className="row-hover__label">
          {label}
        </H3>
      )
    }
    return null
  }

  render () {
    const { setContainer, renderShelf } = this
    return (
      <section className="row-hover">
        {this.renderLabel()}
        <div ref={setContainer} className="row-hover__wrapper">
          {this.renderContent()}
        </div>
        { renderShelf() }
      </section>
    )
  }
}

RowHover.propTypes = {
  items: ImmutablePropTypes.list.isRequired,
  children: PropTypes.func.isRequired,
  maxItemsInView: PropTypes.number,
  staticRow: PropTypes.bool,
  breakpoints: PropTypes.array,
  onHoverChange: PropTypes.func,
  label: PropTypes.string,
}

RowHover.defaultProps = {
  onHoverChange: () => {},
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      return {
        shelf: state.shelf,
        auth: state.auth,
        language,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        getShelfData: actions.shelf.getShelfData,
        setShelfVisibleId: actions.shelf.setShelfVisibleId,
      }
    },
  ),
)(RowHover)
