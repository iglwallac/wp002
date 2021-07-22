import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { fromJS } from 'immutable'
import _parseInt from 'lodash/parseInt'
import _assign from 'lodash/assign'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import _partial from 'lodash/partial'
import _debounce from 'lodash/debounce'
import FormsyForm from 'formsy-react'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_INPUT } from 'render'
import Button from 'components/Button'
import { getPasswordValidation, PASSWORD_INPUT_MAX_CHARS } from 'services/password'
import { format as formatDateTime } from 'services/date-time'
import VerticalNavigation, { ACCOUNT } from 'components/VerticalNavigation'
import FormSelect, {
  DAY_OPTIONS,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
} from 'components/FormSelect'
import {
  EmailInput,
  PasswordInput,
  Textarea,
  TextInput,
} from 'components/FormInput.v2'
import { URL_REFER } from 'services/url/constants'
import Support from 'components/Support'
import Sherpa, { TYPE_SMALL_BLUE, TYPE_LARGE } from 'components/Sherpa'
import { TYPE_UPDATE_PROFILE_IMAGE, TYPE_LOGIN } from 'services/dialog'
import { getBoundActions } from 'actions'
import { USERNAME_REGEX } from 'services/user'
import { H2, H5 } from 'components/Heading'
import { Card, STATES, CONTROLS } from 'components/Card'

const updateProfileImageClick = (e, setOverlayDialogVisible) => {
  e.preventDefault()
  setOverlayDialogVisible(TYPE_UPDATE_PROFILE_IMAGE)
}

function getAvatarStyle (image) {
  const style = {}
  if (image) {
    style.backgroundImage = `url(${image})`
  }
  return style
}

const PROFILE_FORM_SCHEMA = {
  formValid: false,
}

class MyAccountProfilePage extends Component {
  constructor (props) {
    super(props)
    this.state = PROFILE_FORM_SCHEMA
  }

  componentDidMount () {
    const {
      auth,
      setOverlayDialogVisible,
      setDialogOptions,
      setOverlayCloseOnClick,
    } = this.props
    const isLoggedIn = !!auth.get('jwt')
    if (!isLoggedIn) {
      setOverlayDialogVisible(TYPE_LOGIN)
      setDialogOptions(null, true)
      setOverlayCloseOnClick(false)
    }
  }

  componentWillReceiveProps (nextProps) {
    const { user } = nextProps
    const nextUpdateUserSuccess = user.getIn(['updateUser', 'success'])
    const previousUpdateUserSuccess = this.props.user.getIn(['updateUser', 'success'])

    if (nextUpdateUserSuccess !== previousUpdateUserSuccess) {
      this.setState(() => (PROFILE_FORM_SCHEMA))
    }
  }

  componentWillUnmount () {
    const { clearUserProfileData } = this.props
    clearUserProfileData()
  }

  onValidSubmit = (model, props, toggleState) => {
    const { state } = this
    const { auth, updateUser } = props
    let birthday = null
    const email = state.email
    const username = state.username
    const bio = state.bio
    const location = state.location
    const day = state.day
    const month = state.month
    const year = state.year
    const firstName = state.firstName
    const lastName = state.lastName
    if (day && month && year) {
      birthday = new Date(`${year}-${month}-${day}`)
    }
    updateUser({ auth, email, username, bio, location, birthday, firstName, lastName })
    toggleState()
  }

  onValidPasswordSubmit = (model, props, toggleState) => {
    const { auth, updateUser } = props
    const password = {
      current: model.password,
      updated: model.newPassword,
    }

    updateUser({ auth, password })
    toggleState()
  }

  onChangeForm = (model) => {
    this.setState(() => ({
      email: model.email,
      username: model.userName,
      firstName: model.firstName,
      lastName: model.lastName,
      bio: model.bio,
      location: model.location,
      day: model.day !== undefined ? model.day : '',
      month: model.month !== undefined ? model.month : '',
      year: model.year !== undefined ? model.year : '',
    }))
  }

  setFormValid = (valid) => {
    /* eslint-disable no-else-return */
    if (valid) {
      this.setState(() => ({ formValid: true }))
      return true
    } else {
      this.setState(() => ({ formValid: false }))
      return false
    }
    /* eslint-enable no-else-return */
  }

