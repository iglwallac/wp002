import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import _partial from 'lodash/partial'
import _get from 'lodash/get'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import FormsyForm from 'formsy-react'
import { Checkbox } from 'components/FormInput.v2'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { H1, H4 } from 'components/Heading'
import { URL_ACCOUNT_SETTINGS } from 'services/url/constants'
import GaiaLogo, { TYPE_WHITE, TYPE_TEAL } from 'components/GaiaLogo'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'

const preferenceKeyTransformation = 'email_comm_tr'
const preferenceKeySeekingTruth = 'email_comm_st'
const preferenceKeyYoga = 'email_comm_my'

const initialState = {
  [preferenceKeyYoga]: true,
  [preferenceKeySeekingTruth]: true,
  [preferenceKeyTransformation]: true,
  emailAddress: '',
  updateSuccess: false,
}

function onValidSubmit (model, props, state) {
  const { doEmailSignup, page } = props
  const { emailAddress } = state
  const url = page.get('path')
  const fields = {
    [preferenceKeyTransformation]: model[preferenceKeyTransformation],
    [preferenceKeySeekingTruth]: model[preferenceKeySeekingTruth],
    [preferenceKeyYoga]: model[preferenceKeyYoga],
    url,
  }

  doEmailSignup(emailAddress, '', fields, '', true, true)
}

class EmailPreferencesPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = initialState
  }

  componentDidMount () {
    const {
      history,
      auth,
      location,
      getAnonymousUserEmailPreferences,
    } = this.props
    const emarsysId = _get(location, ['query', 'id'])

    // If the user is logged in,
    // redirect them to the user settings page
    if (auth.get('jwt')) {
      history.push(URL_ACCOUNT_SETTINGS)
    }

    // if there is no id in the query string, send them to the home page
    if (!emarsysId) {
      history.push('/')
    }

    getAnonymousUserEmailPreferences(emarsysId)
  }

  componentDidUpdate (prevProps) {
    /* eslint-disable react/no-did-update-set-state */
    const { user, emailSignup } = prevProps
    const prevUserEmailPrefsData = user.getIn(['data', 'anonymousEmailPreferences', 'data'], List())
    const currentUserEmailPrefsData = this.props.user.getIn(['data', 'anonymousEmailPreferences', 'data'], List())
    const previousEmailSignupSuccess = emailSignup.get('success')
    const currentEmailSignupSuccess = this.props.emailSignup.get('success')

    if (
      prevUserEmailPrefsData !== currentUserEmailPrefsData &&
      currentUserEmailPrefsData.size > 0
    ) {
      const seekingEmailPref = currentUserEmailPrefsData.find((pref) => {
        return pref.get('subscriptionKey') === preferenceKeySeekingTruth
      })
      const transformationEmailPref = currentUserEmailPrefsData.find((pref) => {
        return pref.get('subscriptionKey') === preferenceKeyTransformation
      })
      const yogaEmailPref = currentUserEmailPrefsData.find((pref) => {
        return pref.get('subscriptionKey') === preferenceKeyYoga
      })
      const emailAddress = currentUserEmailPrefsData.find((pref) => {
        return pref.get('email')
      })

      this.setState(() => ({
        [preferenceKeySeekingTruth]: seekingEmailPref.get('isSubscribed'),
        [preferenceKeyTransformation]: transformationEmailPref.get('isSubscribed'),
        [preferenceKeyYoga]: yogaEmailPref.get('isSubscribed'),
        emailAddress: emailAddress.get('email'),
      }))
    }

    if (previousEmailSignupSuccess !== currentEmailSignupSuccess && currentEmailSignupSuccess) {
      this.setState(() => ({ updateSuccess: true }))
    }
    /* eslint-enable react/no-did-update-set-state */
  }

  componentWillUnmount () {
    const { resetAnonymousUserEmailPreferences } = this.props
    // Reset anonymousEmailPreferences
    resetAnonymousUserEmailPreferences()
  }

  onSelectEmailPref = (name, checked) => {
    this.setState(() => ({
      [name]: checked,
    }))
  }

  renderSuccessMessage = () => {
    const { staticText } = this.props
    return (
      <div className="email-preferences__success">
        <H4 className="email-preferences__success-title">{staticText.getIn(['data', 'thankYou'])}</H4>
        <p className="email-preferences__success-text">{staticText.getIn(['data', 'preferencesUpdated'])}</p>
      </div>
    )
  }

  renderProcessing = () => {
    return (
      <div className="email-preferences__sherpa">
        <Sherpa type={TYPE_LARGE} />
      </div>
    )
  }

  renderEmailPrefForm = () => {
    const { props, state } = this
    const { staticText, emailSignup } = props
    const transformationSelected = _get(state, preferenceKeyTransformation, false)
    const seekingSelected = _get(state, preferenceKeySeekingTruth, false)
    const yogaSelected = _get(state, preferenceKeyYoga, false)
    const emailSignupError = !emailSignup.get('success') && emailSignup.get('errorCode')

    return (
      <FormsyForm
        className="email-preferences__form"
        onValidSubmit={_partial(onValidSubmit, _partial.placeholder, props, state)}
      >
        {
          emailSignupError ?
            <p className="email-preferences__signup-error">
              {staticText.getIn(['data', 'errorMessage'])}
            </p>
            : null
        }
        <p className="email-preferences__subscribe-text">
          {staticText.getIn(['data', 'sendMeEmailsAbout'])}
        </p>
        <div className="email-preferences__checkboxes">
          <Checkbox
            disabled={false}
            onChange={this.onSelectEmailPref}
            name={preferenceKeyTransformation}
            value={transformationSelected}
            htmlValue={staticText.getIn(['data', 'transformation'])}
            label={staticText.getIn(['data', 'transformation'])}
          />
          <Checkbox
            disabled={false}
            onChange={this.onSelectEmailPref}
            name={preferenceKeySeekingTruth}
            value={seekingSelected}
            htmlValue={staticText.getIn(['data', 'seekingTruth'])}
            label={staticText.getIn(['data', 'seekingTruth'])}
          />
          <Checkbox
            disabled={false}
            onChange={this.onSelectEmailPref}
            name={preferenceKeyYoga}
            value={yogaSelected}
            htmlValue={staticText.getIn(['data', 'yoga'])}
            label={staticText.getIn(['data', 'yoga'])}
          />
        </div>
        <div className="email-preferences__buttons">
          <FormButton
            formButtonClass={[
              'form-button--primary',
              'email-preferences__submit',
            ]}
            renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
            type={FORM_BUTTON_TYPE_SUBMIT}
            text={staticText.getIn(['data', 'update'])}
          />
        </div>
      </FormsyForm>
    )
  }

  render () {
    const { props, state } = this
    const { emailAddress, updateSuccess } = state
    const { auth, user, staticText, location, emailSignup } = props
    const emailPrefsProcessing = user.get('anonymousEmailPreferencesProcessing', true)
    const userEmailPrefs = user.getIn(['data', 'anonymousEmailPreferences'])
    const userEmailPrefsSuccess = user.getIn(['data', 'anonymousEmailPreferences', 'success'])
    const emailSignupProcessing = emailSignup.get('processing')

    // if we are logged in or there is no id in the query string
    if (auth.get('jwt') || !_get(location, ['query', 'id'])) {
      return null
    }

    // if we are processing
    if (emailPrefsProcessing && !userEmailPrefs) {
      return (
        <div className="email-preferences">
          {this.renderProcessing()}
        </div>
      )
    }

    // if getting the email preferences fails
    if (userEmailPrefsSuccess === false || userEmailPrefs.get('data').size === 0) {
      return (
        <div className="email-preferences">
          <div className="email-preferences__error-wrapper">
            <GaiaLogo isHref type={TYPE_TEAL} />
            <H1 className="email-preferences__title email-preferences__title--error">{staticText.getIn(['data', 'title'])}</H1>
            <p>{staticText.getIn(['data', 'errorMessageNoPreferencesFound'])}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="email-preferences">
        <div className="email-preferences__info">
          <GaiaLogo isHref type={TYPE_WHITE} />
          <div className="email-preferences__info-content">
            <H1 className="email-preferences__title">{staticText.getIn(['data', 'title'])}</H1>
            <p className="email-preferences__sent-to">
              {`${staticText.getIn(['data', 'emailsSentTo'])} ${emailAddress}`}
            </p>
          </div>
        </div>
        <div className="email-preferences__arrow" />
        <div className="email-preferences__action">
          <div className="email-preferences__right-content">
            {
              !updateSuccess && emailSignupProcessing ?
                this.renderProcessing()
                : null
            }
            {
              updateSuccess && !emailSignupProcessing ?
                this.renderSuccessMessage()
                : null
            }
            {
              !updateSuccess && !emailSignupProcessing ?
                this.renderEmailPrefForm()
                : null
            }
          </div>
        </div>
      </div>
    )
  }
}

EmailPreferencesPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  emailSignup: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  getAnonymousUserEmailPreferences: PropTypes.func.isRequired,
  resetAnonymousUserEmailPreferences: PropTypes.func.isRequired,
  doEmailSignup: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'emailPreferencesPage' }),
  connectRedux(
    state => ({
      user: state.user,
      auth: state.auth,
      page: state.page,
      emailSignup: state.emailSignup,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getAnonymousUserEmailPreferences: actions.user.getAnonymousUserEmailPreferences,
        resetAnonymousUserEmailPreferences: actions.user.resetAnonymousUserEmailPreferences,
        doEmailSignup: actions.emailSignup.doEmailSignupBrooklyn,
      }
    },
  ),
)(EmailPreferencesPage)
