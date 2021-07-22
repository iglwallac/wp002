import React from 'react'
import PropTypes from 'prop-types'
import toLower from 'lodash/toLower'
import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'
import { connect as connectRedux } from 'react-redux'
import { Map } from 'immutable'
import Link from 'components/Link'
import Icon, { ICON_TYPES } from 'components/Icon.v2'

export const CONTROLS = {
  ICON_EDIT: 'ICON_EDIT',
  ICON_DONE: 'ICON_DONE',
  UPDATE: 'UPDATE',
  CHANGE: 'CHANGE',
  CANCEL: 'CANCEL',
  EDIT: 'EDIT',
  DONE: 'DONE',
}

export const STATES = {
  EDITING: 'EDITING',
  DISPLAY: 'DISPLAY',
}

class Card extends React.Component {
  //
  constructor (props) {
    super(props)
    const { state = STATES.DISPLAY } = props
    this.state = { editState: state }
  }

  getClass () {
    const { props, state } = this
    const { editable, transparent, className } = props
    const { editState, animateOut, animateIn } = state

    const classList = ['card']

    if (className) classList.push(className)
    if (editable) classList.push(`card--${toLower(editState)}`)
    if (!editable) classList.push('card__not-editable')
    if (transparent) classList.push('card--transparent')
    if (animateOut) classList.push('card--animateout')
    if (animateIn) classList.push('card--animatein')
    return classList.join(' ')
  }

  getUnderlayLabel () {
    const { props } = this
    const { staticText } = props
    const label = this.getEditLabel()
    if (isString(label)) {
      return label
    }
    return staticText.getIn(['data', 'edit'])
  }

  getEditLabel () {
    const { props } = this
    const { editControl, staticText } = props

    if (isString(editControl)) {
      switch (editControl) {
        case CONTROLS.UPDATE:
          return staticText.getIn(['data', 'update'])
        case CONTROLS.CHANGE:
          return staticText.getIn(['data', 'change'])
        case CONTROLS.EDIT:
          return staticText.getIn(['data', 'edit'])
        case CONTROLS.ICON_EDIT:
          return (
            <span className="card__edit-icon">
              <Icon type={ICON_TYPES.PENCIL} />
            </span>
          )
        default:
          return editControl
      }
    }
    return editControl
  }

  getDisplayLabel () {
    const { props } = this
    const { displayControl, staticText } = props

    if (isString(displayControl)) {
      switch (displayControl) {
        case CONTROLS.DONE:
          return staticText.getIn(['data', 'done'])
        case CONTROLS.CANCEL:
          return staticText.getIn(['data', 'cancel'])
        case CONTROLS.ICON_DONE:
          return (
            <span className="card__edit-icon">
              <Icon type={ICON_TYPES.CHECK} />
            </span>
          )
        default:
          return displayControl
      }
    }
    return displayControl
  }

  toggle = () => {
    const { state } = this
    const { editState } = state

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    this.setState(() => ({
      animateOut: true,
    }))

    this.timer = setTimeout(() => {
      clearTimeout(this.timer)
      this.setState(() => ({
        animateIn: true,
        animateOut: false,
        editState: editState === STATES.EDITING
          ? STATES.DISPLAY
          : STATES.EDITING,
      }))
      this.timer = setTimeout(() => {
        clearTimeout(this.timer)
        this.timer = null
        this.setState(() => ({
          animateIn: false,
        }))
      }, 300)
    }, 300)
  }

  renderUnderlay () {
    const { state, props } = this
    const { transparent, editable } = props
    const { editState } = state

    if (editable
      && transparent
      && editState === STATES.DISPLAY) {
      return (
        <Link
          to=""
          role="button"
          onClick={this.toggle}
          className="card__underlay"
        >
          {this.getUnderlayLabel()}
        </Link>
      )
    }
    return null
  }

  render () {
    const { state, props } = this
    const { editState } = state
    const { children, editable } = props

    if (editable && children) {
      if (isFunction(children)) {
        const isEditing = editState === STATES.EDITING
        const iconClass = isEditing ? 'card__icon--editing' : 'card__icon--display'
        return (
          <section className={this.getClass()}>
            {this.renderUnderlay()}
            <div className="card__body">
              <div className="card__header">
                <Link onClick={this.toggle} className="card__control" to="">
                  {isEditing ? this.getDisplayLabel() : this.getEditLabel()}
                  <span role="presentation" className={`card__icon ${iconClass}`} />
                </Link>
              </div>
              <div className="card__contents">
                {children(editState, this.toggle)}
              </div>
            </div>
          </section>
        )
      }
      throw new Error('Cards with prop "editable" require children of type "function."')
    }
    return (
      <div className={this.getClass()}>
        <div className="card__body">
          {
            isFunction(children)
              ? children(STATES.DISPLAY)
              : children
          }
        </div>
      </div>
    )
  }
}

Card.defaultProps = {
  displayControl: CONTROLS.CANCEL,
  editControl: CONTROLS.EDIT,
  state: STATES.DISPLAY,
  transparent: false,
  editable: false,
}

Card.propTypes = {
  displayControl: PropTypes.node,
  transparent: PropTypes.bool,
  className: PropTypes.string,
  editControl: PropTypes.node,
  editable: PropTypes.bool,
  state: PropTypes.oneOf([
    STATES.EDITING,
    STATES.DISPLAY,
  ]),
}

const ConnectedCard = connectRedux(state => ({
  staticText: state.staticText.getIn(['data', 'card'], Map()),
}))(Card)

export { ConnectedCard as Card }
