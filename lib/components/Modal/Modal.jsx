import React from 'react'
import PropTypes from 'prop-types'
import toLower from 'lodash/toLower'
import replace from 'lodash/replace'
import { H2, HEADING_TYPES } from 'components/Heading'

const FOCUS_SELECTOR = [
  'a',
  'area',
  'input',
  'iframe',
  'select',
  'button',
  'details',
  'textarea',
  '[contentEditable=""]',
  '[contentEditable="true"]',
  '[contentEditable="TRUE"]',
  '[tabindex]:not([tabindex^="-"])',
].join(', ')

function applyBodyClass (visible) {
  const { document = {} } = global
  const { body } = document
  if (body && body.classList) {
    if (visible) body.classList.add('body__modal--open')
    else body.classList.remove('body__modal--open')
  }
}

function getClassName (className) {
  const cls = ['modal']
  if (className) cls.push(className)
  return cls.join(' ')
}

class Modal extends React.Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      error: false,
      inner: {},
      body: {},
    }
  }

  componentDidMount () {
    const { props, state, focusInitial } = this
    const { visible } = props
    const { error } = state

    focusInitial()
    applyBodyClass(!error && visible)
    setTimeout(() => this.setDynamicStyles())
    window.addEventListener('resize', this.onResize)
    // if the content inside change its size apply the inline styles
    // i.e. showing an error message that increases the height.
    this.observer = new ResizeObserver((() => {
      this.setDynamicStyles()
    }))
    this.observer.observe(this.$inner)
  }

  componentDidUpdate (prevProps) {
    if (process.env.BROWSER) {
      const { children: prevChildren } = prevProps
      const { props, state } = this
      const { visible, children } = props
      const { error } = state
      applyBodyClass(!error && visible)

      if (prevChildren !== children) {
        this.setDynamicStyles()
      }
    }
  }

  // eslint doesn't recognize componentDidCatch yet
  // eslint-disable-next-line
  componentDidCatch (error) {
    if (!process.env.BROWSER) {
      throw error
    }
    applyBodyClass(false)
    this.setState(() => ({
      error: true,
    }))
  }

  componentWillUnmount () {
    const { props } = this
    const { onReturnFocus } = props
    applyBodyClass(false)
    onReturnFocus()
    window.removeEventListener('resize', this.onResize)
    this.observer.disconnect()
  }

  onResize = () => {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = null
    }
    if (this.$overlay) {
      this.resizeTimer = setTimeout(() => {
        this.setDynamicStyles()
      }, 400)
    }
  }

  setDynamicStyles () {
    //
    const styles = {
      inner: {},
      body: {},
    }

    if (this.$overlay && this.$overlay.clientWidth >= 480) {
      const margins = this.$body.offsetTop * 2 // for top and bottom margins
      const totalHeight = this.$overlay.clientHeight
      const marginsHelper = (window.location.pathname !== '/') ? margins : ((margins / 2) + 40)
      const innerHeight = this.$inner.clientHeight + marginsHelper

      if (innerHeight < totalHeight) {
        styles.inner = {
          height: `${innerHeight}px`,
          top: `${(totalHeight - innerHeight) / 2}px`,
        }
        styles.body = {
          overflow: 'visible',
        }
      }
    }
    this.setState(() => styles)
  }

  setCancelRef = (el) => {
    this.$cancel = el
  }

  setOverlayRef = (el) => {
    this.$overlay = el
  }

  setModalBodyRef = (el) => {
    this.$body = el
  }

  setModalBodyInnerRef = (el) => {
    this.$inner = el
  }

  focusInitial = () => {
    const { $modal } = this
    if ($modal) {
      const $first = $modal.querySelector(FOCUS_SELECTOR)
      if ($first) $first.focus()
    }
  }

  depropigate = (e) => {
    e.stopPropagation()
  }

  update = () => {
    this.setDynamicStyles()
  }

  renderChildren () {
    const { props } = this
    const { children } = props
    return React.Children.map(children, child => (
      React.cloneElement(child, { update: this.update })
    ))
  }

  render () {
    const { props, state, depropigate } = this
    const { title, visible, className, onDismiss, hideDismiss, hideOverflow } = props
    const titleId = title ? toLower(replace(title, /[^a-z]/gi, '')) : ''
    const { error, inner, body } = state
    if (error || !visible) return null
    return (
      // eslint-disable-next-line
      <section
        role="dialog"
        aria-modal="true"
        onClick={hideDismiss ? null : onDismiss}
        className={getClassName(className)}
        ref={this.setOverlayRef}
        aria-labelledby={`modal-${titleId}`}
      >
        <div className="modal__inner" onClick={depropigate} style={inner}>
          <header className="modal__header">
            {title ? (
              <H2 as={HEADING_TYPES.H5} id={`modal-${titleId}`}>{title}</H2>
            ) : null}
          </header>
          { hideOverflow ?
            null :
            (<div role="presentation" className="modal__overflow-top" />)
          }
          <div className="modal__body" ref={this.setModalBodyRef} style={body}>
            <div className="modal__body-inner" ref={this.setModalBodyInnerRef}>
              {this.renderChildren()}
            </div>
          </div>
          { hideOverflow ?
            null :
            (<div role="presentation" className="modal__overflow-bottom" />)
          }
          {hideDismiss ? null : (
            <button
              onClick={onDismiss}
              ref={this.setCancelRef}
              onBlur={this.focusInitial}
              className="modal__close"
            >
              <span>Dismiss</span>
            </button>
          ) }

        </div>
      </section>
    )
  }
}

Modal.propTypes = {
  onReturnFocus: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  hideDismiss: PropTypes.bool,
  hideOverflow: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
}

export default Modal
