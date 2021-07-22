
import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import { requestAnimationFrame } from 'services/animate'
import _partial from 'lodash/partial'
import _debounce from 'lodash/debounce'
import { dateIsValid, dateIsWithinRange, addDays, format as formatDateTime } from 'services/date-time'
import GiftProgressMeter from 'components/Gift/GiftProgressMeter'
import GiftBackLink from 'components/Gift/GiftBackLink'
import FormsyForm from 'formsy-react'
import {
  EmailInput,
  TextInput,
  Checkbox,
  Textarea,
} from 'components/FormInput.v2'
import FormButton from 'components/FormButton'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import Link from 'components/Link'
import { H1 } from 'components/Heading'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import { TYPE_LOGIN } from 'services/dialog'
import {
  FORM_INPUT_NAME_GIFT_GIVER_FIRST_NAME,
  FORM_INPUT_NAME_GIFT_GIVER_LAST_NAME,
  FORM_INPUT_NAME_GIFT_GIVER_EMAIL,
  FORM_INPUT_NAME_GIFT_GIVER_CONFIRM_EMAIL,
  FORM_INPUT_NAME_GIFT_GIVER_ANONYMOUS,
  FORM_INPUT_NAME_GIFT_RECIPIENT_FIRST_NAME,
  FORM_INPUT_NAME_GIFT_RECIPIENT_LAST_NAME,
  FORM_INPUT_NAME_GIFT_RECIPIENT_EMAIL,
  FORM_INPUT_NAME_GIFT_RECIPIENT_CONFIRM_EMAIL,
  FORM_INPUT_NAME_GIFT_RECIPIENT_MESSAGE,
  FORM_INPUT_NAME_GIFT_RECIPIENT_START_DATE,
} from 'services/form'
import {
  URL_GIFT_THEME,
  URL_GIFT_PREVIEW,
} from 'services/url/constants'
import {
  GIFT_STEP_THREE,
} from 'services/gift'

const KEY_FIRST_NAME = 'firstName'
const KEY_LAST_NAME = 'lastName'
const KEY_EMAIL = 'email'
const KEY_CONFIRM_EMAIL = 'confirmEmail'
const KEY_GIVER_ANONYMOUS = 'giverAnonymous'
const KEY_RECIPIENT_SEND_DATE = 'sendDate'
const KEY_RECIPIENT_MESSAGE = 'message'

