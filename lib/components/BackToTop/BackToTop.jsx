import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _isArray from 'lodash/isArray'
import _partial from 'lodash/partial'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import Icon from 'components/Icon'

export const BACK_TO_TOP_SCROLL_DURATION = 750

function getBackToTopClassName (classes, displayed) {
  const css = ['back-to-top'].concat(_isArray(classes) ? classes : [])
  if (displayed) {
    css.push('back-to-top--active')
  }
  return css.join(' ')
}

function backToTopOnClick (props) {
  const { backToTop, setBackToTopScroll } = props
  if (backToTop.get('scrolling', false)) {
    return
  }
  setBackToTopScroll()
}

class BackToTop extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      displayed: false,
    }
  }

  componentDidMount () {
    this.setScrollListener()
  }

  componentWillUnmount () {
    this.destroyScrollListener()
  }

  setScrollListener = () => {
    this._displayAfterScroll = this.displayAfterScroll
    document.addEventListener('scroll', this._displayAfterScroll)
  }

  displayAfterScroll = () => {
    const height = document.body.offsetHeight - 200
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop

    this.setState(({ displayed: stateDisplayed }) => {
      const displayed = scrollPosition >= height
      if (stateDisplayed !== displayed) {
        return { displayed }
      }
      return {}
    })
  }

  destroyScrollListener = () => {
    if (this._displayAfterScroll) {
      document.removeEventListener('scroll', this._displayAfterScroll)
    }
  }

  render () {
    const { props, state } = this
    const { className } = props
    const { displayed } = state
    return (
      <Link
        className={getBackToTopClassName(className, displayed)}
        to={URL_JAVASCRIPT_VOID}
        onClick={_partial(backToTopOnClick, props)}
      >
        <Icon iconClass={['icon--up', 'icon--white', 'back-to-top__icon']} />
      </Link>
    )
  }
}

BackToTop.propTypes = {
  backToTop: ImmutablePropTypes.map.isRequired,
  setBackToTopScroll: PropTypes.func.isRequired,
}

const connectedBackToTop = connectRedux(
  state => ({
    backToTop: state.backToTop,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setBackToTopScroll: actions.backToTop.setBackToTopScroll,
    }
  },
)(BackToTop)

export default connectedBackToTop
