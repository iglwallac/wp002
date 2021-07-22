
import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import _split from 'lodash/split'
import _map from 'lodash/map'
import { requestAnimationFrame } from 'services/animate'
import GiftProgressMeter from 'components/Gift/GiftProgressMeter'
import Link from 'components/Link'
import GiftBackLink from 'components/Gift/GiftBackLink'
import Icon from 'components/Icon'
import FormsyForm from 'formsy-react'
import {
  Checkbox,
} from 'components/FormInput.v2'
import FormButton from 'components/FormButton'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import {
  FORM_INPUT_NAME_GIFT_GIVER_TERMS_CONDITIONS,
} from 'services/form'
import { renderText as renderPlanPrice } from 'components/PlanGridPriceFirst'
import { H6, H1 } from 'components/Heading'
import {
  URL_GIFT_SELECT,
  URL_GIFT_RECIPIENT,
  URL_GIFT_PAYMENT,
} from 'services/url/constants'
import {
  GIFT_STEP_FOUR,
} from 'services/gift'

function GiftPreviewPage (props) {
  const {
    history,
    gift,
    plans,
    staticText,
    setGiftCheckoutStepComplete,
  } = props
  const selectedPlan = plans.get('selection', Map())
  const planName = selectedPlan.get('heading')
  const fromFirstName = gift.getIn(['checkout', 'data', 'giver', 'firstName'], '')
  const fromLastName = gift.getIn(['checkout', 'data', 'giver', 'lastName'], '')
  const fromEmail = gift.getIn(['checkout', 'data', 'giver', 'email'], '')
  const toFirstName = gift.getIn(['checkout', 'data', 'recipient', 'firstName'], '')
  const toLastName = gift.getIn(['checkout', 'data', 'recipient', 'lastName'], '')
  const toEmail = gift.getIn(['checkout', 'data', 'recipient', 'email'], '')
  const sendDate = gift.getIn(['checkout', 'data', 'recipient', 'sendDate'], '')
  const message = gift.getIn(['checkout', 'data', 'recipient', 'message'])
  const termsAccepted = gift.getIn(['checkout', 'data', 'giver', 'giverTermsConditions'], false)

  if (!gift.getIn(['step', 'active'])) {
    return null
  }

  const outputMessage = (messageItem, index) => {
    if (!messageItem) {
      return null
    }

    return (
      <p key={`message-${index}`} className="gift-preview__message-item">{messageItem}</p>
    )
  }

  const formatMessage = (userMessage) => {
    const newLineRegex = /\r?\n/g
    const messageArray = _split(userMessage, newLineRegex)

    return (
      <div className="gift-preview__message">
        {_map(messageArray, outputMessage)}
      </div>
    )
  }

  const onValidSubmit = () => {
    setGiftCheckoutStepComplete(GIFT_STEP_FOUR)
    history.push(URL_GIFT_PAYMENT)

    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }

  const onSelectTermsConditions = (name, checked) => {
    const { setGiftCheckoutGiverDataItem } = props

    setGiftCheckoutGiverDataItem(name, checked)
  }

  const setFormValid = (valid) => {
    if (valid) {
      return true
    }

    return false
  }

  const isSubmitDisabled = () => {
    if (!termsAccepted) {
      return true
    }

    return false
  }

  const submitDisabled = isSubmitDisabled(props)

  return (
    <div className="gift-preview">
      <GiftProgressMeter />
      <div className="gift-preview__wrapper">
        <FormsyForm
          className="gift-preview__form"
          onValid={setFormValid}
          onInvalid={setFormValid}
          onValidSubmit={onValidSubmit}
        >
          <H1 className="gift-preview__title">{staticText.getIn(['data', 'previewGift'])}</H1>
          <div className="gift-preview__info-wrapper">
            <div className="gift-preview__info">
              <div className="gift-preview__info-row">
                <div className="gift-preview__info-detail">
                  <H6 className="gift-preview__info-label">{staticText.getIn(['data', 'gift'])}</H6>
                  <div className="gift-preview__info-item">
                    {planName}
                  </div>
                  <div className="gift-preview__info-item">
                    {selectedPlan.size > 0 ? renderPlanPrice(selectedPlan) : ''}
                  </div>
                  <Link
                    to={URL_GIFT_SELECT}
                    className="gift-preview__edit-link"
                    scrollToTop
                  >
                    <span className="gift-preview__edit-link-text">
                      {staticText.getIn(['data', 'edit'])}
                    </span>
                    <Icon iconClass={['icon--right', 'gift-preview__right-icon']} />
                  </Link>
                </div>
                <div className="gift-preview__info-detail">
                  <H6 className="gift-preview__info-label">{staticText.getIn(['data', 'from'])}</H6>
                  <div className="gift-preview__info-item">
                    {`${fromFirstName} ${fromLastName}`}
                  </div>
                  <div className="gift-preview__info-item">
                    {fromEmail}
                  </div>
                  <Link
                    to={URL_GIFT_RECIPIENT}
                    className="gift-preview__edit-link"
                    scrollToTop
                  >
                    <span className="gift-preview__edit-link-text">
                      {staticText.getIn(['data', 'edit'])}
                    </span>
                    <Icon iconClass={['icon--right', 'gift-preview__right-icon']} />
                  </Link>
                </div>
              </div>
              <div className="gift-preview__info-row">
                <div className="gift-preview__info-detail">
                  <H6 className="gift-preview__info-label">{staticText.getIn(['data', 'to'])}</H6>
                  <div className="gift-preview__info-item">
                    {`${toFirstName} ${toLastName}`}
                  </div>
                  <div className="gift-preview__info-item">
                    {toEmail}
                  </div>
                  <Link
                    to={URL_GIFT_SELECT}
                    className="gift-preview__edit-link"
                    scrollToTop
                  >
                    <span className="gift-preview__edit-link-text">
                      {staticText.getIn(['data', 'edit'])}
                    </span>
                    <Icon iconClass={['icon--right', 'gift-preview__right-icon']} />
                  </Link>
                </div>
                <div className="gift-preview__info-detail">
                  <H6 className="gift-preview__info-label">{staticText.getIn(['data', 'deliveryDate'])}</H6>
                  <div className="gift-preview__info-item">
                    {sendDate}
                  </div>
                  <Link
                    to={URL_GIFT_RECIPIENT}
                    className="gift-preview__edit-link"
                    scrollToTop
                  >
                    <span className="gift-preview__edit-link-text">
                      {staticText.getIn(['data', 'edit'])}
                    </span>
                    <Icon iconClass={['icon--right', 'gift-preview__right-icon']} />
                  </Link>
                </div>
              </div>
              <div className="gift-preview__info-row gift-preview__info-row--message">
                <H6 className="gift-preview__info-label">{staticText.getIn(['data', 'message'])}</H6>
                <div className="gift-preview__info-item">
                  {formatMessage(message)}
                  <Link
                    to={URL_GIFT_RECIPIENT}
                    className="gift-preview__edit-link"
                    scrollToTop
                  >
                    <span className="gift-preview__edit-link-text">
                      {staticText.getIn(['data', 'edit'])}
                    </span>
                    <Icon iconClass={['icon--right', 'gift-preview__right-icon']} />
                  </Link>
                </div>
              </div>
              <div className="gift-preview__terms-conditions">
                <p className="gift-preview__terms">
                  {staticText.getIn(['data', 'termsConditions'])}
                </p>
                <Checkbox
                  onChange={onSelectTermsConditions}
                  disabled={false}
                  name={FORM_INPUT_NAME_GIFT_GIVER_TERMS_CONDITIONS}
                  label={staticText.getIn(['data', 'agreeTerms'])}
                  value={termsAccepted}
                  className="gift-preview__checkbox"
                  required
                />
              </div>
            </div>
            <div className="gift-preview__image">
              Image Placeholder
            </div>
          </div>
          <div className="gift-preview__buttons">
            <FormButton
              type={FORM_BUTTON_TYPE_SUBMIT}
              disabled={submitDisabled}
              formButtonClass={[
                `form-button--${submitDisabled ? 'disabled' : 'primary'}`,
                'form-button--submit',
                'gift-preview__continue',
              ]}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              text={staticText.getIn(['data', 'continue'])}
            />
            <GiftBackLink url={URL_GIFT_RECIPIENT} />
          </div>
        </FormsyForm>
      </div>
    </div>
  )
}

GiftPreviewPage.propTypes = {
  history: PropTypes.object.isRequired,
  gift: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setGiftCheckoutStepComplete: PropTypes.func.isRequired,
  setGiftCheckoutGiverDataItem: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      gift: state.gift,
      plans: state.plans,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setGiftCheckoutStepComplete: actions.gift.setGiftCheckoutStepComplete,
        setGiftCheckoutGiverDataItem: actions.gift.setGiftCheckoutGiverDataItem,
      }
    },
  ),
  connectStaticText({ storeKey: 'giftPreviewPage' }),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
)(GiftPreviewPage)
