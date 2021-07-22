import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List, fromJS } from 'immutable'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import GaiaLogo, { TYPE_WHITE } from 'components/GaiaLogo'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import Link from 'components/Link'
import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'
import _replace from 'lodash/replace'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import FormsyForm from 'formsy-react'
import { Checkbox } from 'components/FormInput.v2'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { URL_FREE_TRIAL, URL_FREE_TRIAL_ACCOUNT, URL_PLAN_SELECTION, URL_GET_STARTED } from 'services/url/constants'
import Icon from 'components/Icon'
import { format as formatDateTime, addDays } from 'services/date-time'
import ErrorMessage from 'components/ErrorMessage'
import { PLAN_ID_FREE_TRIAL } from 'services/plans'
import { TYPE_LOGIN } from 'services/dialog'
import { H1, H4, HEADING_TYPES } from 'components/Heading'

const FORM_INPUT_NAME_CONFIRM = 'confirm'

class FreeTrialConfirmPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      [FORM_INPUT_NAME_CONFIRM]: false,
    }
  }

  componentDidMount () {
    const { auth, history } = this.props

    if (auth.get('jwt')) {
      history.push(URL_FREE_TRIAL)
    }
  }

  componentDidUpdate (prevProps) {
    const { checkout } = prevProps
    const previousCheckoutOrderData = checkout.get('orderData')
    const currentCheckoutOrderData = this.props.checkout.get('orderData')

    if (currentCheckoutOrderData && currentCheckoutOrderData !== previousCheckoutOrderData) {
      this.finializeCheckout(this.props)
    }
  }

  componentWillUnmount () {
    const { setCheckoutOrderProcessing } = this.props
    setCheckoutOrderProcessing(false)
  }

  onValidSubmit = () => {
    const {
      user = Map(),
      checkout = Map(),
      inboundTracking,
      processCheckoutOrder,
    } = this.props
    const userLanguage = user.getIn(['data', 'language'], List())
    const userInfo = checkout.get('account') || Map()
    const productRatePlanId = PLAN_ID_FREE_TRIAL
    const paymentInfo = {
      productRatePlanId,
    }

    return processCheckoutOrder({
      userInfo,
      paymentInfo,
      language: userLanguage.toJS(),
      tracking: inboundTracking,
    })
  }

  onSelectCheckbox = (name, checked) => {
    this.setState(() => ({
      [name]: checked,
    }))
  }

  onAuthLoginFeatureTracking = async (options = {}) => {
    const { auth = Map(), user = Map(), setFeatureTrackingDataPersistent } = options
    let featureTrackingData
    try {
      const userLanguages = user.getIn(['data', 'language'], List())
      if (userLanguages.size > 0) {
        featureTrackingData = await setFeatureTrackingDataPersistent({
          auth: fromJS(auth),
          data: Map({ userLanguages }),
        })
      }
    } catch (e) {
      // Do nothing
    }

    return featureTrackingData
  }

  finializeCheckout = async (props) => {
    const {
      user = Map(),
      checkout = Map(),
      doAuthLogin,
      setFeatureTrackingDataPersistent,
      history,
      resetCheckout,
    } = props
    const userInfo = checkout.get('account') || Map()

    try {
      const authResult = await doAuthLogin({
        username: checkout.getIn(['orderData', 'newUsername']),
        password: userInfo.get('password'),
      })
      await this.onAuthLoginFeatureTracking({
        auth: authResult,
        user,
        setFeatureTrackingDataPersistent,
      })
      resetCheckout()
      history.push(URL_GET_STARTED)
    } catch (e) {
      // Do nothing
    }
  }

  isSubmitDisabled = () => !_get(this.state, FORM_INPUT_NAME_CONFIRM)

  renderProcessing = () => {
    const { staticText = Map() } = this.props

    return (
      <div className="free-trial-confirm__sherpa">
        <Sherpa type={TYPE_LARGE} />
        <div className="free-trial-confirm__processing-text">
          {staticText.getIn(['data', 'creatingYourAccount'])}
        </div>
      </div>
    )
  }

  renderOrderError = (props) => {
    const { auth = Map(), staticText = Map(), checkout = Map(), setOverlayDialogVisible } = props
    const checkoutOrderError = checkout.get('orderError')
    if (auth.get('failed')) {
      return (
        <ErrorMessage
          errorMessages={['Automatic login failed, please click login to continue']}
          errorMessageClass={['free-trial-confirm__error-message']}
        >
          <Link onClick={() => setOverlayDialogVisible(TYPE_LOGIN)}>Click here to login</Link>
        </ErrorMessage>
      )
    }
    if (!checkoutOrderError) {
      return null
    }

    const message = staticText.getIn(['data', 'errorMessage'])
    const orderErrorMessages = [message]
    return (
      <ErrorMessage
        errorMessages={orderErrorMessages}
        errorMessageClass={['free-trial-confirm__error-message']}
      />
    )
  }

  renderForm = (props, state) => {
    const { staticText = Map() } = props
    const submitDisabled = this.isSubmitDisabled()
    const confirm = _get(state, FORM_INPUT_NAME_CONFIRM, false)

    return (
      <FormsyForm
        onValidSubmit={this.onValidSubmit}
        className="free-trial-confirm__form"
      >
        <Checkbox
          onChange={this.onSelectCheckbox}
          disabled={false}
          name={FORM_INPUT_NAME_CONFIRM}
          label={staticText.getIn(['data', 'confirm'])}
          value={confirm}
          required
          className="free-trial-confirm__confirm"
        />
        <FormButton
          type={FORM_BUTTON_TYPE_SUBMIT}
          disabled={submitDisabled}
          formButtonClass={[
            `form-button--${submitDisabled ? 'disabled' : 'primary'}`,
            'form-button--submit',
            'free-trial-confirm__submit',
          ]}
          renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
          text={staticText.getIn(['data', 'next'])}
        />
      </FormsyForm>
    )
  }

  render () {
    const { props, state } = this
    const {
      auth = Map(), plans = Map(), staticText = Map(), checkout = Map(), page = Map(),
    } = props
    const email = checkout.getIn(['account', 'email'])
    const dateFormatString = 'MM/DD/YY'
    const firstName = checkout.getIn(['account', 'firstName'], '')
    const lastName = checkout.getIn(['account', 'lastName'], '')
    const selectedPlan = plans.get('selection', Map())
    const planHeading = selectedPlan.get('heading', '')
    const entitlementDays = _parseInt(selectedPlan.get('entitlementDays', 2))
    const entitlementHours = entitlementDays * 24
    const locale = page.get('locale')
    const today = formatDateTime(new Date(), locale, dateFormatString)
    const endDate = addDays(new Date(), entitlementDays)
    const formattedEndDate = formatDateTime(endDate, locale, dateFormatString)
    const begins = staticText.getIn(['data', 'begins'])
    const ends = staticText.getIn(['data', 'ends'])
    const disclaimerText = staticText.getIn(['data', 'disclaimer'])
    const disclaimer = _replace(disclaimerText, /\$\{ trialDuration \}/, entitlementHours)
    const checkoutProcessing = checkout.get('processing')
    const authProcessing = auth.get('processing')
    const processing = checkoutProcessing || authProcessing

    return (
      <div className="free-trial-confirm">
        {
          processing ?
            this.renderProcessing()
            :
            <div>
              <div className="free-trial-confirm__info">
                <GaiaLogo isHref type={TYPE_WHITE} />
                <div className="free-trial-confirm__info-content">
                  <H1 inverted as={HEADING_TYPES.H2} className="free-trial-confirm__title">
                    {staticText.getIn(['data', 'title'])}
                  </H1>
                  <p className="free-trial-confirm__description">
                    {staticText.getIn(['data', 'description'])}
                  </p>
                </div>
                <Link
                  to={URL_FREE_TRIAL_ACCOUNT}
                  scrollToTop
                  className="free-trial-confirm__back"
                >
                  <Icon iconClass={['icon--left', 'free-trial-confirm__icon-left']} />
                  {staticText.getIn(['data', 'back'])}
                </Link>
              </div>
              <div className="free-trial-confirm__arrow" />
              <div className="free-trial-confirm__action">
                <div className="free-trial-confirm__action-content">
                  <div className="free-trial-confirm__account-info">
                    {this.renderOrderError(props)}
                    <H4 className="free-trial-confirm__heading">{staticText.getIn(['data', 'yourAccountInfo'])}</H4>
                    <p className="free-trial-confirm__info-item">{`${firstName} ${lastName}`}</p>
                    <p className="free-trial-confirm__info-item free-trial-confirm__info-item--last">{email}</p>
                    <Link
                      to={URL_FREE_TRIAL_ACCOUNT}
                      scrollToTop
                      className="free-trial-confirm__inline-link"
                    >
                      {staticText.getIn(['data', 'changAccountInfo'])}
                    </Link>
                  </div>
                  <div className="free-trial-confirm__plan">
                    <H4 className="free-trial-confirm__heading">{staticText.getIn(['data', 'yourPlan'])}</H4>
                    <p className="free-trial-confirm__info-item">{planHeading}</p>
                    <p className="free-trial-confirm__info-item free-trial-confirm__info-item--last">
                      {`${begins} ${today}, ${ends} ${formattedEndDate}`}
                    </p>
                    <Link
                      to={URL_PLAN_SELECTION}
                      scrollToTop
                      className="free-trial-confirm__inline-link"
                    >
                      {staticText.getIn(['data', 'becomeMember'])}
                      <Icon iconClass={['icon--right', 'free-trial-confirm__icon-right']} />
                    </Link>
                  </div>
                  <p>{disclaimer}</p>
                  {this.renderForm(props, state)}
                </div>
              </div>
            </div>
        }
      </div>
    )
  }
}

FreeTrialConfirmPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  inboundTracking: ImmutablePropTypes.map.isRequired,
  featureTracking: ImmutablePropTypes.map.isRequired,
  processCheckoutOrder: PropTypes.func.isRequired,
  doAuthLogin: PropTypes.func.isRequired,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setCheckoutOrderProcessing: PropTypes.func.isRequired,
  resetCheckout: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'freeTrialConfirmPage' }),
  connectRedux(
    state => ({
      auth: state.auth,
      plans: state.plans,
      user: state.user,
      checkout: state.checkout,
      page: state.page,
      inboundTracking: state.inboundTracking,
      featureTracking: state.featureTracking,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        processCheckoutOrder: actions.checkout.processCheckoutOrder,
        doAuthLogin: actions.auth.doAuthLogin,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setFeatureTrackingDataPersistent:
          actions.featureTracking.setFeatureTrackingDataPersistent,
        setCheckoutOrderProcessing: actions.checkout.setCheckoutOrderProcessing,
        resetCheckout: actions.checkout.resetCheckout,
      }
    },
  ),
)(FreeTrialConfirmPage)
