
import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import _partial from 'lodash/partial'
import _debounce from 'lodash/debounce'
import _replace from 'lodash/replace'
import _trim from 'lodash/trim'
import _toLower from 'lodash/toLower'
import { requestAnimationFrame } from 'services/animate'
import GiftProgressMeter from 'components/Gift/GiftProgressMeter'
import GiftBackLink from 'components/Gift/GiftBackLink'
import { connect as connectStaticText } from 'components/StaticText/connect'
import FormsyForm from 'formsy-react'
import { RadioGroup, Radio, RADIO_STYLES } from 'components/FormInput.v2'
import FormButton from 'components/FormButton'
import { H1 } from 'components/Heading'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { FORM_INPUT_NAME_GIFT_GIVER_PAYMENT_TYPE } from 'services/form'
import {
  URL_GIFT_PREVIEW,
  URL_GIFT_CONFIRM,
} from 'services/url/constants'
import {
  GIFT_STEP_FIVE,
  GIFT_PAYMENT_TYPE_EXISTING,
} from 'services/gift'
import { PAYMENT_SOURCE_TYPE_PAYPAL } from 'services/credit-card'

function GiftPaymentPage (props) {
  const { staticText, auth, gift, userAccount } = props

  if (!gift.getIn(['step', 'active'])) {
    return null
  }

  const setFormValid = (valid) => {
    if (valid) {
      return true
    }

    return false
  }

  const onValidSubmit = () => {
    const { history, setGiftCheckoutStepComplete } = props

    setGiftCheckoutStepComplete(GIFT_STEP_FIVE)
    history.push(URL_GIFT_CONFIRM)

    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }

  const isSubmitDisabled = () => {
    const paymentTypeSelected = gift.getIn(['checkout', 'data', 'paymentType'], null)

    if (!paymentTypeSelected) {
      return true
    }

    return false
  }

  const onChangeSelectPaymentMethod = (name, value) => {
    const { setGiftCheckoutGiverPaymentType } = props

    setGiftCheckoutGiverPaymentType(value)
  }

  const getCurrentPaymentMethodText = () => {
    const paymentSourceType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'type'])
    const paymentSourceCardType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'cardType'])
    const paymentSourceMaskedCardNumber = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'maskedCardNumber'])
    const formattedMaskedCardNumber = _replace(paymentSourceMaskedCardNumber, /\*/g, '')
    const existingPayPalText = staticText.getIn(['data', 'existingPayPal'])

    if (!paymentSourceType) {
      return ''
    }

    if (paymentSourceType === PAYMENT_SOURCE_TYPE_PAYPAL) {
      return existingPayPalText
    }

    return `${paymentSourceCardType} ${staticText.getIn(['data', 'endingIn'])} ${formattedMaskedCardNumber}`
  }

  const getCurrentPaymentMethodClassName = () => {
    const paymentSourceType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'type'])
    const paymentSourceCardType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'cardType'])
    const baseClassName = 'gift-payment__payment-logo'
    const className = [baseClassName]
    let paymentType = _toLower(_trim(paymentSourceCardType))

    if (paymentSourceType === PAYMENT_SOURCE_TYPE_PAYPAL) {
      paymentType = _toLower(_trim(paymentSourceType))
    }

    className.push(`${baseClassName}--${paymentType}`)

    return className.join(' ')
  }

  const getCurrentPaymentMethodLabel = () => {
    return (
      <React.Fragment>
        <span className="gift-payment__label-text">
          {getCurrentPaymentMethodText()}
        </span>
        <span className={getCurrentPaymentMethodClassName()} />
      </React.Fragment>
    )
  }

  const debounceSetFormValid = _debounce(setFormValid, 100)
  const submitDisabled = isSubmitDisabled(props)
  const authToken = auth.get('jwt')
  const paymentSourceActive = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'active'], false)
  const paymentSourceLastTransactionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'lastTransactionStatus'])
  const canUseCurrentPaymentMethod = authToken && paymentSourceActive === true && paymentSourceLastTransactionStatus === 'Approved'

  return (
    <div className="gift-payment">
      <GiftProgressMeter />
      <div className="gift-payment__wrapper">
        <H1 className="gift-payment__title">
          {staticText.getIn(['data', 'title'])}
        </H1>
        <FormsyForm
          className="gift-payment__form"
          onValid={_partial(debounceSetFormValid, true)}
          onInvalid={_partial(debounceSetFormValid, false)}
          onValidSubmit={onValidSubmit}
        >
          <RadioGroup
            name={FORM_INPUT_NAME_GIFT_GIVER_PAYMENT_TYPE}
            onChange={onChangeSelectPaymentMethod}
          >
            {
              canUseCurrentPaymentMethod ?
                <Radio
                  style={RADIO_STYLES.PRIMARY}
                  label={getCurrentPaymentMethodLabel()}
                  value={GIFT_PAYMENT_TYPE_EXISTING}
                  block
                  className="gift-payment__radio"
                />
                : null
            }
          </RadioGroup>
          <div className="gift-payment__buttons">
            <FormButton
              type={FORM_BUTTON_TYPE_SUBMIT}
              disabled={submitDisabled}
              formButtonClass={[
                `form-button--${submitDisabled ? 'disabled' : 'primary'}`,
                'form-button--submit',
                'gift-payment__submit',
              ]}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              text={staticText.getIn(['data', 'finishSend'])}
            />
            <GiftBackLink url={URL_GIFT_PREVIEW} />
          </div>
        </FormsyForm>
      </div>
    </div>
  )
}

GiftPaymentPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  gift: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setGiftCheckoutStepComplete: PropTypes.func.isRequired,
  setGiftCheckoutGiverPaymentType: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      gift: state.gift,
      userAccount: state.userAccount,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setGiftCheckoutStepComplete: actions.gift.setGiftCheckoutStepComplete,
        setGiftCheckoutGiverPaymentType: actions.gift.setGiftCheckoutGiverPaymentType,
      }
    },
  ),
  connectStaticText({ storeKey: 'giftPaymentPage' }),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
)(GiftPaymentPage)