  renderPasswordEditMode = (toggleState) => {
    const { props, state } = this
    const { staticText } = props
    const { formValid } = state
    const debounceSetFormValid = _debounce(this.setFormValid, 100)

    return (
      <div className="account-profile__profile-container edit">
        <H5>{staticText.getIn(['data', 'changePassword'])}</H5>
        <FormsyForm
          className="account-profile__form"
          onValidSubmit={_partial(this.onValidPasswordSubmit,
            _partial.placeholder,
            this.props,
            toggleState)}
          onValid={_partial(debounceSetFormValid, true)}
          onInvalid={_partial(debounceSetFormValid, false)}
        >
          <PasswordInput
            name="password"
            label={staticText.getIn(['data', 'currentPassword'])}
            formPasswordLabelClassName={['account-profile__form-label__edit', 'edit-label']}
            maxLength={PASSWORD_INPUT_MAX_CHARS}
            validations={{ minLength: 1 }}
            required
          />
          <PasswordInput
            name="newPassword"
            label={staticText.getIn(['data', 'newPassword'])}
            formPasswordLabelClassName={['account-profile__form-label__edit', 'edit-label']}
            maxLength={PASSWORD_INPUT_MAX_CHARS}
            validations={_assign(
              getPasswordValidation(),
            )}
            validationErrors={{
              minLength: staticText.getIn(['data', 'passwordMinLengthMessage']),
              matchRegexp: staticText.getIn(['data', 'passwordRegexMessage']),
              maxLength: staticText.getIn(['data', 'passwordMaxLengthMessage']),
            }}
            required
            hasValidation
            showProgress
          />
          <PasswordInput
            name="passwordConfirm"
            label={staticText.getIn(['data', 'confirmNewPassword'])}
            formPasswordLabelClassName={['account-profile__form-label__edit', 'edit-label']}
            maxLength={PASSWORD_INPUT_MAX_CHARS}
            validations={_assign(
              { equalsField: 'newPassword' },
              getPasswordValidation(),
            )}
            validationErrors={{
              equalsField: staticText.getIn(['data', 'noMatch']),
            }}
            required
            hasValidation
          />
          <div className="account-profile__buttons">
            <FormButton
              disabled={!formValid}
              formButtonClass={[
                'account-profile__form-button',
                `form-button--${!formValid ? 'disabled' : 'primary'}`,
              ]}
              renderType={RENDER_TYPE_FORM_BUTTON_INPUT}
              type={FORM_BUTTON_TYPE_SUBMIT}
              text={staticText.getIn(['data', 'save'])}
            />
            <Button
              buttonClass={['account-profile__form-button', 'form-button--primary-inverted']}
              text={staticText.getIn(['data', 'cancel'])}
              onClick={toggleState}
            />
          </div>
        </FormsyForm>
      </div>
    )
  }

  renderPasswordViewMode = () => {
    const { props } = this
    const { staticText } = props

    return (
      <div className="account-profile__profile-container">
        <div className="account-profile__form-container">
          <H5>{staticText.getIn(['data', 'changePassword'])}</H5>
          {staticText.getIn(['data', 'changeYourPassword'])}
        </div>
      </div>
    )
  }

