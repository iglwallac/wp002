import React from 'react'
import map from 'lodash/map'
import fill from 'lodash/fill'
import { Map, List } from 'immutable'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import isNumber from 'lodash/isNumber'
import findIndex from 'lodash/findIndex'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import UniqueId from 'components/UniqueId'
import { H3 } from 'components/Heading'
import Shelf from 'components/Shelf'
import ShelfV2 from 'components/Shelf.v2'
import RowAccessor from './_RowAccessor'

function noop () {
  // do nothing
}

export const STYLES = {
  S12345: 's12345',
  S12334: 's12334',
  S12456: 's12456',
  S12234: 's12234',
  S123: 's123',
  S034: 's034',
  S23456: 's23456',
  TOPICS_LARGE: 'topics-large',
  TOPICS_SMALL: 'topics-small',
  TOPICS_TABLET: 'topics-tablet',
}

function getItem (node) {
  if (node.tagName === 'LI') return node
  return getItem(node.parentNode)
}

function getItemIndex (item, container) {
  const items = container.querySelectorAll('.row-v2__item')
  return findIndex(items, i => i === item)
}

function getTransform (index, max, limit) {
  const fullWidth = (max / limit) * 100
  const itemWidth = fullWidth / max
  const left = itemWidth * index
  return { transform: `translate3d(-${left}%,0,0)` }
}

function getRootClass ({ asGrid, shelfIsOpen, className, style }, { hoverIndex }) {
  const cls = ['row-v2']
  if (isNumber(hoverIndex)) cls.push('row-v2--hovering')
  if (shelfIsOpen) cls.push('row-v2--shelf-visible')
  if (className) cls.push(`row-v2--${className}`)
  if (style) cls.push(`row-v2--${style}`)
  if (asGrid) cls.push('row-v2--grid')
  return cls.join(' ')
}

function getLabel ({ label, description, ctaLabel, ctaOnClick, ctaUrl }) {
  const modifier = description ? ' row-v2__label--nomargin' : ''
  return label || ctaLabel ? (
    <H3 className={`row-v2__label${modifier}`}>
      {label ? (
        <span className="row-v2__label-text">
          {label}
        </span>
      ) : null}
      {ctaLabel ? (
        <span className="row-v2__label-cta">
          <Link
            to={ctaUrl || URL_JAVASCRIPT_VOID}
            role={ctaUrl ? 'link' : 'button'}
            className="row-v2__cta"
            onClick={ctaOnClick}
            scrollToTop
          >{ctaLabel}
          </Link>
        </span>
      ) : null}
    </H3>
  ) : null
}

function getDescription ({ description }) {
  return description ? (
    <p className="row-v2__description">
      {description}
    </p>
  ) : null
}

