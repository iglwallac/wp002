import get from 'lodash/get'
import PropTypes from 'prop-types'
import isBool from 'lodash/isBoolean'
import React, { Component } from 'react'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List, fromJS } from 'immutable'
import { getBoundActions } from 'actions'
import FormsyForm from 'formsy-react'
import Button from 'components/Button'
import { H2, H5 } from 'components/Heading'
import FormButton from 'components/FormButton'
import { getPrimary } from 'services/languages'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import Support from 'components/Support'
import { Card, STATES } from 'components/Card'
import { SlideInput, Checkbox } from 'components/FormInput.v2'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import FormInput, { FORM_INPUT_TYPE_CHECKBOX } from 'components/FormInput'
import VerticalNavigation, { ACCOUNT } from 'components/VerticalNavigation'
import { RENDER_TYPE_FORM_BUTTON_INPUT, RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import FormInputGroup, { FORM_INPUT_GROUP_TYPE_RADIO } from 'components/FormInputGroup'
import { get as getConfig } from 'config'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import MyAccountSettingsV2 from '../MyAccountSettingsV2'

const config = getConfig()

const BUTTON_SAVE_CLASS = [
  'form-button--primary',
  'my-account-settings__email-save',
]

const BUTTON_CANCEL_CLASS = [
  'form-button--primary-inverted',
  'my-account-settings__email-cancel',
]

const LANGUAGE_PRIMARY_CLASS = [
  'language-primary-select',
]

const LANGUAGE_SECONARY_CLASS = [
  'language-secondary-select__checkbox-input',
]

export const ACCOUNT_SETTINGS_PATH = '/account/settings'

class MyAccountSettings extends Component {
  //
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const { props } = this
    const { getUserContactData } = props

    let { uid } = props
    if (config.emarsysTestmode) {
      uid = config.emarsysTestmodeUserId
    }
    getUserContactData(uid)
  }

  onPrimaryLanguageSelect = (e) => {
    const { target } = e
    const { value } = target
    this.setState(() => ({
      primaryLanguage: value,
    }))
  }

  onSelectGlobalSubscription = (value, checked) => {
    this.setState(() => ({
      globalSubscriptionEnabled: checked,
    }))
  }

  onSelectSubscription = (name, checked) => {
    this.setState(() => ({
      [name]: checked,
    }))
  }

  onAutoPlaySettingsChange = () => {
    const { props } = this
    const { setFeatureTrackingDataPersistent, disableAutoPlayNext } = props

    setFeatureTrackingDataPersistent({
      data: Map({ disableAutoPlayNext: !disableAutoPlayNext }),
    })
  }

  handleLanguageSubmit = (model) => {
    const { props } = this
    const { setUserDataLanguage, setFeatureTrackingDataPersistent } = props
    const data = fromJS(model)
    const primary = data.get('primaryLanguage', 'en')
    const secondary = data.delete('primaryLanguage')
    const languages = secondary.reduce((list, val, key) => {
      if (val && !list.includes(key)) return list.push(key)
      return list
    }, List([primary]))

    setUserDataLanguage(languages)
    setFeatureTrackingDataPersistent({
      data: Map({ userLanguages: languages }),
    })
  }

  resetForm = () => {
    const { props } = this
    const { emarsys } = props
    const globalSubscription = emarsys.get('globalSubscription', Map())
    const editableSubscriptions = emarsys.get('editableSubscriptions', List())
    const state = editableSubscriptions.reduce((map, s) => {
      return map.set(s.get('subscriptionKey'), s.get('isSubscribed'))
    }, Map())
    this.setState(() => (
      state.set('globalSubscriptionEnabled',
        globalSubscription.get('isSubscribed')).toJS()
    ))
  }

  updateSubscriptions = () => {
    const { props, state } = this
    const { auth, emarsys, doEmailSignup } = props
    const preferences = emarsys.get('subscriptions').reduce((map, s) => {
      const key = s.get('subscriptionKey')
      const value = s.get('isSubscribed')
      if (key === 'optin') return map.set('optin', get(state, 'globalSubscriptionEnabled', value))
      return map.set(key, get(state, key, value))
    }, Map())

    let email = auth.get('email')

    if (config.emarsysTestmode) {
      email = config.emarsysTestmodeUserEmail
    }

    const optin = preferences.get('optin')
    const fields = preferences.delete('optin').toJS()
    doEmailSignup(email, '', fields, '', optin, true)
  }

  renderLanguageDisplay () {
    const { props } = this
    const { featureTrackingLanguages, staticText, userLanguages } = props
    const selectedPrimaryLang = staticText.getIn(['data', `${getPrimary(userLanguages)}`])
    const secondaryLangDisplays = featureTrackingLanguages.map(lang => (
      staticText.getIn(['data', lang])
    )).join(', ')

    return (
      <div className="language-select-box__flex">
        <div className="language-select-box__section-left">
          <H5>{staticText.getIn(['data', 'primarySubhead'])}</H5>
          {selectedPrimaryLang}
        </div>
        <div className="language-select-box__section-left">
          <H5>{staticText.getIn(['data', 'secondarySubhead'])}</H5>
          {secondaryLangDisplays}
        </div>
      </div>
    )
  }

  renderLanguageEditMode (cancelEdit) {
    const { props, state } = this
    const { primaryLanguage: statePrimaryLanguage } = state
    const { staticText, languages, userLanguages, featureTrackingLanguages } = props
    const primaryLanguage = statePrimaryLanguage || userLanguages.get(0, 'en')
    return (
      <FormsyForm
        className="language-select-box__form"
        onSubmit={(model) => {
          this.handleLanguageSubmit(model)
          cancelEdit()
        }}
      >
        <div className="language-select-box__lang-container-outer">
          <div className="language-select-box__lang-container">
            <H5>{staticText.getIn(['data', 'primarySubhead'])}</H5>
            {staticText.getIn(['data', 'primaryBody'])}
            <div className="language-select-box__lang-checkboxes">
              <FormInputGroup
                onChange={this.onPrimaryLanguageSelect}
                className={LANGUAGE_PRIMARY_CLASS}
                type={FORM_INPUT_GROUP_TYPE_RADIO}
                value={primaryLanguage}
                name="primaryLanguage"
                options={languages}
              />
            </div>
          </div>
          <div className="language-select-box__lang-container">
            <H5>{staticText.getIn(['data', 'secondarySubhead'])}</H5>
            {staticText.getIn(['data', 'secondaryBody'])}
            <div className="language-select-box__lang-checkboxes">
              {languages.map((lang) => {
                const value = lang.get('value')
                const primary = value === primaryLanguage
                const selected = primary || featureTrackingLanguages.includes(value)
                return (
                  <FormInput
                    className={LANGUAGE_SECONARY_CLASS}
                    key={`form-input__radio--${value}`}
                    type={FORM_INPUT_TYPE_CHECKBOX}
                    label={lang.get('label')}
                    checkedValue={value}
                    disabled={primary}
                    value={selected}
                    name={value}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <div className="my-account-settings__language-buttons">
          <div className="my-account-settings__language-btn">
            <FormButton
              type={FORM_BUTTON_TYPE_SUBMIT}
              formButtonClass={BUTTON_SAVE_CLASS}
              renderType={RENDER_TYPE_FORM_BUTTON_INPUT}
              text={staticText.getIn(['data', 'save'])}
            />
          </div>
          <div className="my-account-settings__language-btn">
            <Button
              text={staticText.getIn(['data', 'cancel'])}
              buttonClass={BUTTON_CANCEL_CLASS}
              onClick={() => {
                cancelEdit()
                this.setState(() => ({
                  primaryLanguage: null,
                }))
              }}
            />
          </div>
        </div>
      </FormsyForm>
    )
  }

  renderNotificationsDisplay (editCard) {
    //
    const { props } = this
    const { staticText, emarsys } = props
    const editableSubscriptions = emarsys.get('editableSubscriptions', List())
    const selectedSubscriptionCount = emarsys.get('selectedSubscriptionCount', 0)
    return (
      <div>
        <H5>
          <span className="my-account-settings__header-text">
            {staticText.getIn(['data', 'emailSubscription'])}
          </span>
          {selectedSubscriptionCount < 1
            ? (
              <aside className="my-account-settings__subscription-count my-account-settings__subscription-count-none">
                {staticText.getIn(['data', 'unsubscribed'])}
              </aside>
            ) : (
              <aside className="my-account-settings__subscription-count">
                {`${selectedSubscriptionCount} ${staticText.getIn(['data', 'selected'])}`}
              </aside>
            )
          }
        </H5>
        <FormsyForm
          className="my-account-settings__email-form"
          onSubmit={() => {
            this.handleEmailPrefsSubmit()
            editCard()
          }}
        >
          {editableSubscriptions.reduce((list, subscription) => {
            const name = subscription.get('name', '')
            const subscriptionKey = subscription.get('subscriptionKey', '')
            const isSubscribed = this.state[subscriptionKey]
            if (isSubscribed) return list.push(name)
            return list
          }, List()).join(', ')}
        </FormsyForm>
      </div>
    )
  }

  renderNotificationsEditMode (closeCard) {
    const { props, state, resetForm, updateSubscriptions } = this
    const { staticText, emarsys } = props
    const { globalSubscriptionEnabled } = state
    const editableSubscriptions = emarsys.get('editableSubscriptions', List())
    const globalSubscription = emarsys.get('globalSubscription', Map())
    const isGlobalSusbscriptionEnabled = isBool(globalSubscriptionEnabled)
      ? globalSubscriptionEnabled : globalSubscription.get('isSubscribed')
    return (
      <div>
        <H5>{staticText.getIn(['data', 'emailSubscription'])}</H5>
        <FormsyForm
          className="my-account-settings__email-form"
          onSubmit={() => {
            updateSubscriptions()
            closeCard()
          }}
        >
          {
            editableSubscriptions.map((subscription) => {
              const name = subscription.get('name', '')
              const desc = subscription.get('desc', '')
              const subscriptionKey = subscription.get('subscriptionKey', '')
              const isSubscribedState = get(state, subscriptionKey)
              const isSubscribed = isBool(isSubscribedState)
                ? isSubscribedState : subscription.get('isSubscribed', false)
              return (
                <div
                  key={`email-pref-${name}`}
                  className="my-account-settings__email-subscription-box"
                >
                  <Checkbox
                    disabled={!isGlobalSusbscriptionEnabled}
                    onChange={this.onSelectSubscription}
                    name={subscriptionKey}
                    value={isSubscribed}
                    htmlValue={name}
                    label={name}
                    note={desc}
                  />
                </div>
              )
            })
          }
          <div className="my-account-settings__email-toggle-container">
            <H5>{staticText.getIn(['data', 'emailSubscriptionAll'])}</H5>
            {staticText.getIn(['data', 'toggleThis'])}
            <div className="my-account-settings__toggle-container">
              <SlideInput
                onChange={this.onSelectGlobalSubscription}
                value={isGlobalSusbscriptionEnabled}
                htmlValue="emailOptIn"
                name="emailOptIn"
                label=""
              />
            </div>
          </div>
          <div className="my-account-settings__email-buttons">
            <FormButton
              formButtonClass={[
                'form-button--primary',
                'my-account-settings__email-save',
              ]}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              type={FORM_BUTTON_TYPE_SUBMIT}
              text={staticText.getIn(['data', 'save'])}
            />
            <Button
              buttonClass={['my-account-settings__email-cancel']}
              text={staticText.getIn(['data', 'cancel'])}
              onClick={() => {
                resetForm()
                closeCard()
              }}
            />
          </div>
        </FormsyForm>
      </div>
    )
  }

  renderEmailSettings () {
    const { props } = this
    const { emarsys, staticText } = props
    const unavailable = emarsys.get('unavailable')
    return (
      <div className="my-account-settings__email-subscription">
        {unavailable ? (
          <Card>
            {staticText.getIn(['data', 'emarsysUnavailable'])}
          </Card>
        ) : (
          <Card editable>
            {(editState, toggleState) => (
              editState === STATES.DISPLAY
                ? this.renderNotificationsDisplay(toggleState)
                : this.renderNotificationsEditMode(toggleState)
            )}
          </Card>
        )}
      </div>
    )
  }

  renderLanguageSettings () {
    return (
      <div className="language-select-box">
        <Card editable>
          {(editState, toggleState) => (
            editState === STATES.DISPLAY
              ? this.renderLanguageDisplay()
              : this.renderLanguageEditMode(toggleState)
          )}
        </Card>
      </div>
    )
  }

  render () {
    const { props } = this
    const { emarsys, location, staticText } = props

    if (!emarsys.size) {
      return (
        <div className="my-account-settings__sherpa">
          <Sherpa type={TYPE_LARGE} />
        </div>
      )
    }
    return (
      <React.Fragment>
        <div className="my-account__grid">
          <VerticalNavigation location={location} navType={ACCOUNT} />
          <TestarossaSwitch>
            <TestarossaCase campaign="ME-3043" variation={1} >
              <MyAccountSettingsV2 />
            </TestarossaCase>
            <TestarossaDefault unwrap>
              {() => (
                <div className="my-account my-account__content-box">
                  <div className="my-account-settings__card-title">
                    <H2>{staticText.getIn(['data', 'notificationsTitle'])}</H2>
                  </div>
                  {this.renderEmailSettings()}
                  <div className="my-account-settings__card-title">
                    <H2>{staticText.getIn(['data', 'languageTitle'])}</H2>
                  </div>
                  {this.renderLanguageSettings()}
                </div>
              )}
            </TestarossaDefault>
          </TestarossaSwitch>
        </div>
        <div className="my-account-settings__support-container">
          <Support />
        </div>
      </React.Fragment>
    )
  }
}

MyAccountSettings.propTypes = {
  uid: PropTypes.number.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  emarsys: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  languages: ImmutablePropTypes.list.isRequired,
  setUserDataLanguage: PropTypes.func.isRequired,
  userLanguages: ImmutablePropTypes.list.isRequired,
  featureTrackingLanguages: ImmutablePropTypes.list.isRequired,
}

export default connectRedux(
  state => ({
    auth: state.auth,
    uid: state.user.getIn(['data', 'uid'], 0),
    languages: state.languages.get('data', List()),
    emarsys: state.user.getIn(['data', 'emarsys'], Map()),
    userLanguages: state.user.getIn(['data', 'language'], List()),
    staticText: state.staticText.getIn(['data', 'myAccountSettings'], Map()),
    featureTrackingLanguages: state.featureTracking.getIn(['data', 'userLanguages'], List()),
    disableAutoPlayNext: state.featureTracking.getIn(['data', 'disableAutoPlayNext'], false),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      getUserContactData: actions.user.getUserContactData,
      setUserDataLanguage: actions.user.setUserDataLanguage,
      doEmailSignup: actions.emailSignup.doEmailSignupBrooklyn,
      setFeatureTrackingDataPersistent: actions.featureTracking.setFeatureTrackingDataPersistent,
    }
  },
)(MyAccountSettings)