  renderProfileEditMode = (matchingProfile, toggleState) => {
    const {
      staticText,
      setOverlayDialogVisible,
      user,
    } = this.props
    const { formValid } = this.state
    const avatarImage = user.getIn(['data', 'profile', 'picture', 'hdtv_190x266'])
    const birthday = matchingProfile.get('birthday', '')
    const formattedBirthday = birthday ? formatDateTime(birthday, null, 'D/M/YYYY') : ''
    const splitBirthday = formattedBirthday.split('/')
    const day = splitBirthday[0]
    const month = splitBirthday[1]
    const year = splitBirthday[2]
    const processing = user.get('updateUserProcessing')
    const userMail = user.getIn(['data', 'mail'], '')
    const userName = user.getIn(['data', 'name'], '')
    const userEmail = user.getIn(['data', 'email'], '')
    const userUsername = user.getIn(['data', 'username'], '')
    const email = userEmail ?
      userEmail : userMail // eslint-disable-line no-unneeded-ternary
    const username = userUsername ?
      userUsername : userName // eslint-disable-line no-unneeded-ternary
    const bio = user.getIn(['data', 'profile', 'bio'], '')
    const firstName = matchingProfile.get('first_name', '')
    const lastName = matchingProfile.get('last_name', '')
    const profileLocation = user.getIn(['data', 'profile', 'location'], '')
    const debounceOnChangeForm = _debounce(this.onChangeForm, 100)
    const debounceSetFormValid = _debounce(this.setFormValid, 100)
    const statusCode = user.getIn(['updateUser', 'statusCode'])

    return (
      <div className="account-profile__profile-container edit">
        <div className="account-profile__avatar-container">
          <div className="account-profile__avatar-outline">
            <H5>{staticText.getIn(['data', 'profilePhoto'])}</H5>
            <div className="account-profile__avatar-placement">
              <div className="account-profile__avatar-cell">
                <div className="account-profile__avatar" style={getAvatarStyle(avatarImage)} />
              </div>
              <div className="account-profile__avatar-btn-cell">
                <Button
                  buttonClass={[
                    'form-button--secondary',
                    'account-profile__upload-avatar',
                  ]}
                  onClick={e => updateProfileImageClick(e, setOverlayDialogVisible)}
                  text={staticText.getIn(['data', 'upload'])}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="account-profile__sep" />
        <div className="account-profile__form-container">
          {
            processing ?
              <div className="account-profile__processing">
                <Sherpa className={['account-profile__sherpa']} type={TYPE_SMALL_BLUE} />
                <div className="account-profile__processing-text">
                  {`${staticText.getIn(['data', 'saving'])}...`}
                </div>
              </div>
              : null
          }
          {
            statusCode > 299 ?
              <div className="account-profile__error">
                {staticText.getIn(['data', 'genericError'])}
              </div> : null
          }
          <FormsyForm
            className="account-profile__form"
            onValidSubmit={_partial(this.onValidSubmit,
              _partial.placeholder,
              this.props, toggleState)}
            onValid={_partial(debounceSetFormValid, true)}
            onInvalid={_partial(debounceSetFormValid, false)}
            onChange={_partial(debounceOnChangeForm)}
          >
            <div className="account-profile__label-container">
              <H5>{staticText.getIn(['data', 'personalInformation'])}</H5>
            </div>
            <div className="account-profile__input-container">
              <TextInput
                name="userName"
                label={staticText.getIn(['data', 'userName'])}
                labelClassName={['account-profile__form-label__edit', 'edit-label']}
                value={username}
                required
                validations={{
                  matchRegexp: USERNAME_REGEX,
                }}
                validationErrors={{
                  matchRegexp: staticText.getIn(['data', 'usernameValidError']),
                }}
              />
            </div>
            <div className="account-profile__input-container">
              <TextInput
                name="firstName"
                label={staticText.getIn(['data', 'firstName'])}
                labelClassName={['account-profile__form-label__edit', 'edit-label']}
                value={firstName}
                required
                validations={{
                  maxLength: 255,
                }}
                validationErrors={{
                  matchRegexp: staticText.getIn(['data', 'usernameValidError']),
                }}
              />
            </div>
            <div className="account-profile__input-container">
              <TextInput
                name="lastName"
                label={staticText.getIn(['data', 'lastName'])}
                labelClassName={['account-profile__form-label__edit', 'edit-label']}
                value={lastName}
                required
                validations={{
                  maxLength: 255,
                }}
                validationErrors={{
                  matchRegexp: staticText.getIn(['data', 'usernameValidError']),
                }}
              />
            </div>
            <div className="account-profile__input-container">
              <EmailInput
                name="email"
                label={staticText.getIn(['data', 'email'])}
                labelClassName={['account-profile__form-label__edit', 'edit-label']}
                value={email}
                required
                validations={{ isEmail: true }}
                validationErrors={{
                  isEmail: staticText.getIn(['data', 'emailValidError']),
                }}
              />
            </div>
            <div className="account-profile__input-container">
              <TextInput
                name="location"
                label={staticText.getIn(['data', 'location'])}
                labelClassName={['account-profile__form-label', 'edit-label']}
                value={profileLocation}
                validations={{
                  maxLength: 255,
                }}
                validationErrors={{
                  maxLength: staticText.getIn(['data', 'locationMaxLength']),
                }}
              />
            </div>
            <div className="account-profile__sep" />
            <div className="account-profile__label-container">
              <H5>{staticText.getIn(['data', 'birthday'])}</H5>
            </div>
            <div className="form-input account-profile__form-birthday">
              <FormSelect
                name="month"
                wrapperClassName={[['account-profile__form-birthday-select-month']]}
                label={staticText.getIn(['data', 'month'])}
                className={['account-profile__form-birthday-select']}
                labelClassName={['account-profile__form-label', 'edit-label']}
                options={MONTH_OPTIONS}
                placeholder={month}
                defaultOption={fromJS({ label: month, value: month })}
              />
              <FormSelect
                name="day"
                wrapperClassName={[['account-profile__form-birthday-select-day']]}
                label={staticText.getIn(['data', 'day'])}
                className={['account-profile__form-birthday-select']}
                labelClassName={['account-profile__form-label', 'edit-label']}
                options={DAY_OPTIONS}
                placeholder={day}
                defaultOption={fromJS({ label: day, value: day })}
              />
              <FormSelect
                name="year"
                label={staticText.getIn(['data', 'year'])}
                wrapperClassName={[['account-profile__form-birthday-select-year']]}
                className={['account-profile__form-birthday-select']}
                labelClassName={['account-profile__form-label', 'edit-label']}
                options={YEAR_OPTIONS}
                placeholder={year}
                defaultOption={fromJS({ label: year, value: year })}
              />
            </div>
            <div className="account-profile__sep" />
            <div className="account-profile__label-container">
              <H5>{staticText.getIn(['data', 'additionalInformation'])}</H5>
            </div>
            <Textarea
              name="bio"
              className="account-profile__form-text-area"
              label={staticText.getIn(['data', 'bio'])}
              labelClassName={['account-profile__form-label', 'edit-label']}
              value={bio}
              validations={{
                maxLength: 255,
              }}
              validationErrors={{
                maxLength: staticText.getIn(['data', 'bioMaxLength']),
              }}
            />
            <div className="account-profile__sep" />
            <div className="account-profile__buttons">
              <FormButton
                disabled={!formValid}
                formButtonClass={[
                  `form-button--${!formValid ? 'disabled' : 'primary'}`,
                  'account-profile__form-button',
                ]}
                renderType={RENDER_TYPE_FORM_BUTTON_INPUT}
                type={FORM_BUTTON_TYPE_SUBMIT}
                text={staticText.getIn(['data', 'save'])}
              />
              <Button
                buttonClass={['account-profile__form-button', 'form-button__primary-inverted']}
                text={staticText.getIn(['data', 'cancel'])}
                onClick={toggleState}
              />
            </div>
          </FormsyForm>
        </div>
      </div>
    )
  }

