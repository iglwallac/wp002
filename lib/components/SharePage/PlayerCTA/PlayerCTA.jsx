import PropTypes from 'prop-types'
import FormsyForm from 'formsy-react'
import React, { useRef, useState, useCallback, useEffect } from 'react'
import { UNAVAILABLE_REASON } from 'services/share'
import { TYPE_SHARE_V2_SHARE } from 'services/dialog'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { URL_PLAN_SELECTION_PLANS } from 'services/url/constants'
import Icon, { ICON_TYPES, ICON_STYLES } from 'components/Icon.v2'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { Button, TYPES } from 'components/Button.v2'
import { EmailInput } from 'components/FormInput.v2'
import { H5, H3, HEADING_TYPES } from 'components/Heading'

const SHERPA_CLASS = ['share-view__sherpa-email-extend']
const dataLayer = global.dataLayer

function getExpiredClass (processing, success) {
  const className = ['share__player-cta-expired']
  if (processing) className.push('share__player-cta-expired--processing')
  if (success) className.push('share__player-cta-expired--success')
  return className.join(' ')
}

export default function SharePlayerCTA ({
  duplicateShareEmailCapture,
  emailProcessing,
  emailSuccess,
  isAnonymous,
  renderModal,
  staticText,
  share,
}) {
  //
  const {
    TIME_LIMIT_EXCEEDED,
    VIEW_LIMIT_EXCEEDED,
  } = UNAVAILABLE_REASON
  const token = share.get('token')
  const sources = share.get('sources', '')
  const duplicate = sources.includes('duplicate')
  const reason = share.get('unavailableReason')
  const showExpiredCTA = reason === TIME_LIMIT_EXCEEDED
    || reason === VIEW_LIMIT_EXCEEDED
  const expiredHeaderTextKey = (reason === TIME_LIMIT_EXCEEDED)
    || (reason === VIEW_LIMIT_EXCEEDED && duplicate)
    ? 'playerAnonCTAExpiredHeadline' : 'playerAnonCTAPopularHeadline'
  const expiredBodyTextkey = reason === TIME_LIMIT_EXCEEDED
    ? 'playerAnonCTAExpiredContent' : 'playerAnonCTAPopularContent'

  const $form = useRef(null)
  const $container = useRef(null)
  const [emailValid, setEmailValid] = useState(false)

  const onValid = useCallback(() => {
    setEmailValid(true)
  })

  const onClickCta = () => {
    if (dataLayer) {
      dataLayer.push({
        event: 'customEvent',
        eventCategory: 'user engagement',
        eventAction: 'call to action',
        eventLabel: 'explore-transform-belong',
      })
    }
  }

  const onInvalid = useCallback(() => {
    setEmailValid(false)
  })

  const onSendShareEmail = useCallback((model) => {
    const { email } = model
    if (email) {
      duplicateShareEmailCapture({ token, email })
    }
  }, [token])

  const onReturnFocus = useCallback(() => {
    if ($container.current) {
      const el = $container.current
      const target = el && el.querySelector
        && el.querySelector('.share__player-cta-share')
      if (target) {
        target.focus()
      }
    }
  }, [$container.current])

  const onShare = useCallback(() => {
    renderModal(TYPE_SHARE_V2_SHARE, {
      title: share.getIn(['content', 'title']),
      contentId: share.get('contentId'),
      onDismiss: onReturnFocus,
      type: 'VIDEO',
      onReturnFocus,
    })
  }, [share])

  // reset the formsy form only when
  // the email capture was successful
  useEffect(() => {
    if (emailSuccess && $form.current) {
      $form.current.reset()
    }
  }, [emailSuccess])

  return (
    <div ref={$container} className="share__player-cta">
      {isAnonymous && showExpiredCTA ? (
        <div
          className={getExpiredClass(emailProcessing, emailSuccess)}
          aria-live="assertive"
          role="alert"
        >
          <div className="share__player-cta-column">
            <H3 as={HEADING_TYPES.H4}>{staticText.get(expiredHeaderTextKey)}</H3>
            {duplicate ? null : <p>{staticText.get(expiredBodyTextkey)}</p>}
          </div>
          {
            duplicate
              ? null
              : <div className="share__player-cta-column">
                <FormsyForm
                  formname="share__player-cta-email"
                  onValidSubmit={onSendShareEmail}
                  onInvalid={onInvalid}
                  onValid={onValid}
                  ref={$form}
                >
                  <div className="share__player-cta-email-input">
                    <Sherpa
                      className={SHERPA_CLASS}
                      type={TYPE_SMALL_BLUE}
                    />
                    <EmailInput
                      label={staticText.get('formPlaceHolder')}
                      disabled={emailProcessing || emailSuccess}
                      validations="isEmail"
                      name="email"
                      value=""
                      required
                    />
                  </div>
                  <Button
                    disabled={!emailValid || emailProcessing || emailSuccess}
                    className={emailProcessing ? 'share__player-cta-email-submit share__player-cta-email-submit---processing' : 'share__player-cta-email-submit'}
                    type={TYPES.PRIMARY}
                    submit
                  >
                    <Icon type={ICON_TYPES.CHECK} />
                    {staticText.get(emailSuccess
                      ? 'playerAnonCTAEmailSent'
                      : 'playerAnonCTAEmailSubmit')}
                  </Button>
                </FormsyForm>
              </div>
          }
        </div>
      ) : null}
      {isAnonymous ? (
        <div className="share__player-cta-anon">
          <H3>{staticText.get('playerAnonCTAHeadline')}</H3>
          <H5 as={HEADING_TYPES.H6}>{staticText.get('playerAnonCTATitle')}</H5>
          <p>{staticText.get('playerAnonCTAContent')}</p>
          <Button
            inverted
            type={TYPES.SECONDARY}
            url={URL_PLAN_SELECTION_PLANS}
            onClick={onClickCta}
          >
            {staticText.get('playerAnonCTAButtonText')}
          </Button>
        </div>
      ) : (
        <div className="share__player-cta-member">
          <H3>{staticText.get('playerMemberCTAHeadline')}</H3>
          <p>{staticText.get('playerMemberCTAContent')}</p>
          <Button
            className="share__player-cta-share"
            type={TYPES.GHOST}
            onClick={onShare}
          >
            <Icon type={ICON_TYPES.SHARE} style={ICON_STYLES.FILL} />
            {staticText.get('playerMemberCTAButtonText')}
          </Button>
        </div>
      )}
    </div>
  )
}

SharePlayerCTA.defaultProps = {
  emailProcessing: false,
  emailSuccess: false,
}

SharePlayerCTA.propTypes = {
  duplicateShareEmailCapture: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  share: ImmutablePropTypes.map.isRequired,
  isAnonymous: PropTypes.bool.isRequired,
  renderModal: PropTypes.func.isRequired,
  emailProcessing: PropTypes.bool,
  emailSuccess: PropTypes.bool,
}