class RowV2 extends React.Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      shelfListeners: List(),
      contentTransform: null,
      showControls: false,
      hoverIndex: null,
      shelfIndex: null,
      limit: null,
      index: 0,
    }
  }

  componentDidMount () {
    const { props } = this
    const { items } = props
    const refreshListeners = items.size > 0
    this.configure({ refreshListeners })
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const { items, viewportWidth } = props
    const { viewportWidth: prevWidth, items: prevItems } = prevProps
    const refreshListeners = !items.equals(prevItems)

    if (refreshListeners || viewportWidth !== prevWidth) {
      this.configure({ refreshListeners })
    }
  }

  onHoverEnter = (e) => {
    const { props, state } = this
    const { index, limit } = state
    const { onHover, items } = props
    const { currentTarget } = e

    const item = getItem(currentTarget)
    const hoverIndex = getItemIndex(item, this.$container)
    const offstage = hoverIndex >= (index + limit) || hoverIndex < index
    const isFocusEvent = currentTarget !== item

    onHover({
      target: currentTarget,
      leaving: false,
      entering: true,
      isFocusEvent,
      item,
    })

    if (isFocusEvent && offstage) {
      this.setState(() => ({
        contentTransform: getTransform(hoverIndex, items.size, limit),
        index: hoverIndex,
        hoverIndex,
      }))
      return
    }

    this.setState(() => ({
      hoverIndex,
    }))
  }

  onHoverLeave = (e) => {
    const { props } = this
    const { onHover } = props
    const { currentTarget } = e
    const item = getItem(currentTarget)

    if (onHover) {
      onHover({
        target: currentTarget,
        entering: false,
        leaving: true,
        item,
      })
    }
    this.setState(() => ({
      hoverIndex: undefined,
    }))
  }
  // eslint-disable-next-line react/sort-comp
  openShelf = (contentId, contentType, index, legacyContentType) => {
    const { props } = this
    const {
      setTileRowsRowActiveId,
      setTileRowsActiveId,
      setShelfVisibleId,
      shelfModifier,
      getShelfData,
      uniqueId,
    } = props

    const val = legacyContentType || contentType

    getShelfData({ id: contentId, contentType: val })
    setTileRowsRowActiveId('hover-row', uniqueId)
    setTileRowsActiveId('hover-row', contentId)
    setShelfVisibleId(uniqueId, true)

    this.setState(() => ({
      hoverIndex: undefined,
      shelfIndex: index,
    }))
    // depricating. use onOpenShelf prop
    if (shelfModifier) {
      shelfModifier()
    }
  }

  setFirstItem = (el) => {
    this.$firstItem = el
  }

  setContainer = (el) => {
    this.$container = el
  }

  moveForward = (e) => { // eslint-disable-line react/sort-comp
    e.preventDefault()
    const { state, props } = this
    const { index, limit } = state
    const { items } = props
    const total = items.size

    let nextIndex = index + limit

    if ((nextIndex + limit) >= total) {
      nextIndex = total - limit
    }

    if (nextIndex < 0) {
      nextIndex = 0
    }

    this.setState(() => ({
      contentTransform: getTransform(nextIndex, total, limit),
      index: nextIndex,
    }))
  }

  moveBack = (e) => {
    e.preventDefault()
    const { state, props } = this
    const { index, limit } = state
    const { items } = props

    let nextIndex = index - limit

    if (nextIndex < 0) {
      nextIndex = 0
    }
    this.setState(() => ({
      contentTransform: getTransform(nextIndex, items.size, limit),
      index: nextIndex,
    }))
  }

  closeShelf = (e) => {
    e.preventDefault()
    const { props, state } = this
    const { shelfIndex } = state
    const {
      setTileRowsRowActiveId,
      setTileRowsActiveId,
      clearOpenShelfIndex,
      setShelfVisibleId,
      onCloseShelf,
      items,
    } = props
    const item = items.get(shelfIndex)
    setShelfVisibleId(null, false)
    setTileRowsActiveId('hover-row', null)
    setTileRowsRowActiveId('hover-row', null)
    clearOpenShelfIndex(item, shelfIndex) // depricating
    onCloseShelf(item, shelfIndex) // replacing clearOpenShelfIndex
  }

  getRenderableItems () {
    const { props, state } = this
    const { index, limit } = state
    const { items, static: isStatic } = props
    if (isStatic && limit) {
      return items.slice(index, limit)
    }
    return items
  }

  getItemTransformClass (itemIndex) {
    const { state } = this
    const { hoverIndex, limit, index } = state
    //
    // if nothing is hovering, there is nothing for us to do
    // return undefined so that React style props is set back to its default
    if (!isNumber(hoverIndex)) {
      return null
    }

    const isFirstInView = hoverIndex === index
    const isLastInView = hoverIndex === (index + (limit - 1))
    // we are currently in a hover state
    // if we are dealing with the currently hovered element
    if (itemIndex === hoverIndex) {
      return (isFirstInView && 'row-v2__item--hover-first')
        || (isLastInView && 'row-v2__item--hover-last')
        || 'row-v2__item--hover'
    }

    if (itemIndex < hoverIndex) {
      return (isFirstInView && 'row-v2__item--before-first')
        || (isLastInView && 'row-v2__item--before-last')
        || 'row-v2__item--before'
    }

    return (isFirstInView && 'row-v2__item--after-first')
      || (isLastInView && 'row-v2__item--after-last')
      || 'row-v2__item--after'
  }

  getItemClass (itemIndex) {
    const { state } = this
    const { index, limit } = state
    const cls = ['row-v2__item']
    if (limit !== null
      && (itemIndex < index || itemIndex >= index + limit)) {
      cls.push('row-v2__item--hidden')
    }
    return cls
  }

  isHidden (itemIndex) {
    const { state } = this
    const { index, limit } = state
    if (limit !== null
      && (itemIndex < index || itemIndex >= index + limit)) {
      return true
    }
    return false
  }

  bindShelfListener (item, index) {
    return (e, legacyContentType) => {
      const { props, openShelf } = this
      const { onOpenShelf } = props
      if (e && e.preventDefault) {
        e.preventDefault()
      }
      onOpenShelf((contentId, contentType) => {
        openShelf(contentId, contentType, index, legacyContentType)
      }, item, index)
    }
  }

  configure ({ refreshListeners }) {
    //
    const { props, state } = this
    const { items, static: isStatic, asGrid } = props

    if (items.size
      && this.$container
      && this.$firstItem) {
      if (asGrid) {
        this.configureGrid(refreshListeners)
        return
      }
      const { offsetWidth: viewport } = this.$container
      const { offsetWidth: itemWidth } = this.$firstItem
      const { index: indexFromState } = state
      const index = refreshListeners ? 0 : indexFromState

      const total = items.size
      const limit = Math.round(viewport / itemWidth)

      let nextIndex = index

      if (index + limit > total) {
        nextIndex = items.size - limit
      }

      if (nextIndex < 0) {
        nextIndex = 0
      }

      const nextState = {
        contentTransform: getTransform(nextIndex, total, limit),
        showControls: !isStatic && limit < total,
        index: refreshListeners ? index : nextIndex,
        limit,
      }

      if (refreshListeners) {
        nextState.shelfListeners = items.map((item, i) => (
          this.bindShelfListener(item, i)
        ))
      }
      this.setState(() => (nextState))
    }
  }

  configureGrid (refreshListeners) {
    const { props } = this
    const { items } = props
    if (refreshListeners) {
      this.setState(() => ({
        shelfListeners: items.map((item, i) => (
          this.bindShelfListener(item, i)
        )),
      }))
    }
  }

  renderCTA () {
    const { props } = this
    const { ctaLabel, ctaOnClick, ctaUrl } = props
    return ctaLabel
      ? (<Link
        to={ctaUrl || URL_JAVASCRIPT_VOID}
        role={ctaUrl ? 'link' : 'button'}
        className="row-v2__cta-label"
        onClick={ctaOnClick}
        scrollToTop
      >
        {ctaLabel}
      </Link>)
      : null
  }

  renderShelf () {
    const {
      useShelfV1,
      shelfIsOpen,
      showHideContentButton,
      upstreamContext,
      setTilesScrollableTileIndex,
      setTilesScrollableRowWidth,
    } = this.props

    if (shelfIsOpen) {
      const props = {
        location,
        onClickClose: this.closeShelf,
        showHideContentButton,
        setTilesScrollableTileIndex,
        setTilesScrollableRowWidth,
        upstreamContext,
      }
      return useShelfV1 ? <Shelf {...props} /> : <ShelfV2 {...props} />
    }
    return null
  }

  renderLeftControl () {
    const { state, props } = this
    const { showControls, index } = state
    const { staticText } = props

    if (showControls && index > 0) {
      return (
        <a
          className="row-v2__control row-v2__control--prev"
          href="javascript: void(0)" // eslint-disable-line
          onClick={this.moveBack}
          aria-label={staticText.getIn(['data', 'viewMore'])}
          title={staticText.getIn(['data', 'viewMore'])}
          role="button"
        ><Icon type={ICON_TYPES.CHEVRON_LEFT} />
        </a>
      )
    }
    return null
  }

  renderRightControl () {
    const { state, props } = this
    const { showControls, index, limit } = state
    const { items, staticText } = props

    if (showControls && (index + limit) <= (items.size - 1)) {
      return (
        <a
          className="row-v2__control row-v2__control--next"
          href="javascript: void(0)" // eslint-disable-line
          onClick={this.moveForward}
          aria-label={staticText.getIn(['data', 'viewMore'])}
          title={staticText.getIn(['data', 'viewMore'])}
          role="button"
        ><Icon type={ICON_TYPES.CHEVRON_RIGHT} />
        </a>
      )
    }
    return null
  }

  renderItem (item, itemIndex) {
    const { props, state } = this
    const { hoverIndex, shelfIndex, shelfListeners, uniqueId, index, limit } = state
    const { children, createAccessor, touchable, shelfIsOpen, asGrid, disableHover } = props
    const hideShelf = itemIndex === (index - 1) || itemIndex === (index + limit)
    const bindMouseEvents = !disableHover && !touchable && !shelfIsOpen && item
    const transformClass = this.getItemTransformClass(itemIndex)
    const itemShelfIsOpen = shelfIsOpen && itemIndex === shelfIndex
    const openShelf = shelfListeners.get(itemIndex)
    const itemClassNames = this.getItemClass(itemIndex)
    const focused = itemIndex === hoverIndex
    const key = `item-${uniqueId}-${itemIndex}`
    const params = {
      index: itemIndex,
      itemShelfIsOpen,
      shelfIsOpen,
      hideShelf,
      openShelf,
      focused,
    }

    if (!item) {
      itemClassNames.push('row-v2__item--empty')
    }

    if (itemShelfIsOpen) {
      itemClassNames.push('row-v2__item--shelf')
    }

    if (!asGrid && transformClass) {
      itemClassNames.push(transformClass)
    }

    const accessor = item
      ? createAccessor(RowAccessor, item, params)
      : null

    const accessorProps = {}
    // apply mouse events to the accessor if we are not on a touch device
    // and if the shelf is not open
    if (bindMouseEvents) {
      accessorProps.onFocus = this.onHoverEnter
      accessorProps.onBlur = this.onHoverLeave
    }
    // when the shelf is open, the accessor will be overridden
    // to open the shelf with new content ONLY (instead of default behavior)
    if (shelfIsOpen) {
      accessorProps.onClick = openShelf
      accessorProps.scrollToTop = false
      accessorProps.role = 'button'
    }

    return (
      <li
        onMouseLeave={bindMouseEvents ? this.onHoverLeave : null}
        onMouseEnter={bindMouseEvents ? this.onHoverEnter : null}
        ref={itemIndex === 0 ? this.setFirstItem : null}
        className={itemClassNames.join(' ')}
        key={key}
      >
        <div className="row-v2__item-inner">
          {accessor && React.cloneElement(accessor, accessorProps)}
          {children(item, params)}
        </div>
        {asGrid && itemShelfIsOpen ? this.renderShelf() : null}
      </li>
    )
  }

  renderRow () {
    const { props, state } = this
    const { uniqueId, index } = state
    const { children, onRenderContent } = props
    const items = this.getRenderableItems()

    if (!items.size) {
      return map(fill(Array(8), 1), (n, i) => (
        <li
          className="row-v2__item row-v2__item--empty"
          key={`item-${uniqueId}-${i}`}
        >
          <div className="row-v2__item-inner">
            {children(null, { index })}
          </div>
        </li>
      ))
    }

    if (typeof onRenderContent === 'function') {
      // TODO: this should be a filter() much faster than reduce()
      // Also, firing an event on render() is a bad idea. This means there is potential to
      // dispatch a redux action which could cause recusive rendering!
      const visibleIndexes = items.reduce((acc, _curr, itemIndex) => {
        if (!this.isHidden(itemIndex)) {
          acc.push(itemIndex)
        }
        return acc
      }, [])
      onRenderContent(visibleIndexes)
    }

    return items.map((item, itemIndex) => {
      return this.renderItem(item, itemIndex)
    })
  }

  renderGrid () {
    const { props } = this
    const { items } = props

    if (!items.size) {
      return null
    }

    return items.map((item, itemIndex) => {
      return this.renderItem(item, itemIndex)
    })
  }

  render () {
    const { state, props } = this
    const { contentTransform } = state
    const { asGrid } = props

    return (
      <React.Fragment>
        {asGrid ? (
          <section className={getRootClass(props, state)}>
            {getDescription(props)}
            {getLabel(props)}
            <div ref={this.setContainer} className="row-v2__grid-wrapper">
              <ul className="row-v2__list">
                {this.renderGrid()}
              </ul>
            </div>
          </section>
        ) : (
          <section className={getRootClass(props, state)}>
            {getDescription(props)}
            {getLabel(props)}
            <div ref={this.setContainer} className="row-v2__wrapper">
              {this.renderLeftControl()}
              <div style={contentTransform} className="row-v2__content">
                <ul className="row-v2__list">
                  {this.renderRow()}
                </ul>
              </div>
              {this.renderRightControl()}
            </div>
            {this.renderShelf()}
          </section>
        )}
      </React.Fragment>
    )
  }
}

