import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { fromJS } from 'immutable'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import _partial from 'lodash/partial'
import _debounce from 'lodash/debounce'
import _get from 'lodash/get'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import countryOptionsData from 'services/country/country-options-en.json'
import FormsyForm from 'formsy-react'
import FormInput, { FORM_INPUT_TYPE_TEXT } from 'components/FormInput'
import FormButton from 'components/FormButton'
import FormSelect from 'components/FormSelect'
import Button from 'components/Button'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_INPUT } from 'render'
import { H1, HEADING_TYPES } from 'components/Heading'

const COUNTRY_OPTIONS = fromJS(countryOptionsData)
const STATE_OPTIONS = fromJS([
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AS', label: 'American Samoa' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District Of Columbia' },
  { value: 'FM', label: 'Federated States Of Micronesia' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'GU', label: 'Guam' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MH', label: 'Marshall Islands' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'MP', label: 'Northern Mariana Islands' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PW', label: 'Palau' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VI', label: 'Virgin Islands' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
])

class ChangePlanTestAddressPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      formValid: false,
      submitted: false,
    }
  }

  componentDidMount () {
    const { history, auth } = this.props
    if (!auth.get('jwt')) {
      history.push('/')
    }
  }

  onValidSubmit = (model, props) => {
    /* eslint-disable camelcase */
    const { auth, updateUser } = props
    const firstName = model.firstName
    const lastName = model.lastName
    const street_1 = model.street1
    const street_2 = model.street2
    const city = model.city
    const state_iso = model.stateIso
    const country_iso = model.countryIso
    const postal_code = model.postalCode
    const shippingAddress = {
      street_1,
      street_2,
      city,
      state_iso,
      country_iso,
      postal_code,
    }
    /* eslint-enable camelcase */
    updateUser({ auth, shippingAddress, firstName, lastName }).then((data) => {
      if (_get(data, 'success')) {
        this.setState(() => ({ submitted: true }))
      }
    })
  }

  setFormValid = (valid) => {
    if (valid) {
      this.setState(() => ({ formValid: true }))
      return true
    }
    return false
  }

  render () {
    const props = this.props
    const state = this.state
    const { auth, user } = props
    const { formValid, submitted } = state
    const debounceSetFormValid = _debounce(this.setFormValid, 100)
    const statusCode = user.getIn(['updateUser', 'statusCode'])
    const processing = user.get('updateUserProcessing')

    if (!auth.get('jwt')) {
      return null
    }
    /* eslint-disable max-len */
    return (
      <div className="change-plan-test-address">
        {
          !submitted ?
            <div className="change-plan-test-address__header">
              <H1 as={HEADING_TYPES.H4}>Shipping Address</H1>
              <p className="change-plan-test-address__description">Thank you for upgrading! Please provide us with the address you would like your Roku shipped to. You should receive your package within 14 business days. An email with the tracking number will be sent to you when it ships.</p>
            </div>
            : <div className="change-plan-test-address__thank-you">
              <H1 as={HEADING_TYPES.H4}>Thank you!</H1>
              <p className="change-plan-test-address__description">You are all set and we can’t wait for you to start enjoying Gaia on your big screen. Don’t forget to download the Gaia app when you set up your new Roku Streaming Stick Plus.</p>
              <Button
                buttonClass={['button--secondary', 'button--stacked', 'change-plan-test-address__button']}
                text={'Gaia Home'}
                url={'/'}
              />
            </div>
        }
        <div className="change-plan-test-address__content-wrapper">
          {
            statusCode > 299 ?
              <div className="change-plan-test-address__error">
                There was a problem saving your address. Please try again.
              </div> : null
          }
          {
            processing ?
              <div className="change-plan-test-address__processing">
                <Sherpa className={['change-plan-test-address__sherpa']} type={TYPE_SMALL_BLUE} />
                <div className="change-plan-test-address__processing-text">
                  Saving address...
                </div>
              </div>
              : null
          }
          {
            !submitted ?
              <FormsyForm
                className="change-plan-test-address__form"
                onValid={_partial(debounceSetFormValid, true)}
                onInvalid={_partial(debounceSetFormValid, false)}
                onValidSubmit={_partial(this.onValidSubmit, _partial.placeholder, props)}
              >
                <FormInput
                  name="firstName"
                  label="First Name"
                  type={FORM_INPUT_TYPE_TEXT}
                  validations={{ isAlpha: true }}
                  required
                />
                <FormInput
                  name="lastName"
                  label="Last Name"
                  type={FORM_INPUT_TYPE_TEXT}
                  validations={{ isAlpha: true }}
                  required
                />
                <FormInput
                  name="street1"
                  label="Address 1"
                  type={FORM_INPUT_TYPE_TEXT}
                  validations={{ isExisty: true }}
                  required
                />
                <FormInput
                  name="street2"
                  label="Address 2"
                  type={FORM_INPUT_TYPE_TEXT}
                />
                <FormInput
                  name="city"
                  label="City"
                  type={FORM_INPUT_TYPE_TEXT}
                  validations={{ isAlpha: true }}
                  required
                />
                <FormSelect
                  className="change-plan-test-address__form-select"
                  name="stateIso"
                  options={STATE_OPTIONS}
                  placeholder={'Choose State'}
                  label="State"
                  required
                />
                <FormSelect
                  className="change-plan-test-address__form-select"
                  name="countryIso"
                  options={COUNTRY_OPTIONS}
                  placeholder={'Choose Country'}
                  label="Country"
                  required
                />
                <FormInput
                  name="postalCode"
                  label="Zip Code"
                  type={FORM_INPUT_TYPE_TEXT}
                  validations={{ isNumeric: true }}
                  required
                />
                <div className="change-plan-test-address__buttons">
                  <FormButton
                    formButtonClass={[
                      'form-button--secondary',
                      'change-plan-test-address__next-button',
                    ]}
                    renderType={RENDER_TYPE_FORM_BUTTON_INPUT}
                    type={FORM_BUTTON_TYPE_SUBMIT}
                    text="Save Address"
                    disabled={!formValid}
                  />
                </div>
              </FormsyForm>
              : null
          }
        </div>
      </div>
    )
    /* eslint-enable max-len */
  }
}

ChangePlanTestAddressPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  updateUser: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      user: state.user,
      auth: state.auth,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        updateUser: actions.user.updateUser,
      }
    },
  ),
)(ChangePlanTestAddressPage)