  renderProfileViewMode = (matchingProfile) => {
    const { staticText, user } = this.props
    const avatarImage = user.getIn(['data', 'profile', 'picture', 'hdtv_190x266'])
    const processing = user.get('updateUserProcessing')
    const userMail = user.getIn(['data', 'mail'], '')
    const userId = user.getIn(['data', 'uid'])
    const userName = user.getIn(['data', 'name'], '')
    const userEmail = user.getIn(['data', 'email'], '')
    const userUsername = user.getIn(['data', 'username'], '')
    const email = userEmail || userMail
    const username = userUsername || userName
    const bio = user.getIn(['data', 'profile', 'bio'], '')
    const birthday = matchingProfile.get('birthday', '')
    const formattedBirthday = birthday ? formatDateTime(birthday) : ''
    const name = `${matchingProfile.get('first_name', '')} ${matchingProfile.get('last_name', '')}`
    const profileLocation = user.getIn(['data', 'profile', 'location'], '')
    const statusCode = user.getIn(['updateUser', 'statusCode'])

    return (
      <div className="account-profile__profile-container">
        <div className="account-profile__avatar-container">
          <div className="account-profile__avatar-outline">
            <div className="account-profile__avatar" style={getAvatarStyle(avatarImage)} />
          </div>
        </div>
        <div className="account-profile__form-container">
          {
            processing ?
              <div className="account-profile__processing">
                <Sherpa className={['account-profile__sherpa']} type={TYPE_SMALL_BLUE} />
                <div className="account-profile__processing-text">
                  {`${staticText.getIn(['data', 'saving'])}...`}
                </div>
              </div>
              : null
          }
          {
            statusCode > 299 ?
              <div className="account-profile__error">
                {staticText.getIn(['data', 'genericError'])}
              </div> : null
          }
          <div className="account-profile__user-container">
            <div className="account-profile__form-bio">
              <H5>{staticText.getIn(['data', 'userId'])}</H5>
              <span className="account-profile__view-info">
                {userId}
              </span>
            </div>
            <div className="account-profile__form-bio">
              <H5>{staticText.getIn(['data', 'userName'])}</H5>
              <span className="account-profile__view-info">
                {username}
              </span>
            </div>
          </div>
          <div className="account-profile__user-container">
            <div className="account-profile__form-bio">
              <H5>{staticText.getIn(['data', 'name'])}</H5>
              <span className="account-profile__view-info">
                {name}
              </span>
            </div>
            <div className="account-profile__form-bio">
              <H5>{staticText.getIn(['data', 'email'])}</H5>
              <span className="account-profile__view-info">
                {email}
              </span>
            </div>
            <div className="account-profile__form-bio">
              <H5>{staticText.getIn(['data', 'location'])}</H5>
              <span className="account-profile__view-info">
                {profileLocation}
              </span>
            </div>
            <div className="account-profile__form-bio">
              <H5>{staticText.getIn(['data', 'birthday'])}</H5>
              <span className="account-profile__view-info">
                {formattedBirthday}
              </span>
            </div>
          </div>
          <div className="account-profile__form-bio">
            <H5>{staticText.getIn(['data', 'bio'])}</H5>
            <span className="account-profile__view-info">
              {bio}
            </span>
          </div>
        </div>
      </div>
    )
  }

