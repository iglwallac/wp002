import React from 'react'
import map from 'lodash/map'
import fill from 'lodash/fill'
import find from 'lodash/find'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { ROW_SCROLL_ARROW_CLICKED } from 'services/event-tracking'

const BREAKPOINTS = [
  {
    size: 420,
    holds: 1,
  },
  {
    size: 694,
    holds: 2,
  },
  {
    size: 819,
    holds: 3,
  },
  {
    size: 1069,
    holds: 4,
  },
  {
    size: 1444,
    holds: 5,
  },
]

export const VIEWPORT_WINDOW = 'VIEWPORT_WINDOW'
export const VIEWPORT_ELEMENT = 'VIEWPORT_ELEMENT'
export const ROW_TYPE_CUSTOM = 'ROW_TYPE_CUSTOM'
export const ROW_TYPE_TILE = 'ROW_TYPE_TILE'

function getClassName (type) {
  switch (type) {
    case ROW_TYPE_TILE:
      return 'row row--tile'
    case ROW_TYPE_CUSTOM:
    default:
      return 'row'
  }
}

export class Row extends React.Component {
  //
  constructor (props) {
    super(props)
    this.listenerBound = false
    this.state = {
      breakpoint: null,
      position: 0,
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
        const holds = this.visibleCapacity()
        if (back && position > 0) {
          let p = position - holds
          if (p < 0) p = 0
          this.setState(() => ({
            position: p,
          }))
        } else if (!back) {
          let p = position + holds
          if (p > ((items.size) - holds)) {
            p = items.size - holds
          }
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

  getBreakpoint () {
    const { state } = this
    const { breakpoint } = state
    const width = this.getViewportWidth()
    const newBreakpoint = find(BREAKPOINTS, bp => (
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

    if (items && items.size) {
      while ((nextPosition + holds) > (items.size)) {
        nextPosition -= 1
      }
    }
    this.setState(() => ({
      breakpoint: nextBreakpoint,
      position: nextPosition,
    }))
  }

  setContainer = (el) => {
    this.container = el
  }

  visibleCapacity () {
    const { props, state } = this
    const { maxItemsInView } = props
    const { breakpoint } = state
    if (breakpoint) {
      const { holds } = breakpoint
      return maxItemsInView > 0 && maxItemsInView <= holds
        ? maxItemsInView
        : holds
    }
    return null
  }

  arrowsShouldBeHidden () {
    const { props } = this
    const { hideArrows, items } = props
    const holds = this.visibleCapacity()
    return hideArrows && holds >= items.size
  }

  renderLeftArrow () {
    const { onToggleRow, props, state } = this
    const { breakpoint, position } = state
    const { title = '', items } = props
    const hidden = this.arrowsShouldBeHidden()
    if (breakpoint && items && items.size) {
      return (
        <button
          disabled={position === 0}
          onClick={onToggleRow(true)}
          aria-label={`View previous ${title}`}
          className={`icon icon--left row__control row__controls--back${hidden ? ' row-arrow-hidden' : ''}`}
        />
      )
    }
    return null
  }

  renderRightArrow () {
    const { onToggleRow, props, state } = this
    const { breakpoint, position } = state
    const { title = '', items } = props
    if (breakpoint && items && items.size) {
      const holds = this.visibleCapacity()
      const hidden = this.arrowsShouldBeHidden()
      return (
        <button
          disabled={position + holds > (items.size - 1)}
          onClick={onToggleRow(false)}
          aria-label={`View more ${title}`}
          className={`icon icon--right row__control row__control--forward${hidden ? ' row-arrow-hidden' : ''}`}
        />
      )
    }
    return null
  }

  renderContent () {
    const { props, state } = this
    const { items, children } = props
    const { breakpoint, position } = state
    if (breakpoint) {
      const holds = this.visibleCapacity()
      const max = position + holds
      const className = `holds-${holds}`
      return (
        <ul className={`row__content ${className}`}>
          {
            items && items.size ? (
              items.map((item, index) => {
                if (index >= position && index < max) {
                  const key = `item-${index}`
                  return (
                    <li
                      key={key}
                      className="row__item row__item-content"
                    >
                      {children(item, props, index)}
                    </li>
                  )
                }
                return null
              }).toJS()
            ) : (
              map(fill(Array(holds), 1), (item, index) => {
                const key = `placeholder-${index}`
                return (
                  <li key={key} className="row__item">
                    {children(null, props, index)}
                  </li>
                )
              })
            )
          }
        </ul>
      )
    }
    return null
  }

  render () {
    const { props, setContainer } = this
    const { title, type } = props
    return (
      <section className={getClassName(type)}>
        <div className="row__container">
          {title ? (
            <div className="row__title">
              {title}
            </div>
          ) : null}
        </div>
        <div ref={setContainer} className="row__content-container">
          <div className="row__content-wrapper">
            {this.renderContent()}
          </div>
          <div className="row__controls">
            {this.renderLeftArrow()}
            {this.renderRightArrow()}
          </div>
        </div>
      </section>
    )
  }
}

Row.propTypes = {
  items: ImmutablePropTypes.list.isRequired,
  children: PropTypes.func.isRequired,
  maxItemsInView: PropTypes.number,
  hideArrows: PropTypes.bool,
}
