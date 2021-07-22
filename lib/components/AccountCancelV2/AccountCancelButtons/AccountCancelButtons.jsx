import React from 'react'
import PropTypes from 'prop-types'
import { Button, TYPES } from 'components/Button.v2'
import { requestAnimationFrame } from 'services/animate'

function AccountCancelButtons (props) {
  const {
    nextText,
    previousText,
    nextUrl,
    previousUrl,
    nextDisabled,
    nextOnClick,
    submit,
  } = props

  const onClickGoBack = () => {
    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }

  return (
    <div className="account-cancel-buttons">
      <Button
        url={previousUrl}
        type={TYPES.SECONDARY}
        className="account-cancel-buttons__previous"
        onClick={onClickGoBack}
      >
        {previousText}
      </Button>
      {
        submit ?
          <Button
            disabled={nextDisabled}
            type={TYPES.PRIMARY}
            className="account-cancel-buttons__next"
            onClick={nextOnClick}
            submit={submit}
          >
            {nextText}
          </Button>
          :
          <Button
            url={nextUrl}
            disabled={nextDisabled}
            type={TYPES.PRIMARY}
            className="account-cancel-buttons__next"
            onClick={nextOnClick}
          >
            {nextText}
          </Button>
      }
    </div>
  )
}

AccountCancelButtons.propTypes = {
  previousUrl: PropTypes.string.isRequired,
  nextUrl: PropTypes.string.isRequired,
  previousText: PropTypes.string.isRequired,
  nextText: PropTypes.string.isRequired,
  nextDisabled: PropTypes.bool.isRequired,
  nextOnClick: PropTypes.func,
  submit: PropTypes.bool,
}

export default AccountCancelButtons