RowV2.propTypes = {
  // clearOpenShelfIndex is being depricated, use onCloseShelf
  clearOpenShelfIndex: PropTypes.func,
  // setModifier is not needed, use onOpenShelf
  setModifier: PropTypes.func,
  items: ImmutablePropTypes.list.isRequired,
  createAccessor: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
  onRenderContent: PropTypes.func,
  description: PropTypes.string,
  disableHover: PropTypes.bool,
  onCloseShelf: PropTypes.func,
  className: PropTypes.string,
  onOpenShelf: PropTypes.func,
  useShelfV1: PropTypes.bool,
  ctaLabel: PropTypes.string,
  ctaOnClick: PropTypes.func,
  ctaUrl: PropTypes.string,
  onHover: PropTypes.func,
  label: PropTypes.string,
  static: PropTypes.bool,
  asGrid: PropTypes.bool,
  style: PropTypes.oneOf([
    STYLES.S12345,
    STYLES.S12334,
    STYLES.S12456,
    STYLES.S12234,
    STYLES.S123,
    STYLES.S034,
    STYLES.S23456,
    STYLES.s12456,
    STYLES.TOPICS_LARGE,
    STYLES.TOPICS_SMALL,
    STYLES.TOPICS_TABLET,
  ]),
}

RowV2.defaultProps = {
  ctaUrl: URL_JAVASCRIPT_VOID,
  clearOpenShelfIndex: noop,
  onCloseShelf: noop,
  onOpenShelf: noop,
  onHover: noop,
  description: undefined,
  className: undefined,
  style: STYLES.S12345,
  disableHover: false,
  useShelfV1: false,
  label: undefined,
  ctaOnClick: noop,
  asGrid: false,
  static: false,
  ctaLabel: '',
}

export default compose(
  UniqueId('row'),
  connectRedux(
    (state, { uniqueId }) => ({
      staticText: state.staticText.getIn(['data', 'row'], Map()),
      shelfIsOpen: state.shelf.get('visibleId', -1) === uniqueId,
      touchable: state.app.getIn(['viewport', 'touchable']),
      viewportWidth: state.app.getIn(['viewport', 'width']),
      auth: state.auth,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setShelfVisibleId: actions.shelf.setShelfVisibleId,
        getShelfData: actions.shelf.getShelfData,
      }
    },
  ),
)(RowV2)
