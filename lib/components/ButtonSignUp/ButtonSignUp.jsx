import React from 'react'
import Button from 'components/Button'
import { URL_PLAN_SELECTION } from 'services/url/constants'
import PropTypes from 'prop-types'
import Link from 'components/Link'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'

export const BUTTON_SIGN_UP_TYPE_LINK = 'link'
export const BUTTON_SIGN_UP_TYPE_BUTTON = 'button'

function ButtonSignUp (props) {
  const {
    text,
    buttonClass,
    type,
    className,
    onClick,
    scrollToTop,
  } = props
  if (type === BUTTON_SIGN_UP_TYPE_LINK) {
    return (
      <span className="button-sign-up__link-container">
        <Link
          to={URL_PLAN_SELECTION}
          className={className}
          onClick={onClick}
          scrollToTop={scrollToTop}
        >{text}</Link>
      </span>
    )
  }
  if (type === BUTTON_SIGN_UP_TYPE_BUTTON) {
    return (
      <span className="button-sign-up__button-container">
        <Button
          buttonClass={buttonClass}
          text={text}
          url={URL_PLAN_SELECTION}
          onClick={onClick}
          scrollToTop={scrollToTop}
        />
      </span>
    )
  }
}

ButtonSignUp.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  buttonClass: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  className: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  scrollToTop: PropTypes.bool,
}

export default compose(
  connectRedux(
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      }
    },
  ),
)(ButtonSignUp)
