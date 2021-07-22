/* eslint-disable react/no-danger */
import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { TOASTY_DISPLAY_DURATION, TOASTY_ANIMATION_DURATION } from 'services/toasty'
import { Button, TYPES } from 'components/Button.v2'
import { ICON_TYPES } from 'components/Icon.v2'

export default class Toast extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      remove: false,
    }
  }

  componentDidMount () {
    this.clearTimers()
    this.durationTimer = setTimeout(() => {
      this.clearTimers()
      this.remove()
    }, TOASTY_DISPLAY_DURATION)
  }

  componentDidUpdate () {
    const { props } = this
    const { forceRemove } = props
    if (forceRemove) {
      this.clearTimers()
      this.remove()
    }
  }

  componentWillUnmount () {
    this.clearTimers()
  }

  onClick = (e) => {
    e.preventDefault()
    const { props } = this
    const { message, remove } = props
    remove(message)
  }

  getClass () {
    const { state } = this
    const { remove } = state
    const cls = ['toasty__message']
    if (remove) {
      cls.push('toasty__message--leaving')
    }
    return cls.join(' ')
  }

  clearTimers () {
    clearTimeout(this.animationTimer)
    clearTimeout(this.durationTimer)
    this.animationTimer = null
    this.durationTimer = null
  }

  remove () {
    const { props } = this
    const { message, remove } = props
    this.setState(() => ({ remove: true }))
    this.animationTimer = setTimeout(() => {
      this.clearTimers()
      remove(message)
    }, TOASTY_ANIMATION_DURATION)
  }

  render () {
    const { props } = this
    const { message } = props
    const content = message.get('message')
    return (
      <div
        className={this.getClass()}
        role="alert"
      >
        <Button
          className="toasty__close"
          icon={ICON_TYPES.CLOSE}
          onClick={this.onClick}
          type={TYPES.ICON}
        />
        <p className="toasty__content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    )
  }
}

Toast.propTypes = {
  message: ImmutablePropTypes.map.isRequired,
  remove: PropTypes.func.isRequired,
}