function GiftGivePage (props) {
  const {
    gift,
    staticText,
    user,
    auth,
    page,
  } = props

  if (!gift.getIn(['step', 'active'])) {
    return null
  }

  const fromFirstName = gift.getIn(['checkout', 'data', 'giver', KEY_FIRST_NAME], '')
  const fromLastName = gift.getIn(['checkout', 'data', 'giver', KEY_LAST_NAME], '')
  const fromEmail = gift.getIn(['checkout', 'data', 'giver', KEY_EMAIL], '')
  const fromEmailConfirm = gift.getIn(['checkout', 'data', 'giver', KEY_CONFIRM_EMAIL], '')
  const giverIsAnonymous = gift.getIn(['checkout', 'data', 'giver', KEY_GIVER_ANONYMOUS], false)
  const emailAvailable = user.get('emailAvailable')
  const toFirstName = gift.getIn(['checkout', 'data', 'recipient', KEY_FIRST_NAME])
  const toLastName = gift.getIn(['checkout', 'data', 'recipient', KEY_LAST_NAME])
  const toEmail = gift.getIn(['checkout', 'data', 'recipient', KEY_EMAIL])
  const toEmailConfirm = gift.getIn(['checkout', 'data', 'recipient', KEY_CONFIRM_EMAIL])
  const giftSendDate = gift.getIn(['checkout', 'data', 'recipient', KEY_RECIPIENT_SEND_DATE])
  const giftSendDateError = gift.getIn(['checkout', 'data', 'recipient', 'dateError'])
  const giftRecipientMessage = gift.getIn(['checkout', 'data', 'recipient', KEY_RECIPIENT_MESSAGE])
  const recipientSubscriptionStatusProcessing = gift.get('subscriptionStatusProcessing')
  const recipientHasActiveSubscription = gift.getIn(['checkout', 'data', 'recipient', 'subscriptionStatus', 'activeSubscription'])
  const locale = page.get('locale')

  const dateFormatValidation = /^[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/
  const emailFormatValidation = /^.+@.+\..{2,}$/

  const setFormValid = (valid) => {
    if (valid) {
      return true
    }

    return false
  }

  const onValidSubmit = () => {
    const { history, setGiftCheckoutStepComplete } = props

    setGiftCheckoutStepComplete(GIFT_STEP_THREE)
    history.push(URL_GIFT_PREVIEW)

    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }

  const onChangeGiverFirstNameField = (value) => {
    const { setGiftCheckoutGiverDataItem } = props

    setGiftCheckoutGiverDataItem(KEY_FIRST_NAME, value)
  }

  const onChangeGiverLastNameField = (value) => {
    const { setGiftCheckoutGiverDataItem } = props

    setGiftCheckoutGiverDataItem(KEY_LAST_NAME, value)
  }

  const onChangeGiverEmailField = (value) => {
    const { setGiftCheckoutGiverDataItem, resetUserEmailAvailability } = props

    setGiftCheckoutGiverDataItem(KEY_EMAIL, value)

    if (user.has('emailAvailable')) {
      resetUserEmailAvailability()
    }
  }

  const onChangeGiverEmailConfirmField = (value) => {
    const { setGiftCheckoutGiverDataItem } = props

    setGiftCheckoutGiverDataItem(KEY_CONFIRM_EMAIL, value)
  }

  const onBlurCheckEmail = (value) => {
    const {
      getUserEmailAvailability,
    } = props
    const valid = emailFormatValidation.test(value)

    if (!value || !valid) {
      return
    }

    getUserEmailAvailability(value)
  }

  const onBlurCheckRecipientEmail = (value) => {
    const {
      getGiftCheckoutRecipientSubscriptionStatus,
    } = props
    const valid = emailFormatValidation.test(value)

    if (!value || !valid) {
      return
    }

    getGiftCheckoutRecipientSubscriptionStatus(value)
  }

  const onSelectAnonymousGiverCheckbox = (name, checked) => {
    const { setGiftCheckoutGiverDataItem } = props

    setGiftCheckoutGiverDataItem(name, checked)
  }

  const onChangeRecipientFirstNameField = (value) => {
    const { setGiftCheckoutRecipientDataItem } = props

    setGiftCheckoutRecipientDataItem(KEY_FIRST_NAME, value)
  }

  const onChangeRecipientLastNameField = (value) => {
    const { setGiftCheckoutRecipientDataItem } = props

    setGiftCheckoutRecipientDataItem(KEY_LAST_NAME, value)
  }

  const onChangeRecipientEmailField = (value) => {
    const { setGiftCheckoutRecipientDataItem } = props

    setGiftCheckoutRecipientDataItem(KEY_EMAIL, value)
  }

  const onChangeRecipientEmailConfirmField = (value) => {
    const { setGiftCheckoutRecipientDataItem } = props

    setGiftCheckoutRecipientDataItem(KEY_CONFIRM_EMAIL, value)
  }

  const onChangeRecipientSendDateField = (value) => {
    const { setGiftCheckoutRecipientDataItem, setGiftCheckoutRecipientDateError } = props
    const sendDate = new Date(value)
    const dateFormatString = 'MM/DD/YYYY'
    const today = formatDateTime(new Date(), locale, dateFormatString)
    const dateLimit = addDays(today, 365)
    const dateValid = dateIsValid(sendDate)
    const dateInRange = dateIsWithinRange(sendDate, today, dateLimit)

    if (dateValid && !dateInRange) {
      setGiftCheckoutRecipientDateError(true)
    }

    if (!dateValid || dateInRange) {
      setGiftCheckoutRecipientDateError(null)
    }

    setGiftCheckoutRecipientDataItem(KEY_RECIPIENT_SEND_DATE, value)
  }

  const onChangeRecipientMessageField = (value) => {
    const { setGiftCheckoutRecipientDataItem } = props

    setGiftCheckoutRecipientDataItem(KEY_RECIPIENT_MESSAGE, value)
  }

  const isSubmitDisabled = () => {
    const giverEmailMatch = fromEmail === fromEmailConfirm
    const recipientEmailMatch = toEmail === toEmailConfirm
    const processing = user.get('emailAvailabilityProcessing')
    const available = user.get('emailAvailable')
    const authToken = auth.get('jwt')
    const dateFormatError = !dateFormatValidation.test(giftSendDate)
    const recipientMessageToLong = giftRecipientMessage ? giftRecipientMessage.length > 255 : false

    // logged out
    if (
      !authToken &&
      (!fromFirstName ||
      !fromLastName ||
      !fromEmail ||
      !fromEmailConfirm ||
      !giverEmailMatch ||
      !toFirstName ||
      !toLastName ||
      !toEmail ||
      !toEmailConfirm ||
      !recipientEmailMatch ||
      giftSendDateError ||
      dateFormatError ||
      !available ||
      recipientSubscriptionStatusProcessing ||
      recipientHasActiveSubscription ||
      processing ||
      recipientMessageToLong)
    ) {
      return true
    }

    // logged in
    if (
      authToken &&
      (!fromFirstName ||
      !fromLastName ||
      !toFirstName ||
      !toLastName ||
      !toEmail ||
      !toEmailConfirm ||
      !recipientEmailMatch ||
      giftSendDateError ||
      dateFormatError ||
      recipientSubscriptionStatusProcessing ||
      recipientHasActiveSubscription ||
      recipientMessageToLong)
    ) {
      return true
    }

    return false
  }

  const onClickLoginLink = () => {
    const { setOverlayDialogVisible } = props

    setOverlayDialogVisible(TYPE_LOGIN)
  }

  const debounceSetFormValid = _debounce(setFormValid, 100)
  const submitDisabled = isSubmitDisabled(props)

  return (
    <div className="gift-give">
      <GiftProgressMeter />
      <div className="gift-give__wrapper">
        <H1 className="gift-give__title">{staticText.getIn(['data', 'enterRecipientInfo'])}</H1>
        <FormsyForm
          className="gift-give__form"
          onValid={_partial(debounceSetFormValid, true)}
          onInvalid={_partial(debounceSetFormValid, false)}
          onValidSubmit={onValidSubmit}
        >
          <div className="gift-give__form-fields-wrapper">
            <div className="gift-give__form-section-title">
              {staticText.getIn(['data', 'from'])}
            </div>
            <div className="gift-give__form-row">
              <div className="gift-give__input-wrapper gift-give__input-wrapper--odd">
                <TextInput
                  name={FORM_INPUT_NAME_GIFT_GIVER_FIRST_NAME}
                  label={staticText.getIn(['data', 'firstName'])}
                  required
                  validations={{
                    minLength: 1,
                    isSpecialWords: true,
                  }}
                  validationErrors={{
                    minLength: staticText.getIn(['data', 'nameValidError']),
                    isSpecialWords: staticText.getIn(['data', 'nameValidError']),
                  }}
                  maxLength={32}
                  value={fromFirstName}
                  onChange={onChangeGiverFirstNameField}
                />
              </div>
              <div className="gift-give__input-wrapper">
                <TextInput
                  name={FORM_INPUT_NAME_GIFT_GIVER_LAST_NAME}
                  label={staticText.getIn(['data', 'lastName'])}
                  required
                  validations={{
                    minLength: 1,
                    isSpecialWords: true,
                  }}
                  validationErrors={{
                    minLength: staticText.getIn(['data', 'nameValidError']),
                    isSpecialWords: staticText.getIn(['data', 'nameValidError']),
                  }}
                  maxLength={32}
                  value={fromLastName}
                  onChange={onChangeGiverLastNameField}
                />
              </div>
            </div>
            {
              !auth.get('jwt') ?
                <div className="gift-give__form-row">
                  <div className="gift-give__input-wrapper gift-give__input-wrapper--odd">
                    <EmailInput
                      onBlur={onBlurCheckEmail}
                      onChange={onChangeGiverEmailField}
                      name={FORM_INPUT_NAME_GIFT_GIVER_EMAIL}
                      label={staticText.getIn(['data', 'yourEmail'])}
                      value={fromEmail}
                      disabled={user.get('emailAvailabilityProcessing') === true}
                      required
                      validations={{ isEmail: true }}
                      validationErrors={{
                        isEmail: staticText.getIn(['data', 'emailError']),
                      }}
                      forceError={emailAvailable === false ? 'true' : ''}
                    />
                    {
                      emailAvailable === false ?
                        <React.Fragment>
                          <div className="gift-give__form-error gift-give__form-error--mixed">
                            {staticText.getIn(['data', 'alreadyAMember'])}
                          </div>
                          <Link
                            className="gift-give__login-link"
                            to={URL_JAVASCRIPT_VOID}
                            onClick={onClickLoginLink}
                          >
                            {staticText.getIn(['data', 'login'])}
                          </Link>
                        </React.Fragment>
                        : null
                    }
                  </div>
                  <div className="gift-give__input-wrapper">
                    <EmailInput
                      onChange={onChangeGiverEmailConfirmField}
                      autocomplete="off"
                      name={FORM_INPUT_NAME_GIFT_GIVER_CONFIRM_EMAIL}
                      label={staticText.getIn(['data', 'confirmYourEmail'])}
                      value={fromEmailConfirm}
                      required
                      validations={{ equalsField: FORM_INPUT_NAME_GIFT_GIVER_EMAIL }}
                      validationErrors={{
                        equalsField: staticText.getIn(['data', 'emailConfirmError']),
                      }}
                    />
                  </div>
                </div>
                :
                null
            }
            <Checkbox
              onChange={onSelectAnonymousGiverCheckbox}
              disabled={false}
              name={FORM_INPUT_NAME_GIFT_GIVER_ANONYMOUS}
              label={staticText.getIn(['data', 'giveAnonymously'])}
              value={giverIsAnonymous}
              className="gift-give__checkbox"
            />
            <div className="gift-give__form-section-title">
              {staticText.getIn(['data', 'to'])}
            </div>
            <div className="gift-give__form-row">
              <div className="gift-give__input-wrapper gift-give__input-wrapper--odd">
                <TextInput
                  name={FORM_INPUT_NAME_GIFT_RECIPIENT_FIRST_NAME}
                  label={staticText.getIn(['data', 'firstName'])}
                  required
                  validations={{
                    minLength: 1,
                    isSpecialWords: true,
                  }}
                  validationErrors={{
                    minLength: staticText.getIn(['data', 'nameValidError']),
                    isSpecialWords: staticText.getIn(['data', 'nameValidError']),
                  }}
                  maxLength={32}
                  value={toFirstName}
                  onChange={onChangeRecipientFirstNameField}
                />
              </div>
              <div className="gift-give__input-wrapper">
                <TextInput
                  name={FORM_INPUT_NAME_GIFT_RECIPIENT_LAST_NAME}
                  label={staticText.getIn(['data', 'lastName'])}
                  required
                  validations={{
                    minLength: 1,
                    isSpecialWords: true,
                  }}
                  validationErrors={{
                    minLength: staticText.getIn(['data', 'nameValidError']),
                    isSpecialWords: staticText.getIn(['data', 'nameValidError']),
                  }}
                  maxLength={32}
                  value={toLastName}
                  onChange={onChangeRecipientLastNameField}
                />
              </div>
            </div>
            <div className="gift-give__form-row">
              <div className="gift-give__input-wrapper gift-give__input-wrapper--odd">
                <EmailInput
                  onBlur={onBlurCheckRecipientEmail}
                  onChange={onChangeRecipientEmailField}
                  name={FORM_INPUT_NAME_GIFT_RECIPIENT_EMAIL}
                  label={staticText.getIn(['data', 'recipientEmail'])}
                  value={toEmail}
                  disabled={user.get('emailAvailabilityProcessing') === true}
                  required
                  validations={{ isEmail: true }}
                  validationErrors={{
                    isEmail: staticText.getIn(['data', 'emailError']),
                  }}
                  forceError={recipientHasActiveSubscription === true ? 'true' : ''}
                />
                {
                  recipientHasActiveSubscription === true ?
                    <div className="gift-give__form-error">
                      {staticText.getIn(['data', 'activeMemberError'])}
                    </div>
                    : null
                }
              </div>
              <div className="gift-give__input-wrapper">
                <EmailInput
                  onChange={onChangeRecipientEmailConfirmField}
                  autocomplete="off"
                  name={FORM_INPUT_NAME_GIFT_RECIPIENT_CONFIRM_EMAIL}
                  label={staticText.getIn(['data', 'confirmRecipientEmail'])}
                  value={toEmailConfirm}
                  required
                  validations={{ equalsField: FORM_INPUT_NAME_GIFT_RECIPIENT_EMAIL }}
                  validationErrors={{
                    equalsField: staticText.getIn(['data', 'emailConfirmError']),
                  }}
                />
              </div>
            </div>
            <div className="gift-give__form-row">
              <div className="gift-give__input-wrapper gift-give__input-wrapper--odd">
                <TextInput
                  name={FORM_INPUT_NAME_GIFT_RECIPIENT_START_DATE}
                  label={staticText.getIn(['data', 'sendDate'])}
                  required
                  validations={{
                    matchRegexp: dateFormatValidation,
                  }}
                  validationErrors={{
                    matchRegexp: staticText.getIn(['data', 'dateFormatError']),
                  }}
                  maxLength={10}
                  value={giftSendDate}
                  onChange={onChangeRecipientSendDateField}
                  className="gift-give__send-date"
                />
                {
                  giftSendDateError ?
                    <div className="gift-give__form-error">
                      {staticText.getIn(['data', 'dateLimitError'])}
                    </div>
                    : null
                }
              </div>
              <div className="gift-give__input-wrapper" />
            </div>
            <Textarea
              name={FORM_INPUT_NAME_GIFT_RECIPIENT_MESSAGE}
              className="gift-give__form-textarea"
              label={staticText.getIn(['data', 'message'])}
              value={giftRecipientMessage || ''}
              validations={{
                maxLength: 255,
              }}
              validationErrors={{
                maxLength: 'need error message!!!!!!!!',
              }}
              onChange={onChangeRecipientMessageField}
              maxLength={256}
            />
          </div>
          <div className="gift-give__buttons">
            <FormButton
              type={FORM_BUTTON_TYPE_SUBMIT}
              disabled={submitDisabled}
              formButtonClass={[
                `form-button--${submitDisabled ? 'disabled' : 'primary'}`,
                'form-button--submit',
                'gift-give__continue',
              ]}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              text={staticText.getIn(['data', 'continue'])}
            />
            <GiftBackLink url={URL_GIFT_THEME} />
          </div>
        </FormsyForm>
      </div>
    </div>
  )
}

GiftGivePage.propTypes = {
  history: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  gift: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setGiftCheckoutStepComplete: PropTypes.func.isRequired,
  setGiftCheckoutGiverDataItem: PropTypes.func.isRequired,
  setGiftCheckoutRecipientDataItem: PropTypes.func.isRequired,
  setGiftCheckoutRecipientDateError: PropTypes.func.isRequired,
  getUserEmailAvailability: PropTypes.func.isRequired,
  resetUserEmailAvailability: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  getGiftCheckoutRecipientSubscriptionStatus: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      gift: state.gift,
      user: state.user,
      auth: state.auth,
      page: state.page,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setGiftCheckoutStepComplete: actions.gift.setGiftCheckoutStepComplete,
        setGiftCheckoutGiverDataItem: actions.gift.setGiftCheckoutGiverDataItem,
        setGiftCheckoutRecipientDataItem: actions.gift.setGiftCheckoutRecipientDataItem,
        setGiftCheckoutRecipientDateError: actions.gift.setGiftCheckoutRecipientDateError,
        getUserEmailAvailability: actions.user.getUserEmailAvailability,
        resetUserEmailAvailability: actions.user.resetUserEmailAvailability,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        getGiftCheckoutRecipientSubscriptionStatus:
          actions.gift.getGiftCheckoutRecipientSubscriptionStatus,
      }
    },
  ),
  connectStaticText({ storeKey: 'giftGivePage' }),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
)(GiftGivePage)
