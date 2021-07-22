import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import velocity from 'velocity-react/lib/velocity-animate-shim'

class ScrollTo extends Component {
  componentWillUnmount () {
    this.unsetListeners()
  }

  onRef = (component) => {
    if (!process.env.BROWSER || this._animating) {
      return
    }
    this.startAnimation(component)
  }

  onAnimationBegin = () => {
    this.setAnimating(true)
    this.setListeners()
  }

  onAnimationComplete = () => {
    if (!this._animating || !this._animationComponent) {
      return
    }

    this.unsetListeners()

    if (this.props.finish) {
      this.props.finish()
    }

    this.setAnimating(false)
  }

  setListeners = () => {
    window.addEventListener('click', this.finishAnimation)
    window.addEventListener('wheel', this.finishAnimation)
  }


  setAnimationComponent = (component) => {
    this._animationComponent = component
  }

  setAnimating = (animating) => {
    this._animating = animating
  }

  startAnimation = (component) => {
    // eslint-disable-next-line react/no-find-dom-node
    const domNode = findDOMNode(component)
    const { duration, offset, delay, easing } = this.props

    if (domNode) {
      this.setAnimationComponent(component)

      velocity(domNode, 'scroll', {
        begin: this.onAnimationBegin,
        complete: this.onAnimationComplete,
        duration,
        offset,
        delay,
        easing,
      })
    }
  }

  finishAnimation = () => {
    // Only stop the animation if we have a component and an animation is in progress.
    // eslint-disable-next-line react/no-find-dom-node
    const domNode = findDOMNode(this._animationComponent)

    if (this._animating && domNode) {
      velocity(domNode, 'finish')
    }
  }

  unsetListeners = () => {
    window.removeEventListener('click', this.finishAnimation)
    window.removeEventListener('wheel', this.finishAnimation)
  }

  render () {
    return <div ref={this.onRef} className="scroll-to" aria-hidden="true" />
  }
}

ScrollTo.propTypes = {
  disabled: PropTypes.bool,
  runOnMount: PropTypes.bool,
  duration: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  delay: PropTypes.number,
  easing: PropTypes.string,
  finish: PropTypes.func,
}

export default ScrollTo
