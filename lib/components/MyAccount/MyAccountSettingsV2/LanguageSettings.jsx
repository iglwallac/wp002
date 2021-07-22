import React, { Component } from 'react'
import { Map, List, fromJS } from 'immutable'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import FormsyForm from 'formsy-react'
import Button from 'components/Button'
import { H4 } from 'components/Heading'
import FormButton from 'components/FormButton'
import { getPrimary } from 'services/languages'
import { Card, STATES } from 'components/Card'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import FormInput, { FORM_INPUT_TYPE_CHECKBOX } from 'components/FormInput'
import { RENDER_TYPE_FORM_BUTTON_INPUT } from 'render'
import FormInputGroup, { FORM_INPUT_GROUP_TYPE_RADIO } from 'components/FormInputGroup'
import Expandable from 'components/Expandable/Expandable'
import {
  buildSiteLanguageSettingsObject,
  SITE_LANGUAGE_SETTINGS_ACTION_SAVE,
  buildContentLanguageSettingsObject,
  CONTENT_LANGUAGE_SETTINGS_ACTION_SAVE,
} from 'services/event-tracking'

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

const getContentLanguagesLabel = (model) => {
  const selectedLangs = []
  const languages = ['de', 'en', 'es', 'fr']
  languages.forEach((lang) => {
    if (model[lang]) selectedLangs.push(lang)
  })
  return selectedLangs
}

class LanguageSettings extends Component {
  //
  constructor (props) {
    super(props)
    this.state = {}
  }

  onPrimaryLanguageSelect = (e) => {
    const { target } = e
    const { value } = target
    this.setState(() => ({
      primaryLanguage: value,
    }))
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
          <H4>{staticText.getIn(['data', 'primarySubhead'])}</H4>
          {selectedPrimaryLang}
        </div>
        <div className="language-select-box__section-left">
          <H4>{staticText.getIn(['data', 'secondarySubhead'])}</H4>
          {secondaryLangDisplays}
        </div>
      </div>
    )
  }

  renderLanguageEditMode (cancelEdit) {
    const { props, state } = this
    const { primaryLanguage: statePrimaryLanguage } = state
    const {
      staticText,
      languages,
      userLanguages,
      featureTrackingLanguages,
      setDefaultGaEvent,
    } = props
    const primaryLanguage = statePrimaryLanguage || userLanguages.get(0, 'en')
    return (
      <FormsyForm
        className="language-select-box__form"
        onSubmit={(model) => {
          this.handleLanguageSubmit(model)
          setDefaultGaEvent(buildSiteLanguageSettingsObject(
            `selected primary language | ${model.primaryLanguage}`,
            SITE_LANGUAGE_SETTINGS_ACTION_SAVE,
          ))
          const contentSiteLanguages = getContentLanguagesLabel(model)
          setDefaultGaEvent(buildContentLanguageSettingsObject(
            `selected secondary language | ${contentSiteLanguages.join(', ')}`,
            CONTENT_LANGUAGE_SETTINGS_ACTION_SAVE,
            contentSiteLanguages.length,
          ))
          cancelEdit()
        }}
      >
        <div className="language-select-box__lang-container-outer">
          <div className="language-select-box__lang-container">
            <H4>{staticText.getIn(['data', 'primarySubhead'])}</H4>
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
            <H4>{staticText.getIn(['data', 'secondarySubhead'])}</H4>
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
    const { staticTextV2 } = props
    return (
      <Expandable
        className="my-account-settings-V2__settings-container"
        variant="setting"
        header={staticTextV2.getIn(['data', 'languageSettings'])}
        description={staticTextV2.getIn(['data', 'languageSettingsDescription'])}
      >
        {this.renderLanguageSettings()}
      </Expandable>
    )
  }
}

export default connectRedux(
  state => ({
    auth: state.auth,
    uid: state.user.getIn(['data', 'uid'], 0),
    languages: state.languages.get('data', List()),
    emarsys: state.user.getIn(['data', 'emarsys'], Map()),
    userLanguages: state.user.getIn(['data', 'language'], List()),
    staticText: state.staticText.getIn(['data', 'myAccountSettings'], Map()),
    staticTextV2: state.staticText.getIn(['data', 'myAccountSettingsV2'], Map()),
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
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
    }
  },
)(LanguageSettings)
