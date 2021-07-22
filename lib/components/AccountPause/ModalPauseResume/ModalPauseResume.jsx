import { connect } from 'react-redux'
import { getEmailCustomerServiceUrl } from 'services/url'
import { List } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'

import { Button, TYPES } from 'components/Button.v2'
import { H1 } from 'components/Heading'
import { HEADING_TYPES } from 'components/Heading/_Heading'
import { TARGET_BLANK } from 'components/Link/constants'
import { CHECKOUT_ORDER_ERROR_TYPE_PAYMENT } from 'services/checkout'
import Link from 'components/Link'
import {
  USER_ACCOUNT_PAUSED,
  USER_ACCOUNT_ACTIVE,
} from 'services/user-account'

function getResumeDescription (status, staticText, resumeDate, price) {
  if (status === USER_ACCOUNT_ACTIVE) {
    return (
      <div className="modal-pause-resume__description">
        {staticText.get('descriptionScheduledPauseResume', '')}
        <span className="modal-pause-resume__date">
          {resumeDate}
        </span>
        {staticText.get('descriptionPauseResumeAt', '')}
        {price}
        <span className="modal-pause-resume__sub">
          {staticText.get('descriptionPauseResumeMo', '')}
        </span>
      </div>
    )
  } else if (status === USER_ACCOUNT_PAUSED) {
    return (
      <div className="modal-pause-resume__description">
        {staticText.get('descriptionPauseResume', '')}
        <span className="modal-pause-resume__date">
          {resumeDate}
        </span>
        {staticText.get('descriptionPauseResumeAt', '')}
        {price}
        <span className="modal-pause-resume__sub">
          {staticText.get('descriptionPauseResumeMo', '')}
        </span>
      </div>
    )
  }
  return null
}

const ModalPauseResume = ({
  price,
  status,
  resumeDate,
  staticText,
  userAccount,
  userLanguage,
  isProcessing,
  resumeAccount,
}) => {
  const hasError =
    !userAccount.getIn(['manageSubscription', 'data', 'errors'], List()).isEmpty()
    && !userAccount.getIn(['manageSubscription', 'data', 'success'])
  const paymentError = userAccount.getIn(['manageSubscription', 'data', 'errorCode'], '') === CHECKOUT_ORDER_ERROR_TYPE_PAYMENT

  const onTryAgain = useCallback(() => {
    resumeAccount()
  }, [])

  if (paymentError) {
    return (
      <div className="modal-pause-resume-payment-error">
        <H1 as={[HEADING_TYPES.H3_MOBILE, HEADING_TYPES.H2_DESKTOP]}>{staticText.get('titlePauseResumeUpdatePayment', '')}</H1>
        <div className="modal-pause-resume-error__description">
          <span className="modal-pause-resume-error__important">
            {staticText.get('descriptionPauseResumeUpdatePayment1', '')}
          </span>
          {staticText.get('descriptionPauseResumeUpdatePayment2', '')}
          <Link
            className="modal-pause-resume-error__link"
            to={getEmailCustomerServiceUrl(userLanguage)}
            directLink
            target={TARGET_BLANK}
          >
            {staticText.get('descriptionPauseResumeUpdatePayment3', '')}
          </Link>
          {staticText.get('descriptionPauseResumeUpdatePayment4', '')}
        </div>
        <div className="modal-pause-resume-error__buttons">
          <Button
            className="modal-pause-resume-error__button"
            onClick={onTryAgain}
            disabled={isProcessing}
            type={TYPES.PRIMARY}
          >
            {isProcessing
              ? staticText.get('buttonPauseProcessing', '')
              : staticText.get('buttonPauseResumeUpdatePayment', '')
            }
          </Button>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="modal-pause-resume-error">
        <H1 as={[HEADING_TYPES.H3_MOBILE, HEADING_TYPES.H2_DESKTOP]}>{staticText.get('titlePauseResumeError', '')}</H1>
        <div className="modal-pause-resume-error__description">
          {staticText.get('descriptionPauseResumeError1', '')}
          <Link
            className="modal-pause-resume-error__link"
            to={getEmailCustomerServiceUrl(userLanguage)}
            directLink
            target={TARGET_BLANK}
          >
            {staticText.get('descriptionPauseResumeError2', '')}
          </Link>
          {staticText.get('descriptionPauseResumeError3', '')}
        </div>
        <div className="modal-pause-resume-error__buttons">
          <Button
            className="modal-pause-resume-error__button"
            onClick={onTryAgain}
            disabled={isProcessing}
            type={TYPES.PRIMARY}
          >
            {isProcessing
              ? staticText.get('buttonPauseProcessing', '')
              : staticText.get('buttonPauseResumeErrorRetry', '')
            }
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-pause-resume">
      <H1 as={[HEADING_TYPES.H3_MOBILE, HEADING_TYPES.H2_DESKTOP]}>{staticText.get('titlePauseResume', '')}</H1>
      {getResumeDescription(status, staticText, resumeDate, price)}
      <div className="modal-pause-resume__buttons">
        <Button
          className="modal-pause-resume__button"
          onClick={onTryAgain}
          disabled={isProcessing}
          type={TYPES.PRIMARY}
        >
          {isProcessing ? staticText.get('buttonPauseProcessing', '') : staticText.get('buttonPauseResume', '')}
        </Button>
      </div>
    </div>
  )
}

ModalPauseResume.propTypes = {
  status: PropTypes.string.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  resumeAccount: PropTypes.func.isRequired,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'modalPauseResume', 'data']),
  isProcessing: state.userAccount.getIn(['manageSubscription', 'data', 'accountResumeProcessing'], false)
  || state.userAccount.getIn(['manageSubscription', 'data', 'success'], false),
}))(ModalPauseResume)