  renderReferral = () => {
    const { props } = this
    const { staticText } = props

    return (
      <div className="account-profile__referral-container">
        <div className="account-profile__form-container">
          <H5>{staticText.getIn(['data', 'inviteAFriend'])}</H5>
          <p>
            {staticText.getIn(['data', 'sendALink'])}
          </p>
          <div className="account-profile__refer-btn-container">
            <Button
              scrollToTop
              buttonClass={['account-profile__refer-button']}
              text={staticText.getIn(['data', 'invite'])}
              url={URL_REFER}
            />
            <div className="account-profile__icon-right" />
          </div>
        </div>
      </div>
    )
  }

  render () {
    const { location, staticText, user, userProfiles, bootstrapComplete } = this.props
    const userData = user.get('data')
    const userProfileData = userProfiles.get('data')
    if (!bootstrapComplete || !userData || !userProfileData) {
      return (
        <React.Fragment>
          <div className="my-account-settings__sherpa">
            <Sherpa type={TYPE_LARGE} />
          </div>
        </React.Fragment>
        // null
      )
    }
    const matchingProfile = userProfiles.get('data').find(profile => _parseInt(profile.get('uid')) === user.getIn(['data', 'uid']))

    return (
      <React.Fragment>
        <div className="my-account__grid">
          <VerticalNavigation location={location} navType={ACCOUNT} />
          <div className="my-account my-account__content-box">
            <div className="account-profile__title">
              <H2>{staticText.getIn(['data', 'title'])}</H2>
            </div>
            <Card
              editable
              editControl={CONTROLS.UPDATE}
            >
              {(editState, toggleState) => (
                editState === STATES.EDITING
                  ? this.renderProfileEditMode(matchingProfile, toggleState)
                  : this.renderProfileViewMode(matchingProfile)
              )}
            </Card>
            <div className="account-profile__title">
              <H2>{staticText.getIn(['data', 'password'])}</H2>
            </div>
            <Card
              editable
              editControl={CONTROLS.CHANGE}
            >
              {(editState, toggleState) => (
                editState === STATES.EDITING
                  ? this.renderPasswordEditMode(toggleState)
                  : this.renderPasswordViewMode()
              )}
            </Card>
            <div className="account-profile__title">
              <H2>{staticText.getIn(['data', 'community'])}</H2>
            </div>
            <div className="account-profile no-shadow">
              {this.renderReferral()}
            </div>
          </div>
        </div>
        <div className="account-profile__support-container">
          <Support />
        </div>
      </React.Fragment>
    )
  }
}

MyAccountProfilePage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired,
  clearUserProfileData: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'myAccountProfilePage' }),
  connectRedux(
    state => ({
      bootstrapComplete: state.app.get('bootstrapComplete'),
      user: state.user,
      auth: state.auth,
      userProfiles: state.userProfiles,
      page: state.page,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        clearUserProfileData: actions.user.clearUserProfileData,
        updateUser: actions.user.updateUser,
        setDialogOptions: actions.dialog.setDialogOptions,
        setOverlayCloseOnClick: actions.dialog.setOverlayCloseOnClick,
      }
    },
  ),
)(MyAccountProfilePage)
