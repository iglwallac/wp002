import { connect } from 'react-redux'
import { Button, TYPES } from 'components/Button.v2'
import { getEmailCustomerServiceUrl } from 'services/url'
import { H1 } from 'components/Heading'
import { HEADING_TYPES } from 'components/Heading/_Heading'
import { TARGET_BLANK } from 'components/Link/constants'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Link from 'components/Link'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'

const ModalPauseError = ({
  userLanguage,
  staticText,
  isProcessing,
  pauseAccount,
}) => {
  //
  const onTryAgain = useCallback(() => {
    pauseAccount()
  }, [])

  return (
    <div className="modal-pause-error">
      <H1 as={[HEADING_TYPES.H3_MOBILE, HEADING_TYPES.H2_DESKTOP]}>{staticText.get('titlePauseError', '')}</H1>
      <div className="modal-pause-error__description">
        {staticText.get('descriptionPauseError1', '')}
        <Link
          className="modal-pause-error__link"
          to={getEmailCustomerServiceUrl(userLanguage)}
          directLink
          target={TARGET_BLANK}
        >
          {staticText.get('descriptionPauseError2', '')}
        </Link>
        {staticText.get('descriptionPauseError3', '')}
      </div>
      <div className="modal-pause-error__buttons">
        <Button
          className="modal-pause-error__button"
          onClick={onTryAgain}
          disabled={isProcessing}
          type={TYPES.PRIMARY}
        >
          {isProcessing ? staticText.get('buttonPauseProcessing', '') : staticText.get('buttonPauseErrorRetry', '')}
        </Button>
      </div>
    </div>
  )
}

ModalPauseError.propTypes = {
  isProcessing: PropTypes.bool.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  pauseAccount: PropTypes.func.isRequired,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'modalPauseError', 'data']),
  isProcessing: state.userAccount.getIn(['manageSubscription', 'data', 'accountPauseProcessing'], false),
}))(ModalPauseError)
