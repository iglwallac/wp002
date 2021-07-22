import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Map } from 'immutable'
import compose from 'recompose/compose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import EmailCapture from 'components/EmailCapture'
import { connect as connectStaticText } from 'components/StaticText/connect'

const dataLayer = global.dataLayer

function renderEmailCapture (props, testClass) {
  const { emailSignup, doEmailSignup, staticText, siteSegment } = props
  const submitFooterEmailDataLayer = true
  const footerSignupEvent = () => {
    if (typeof dataLayer.push === 'function') {
      dataLayer.push({
        event: 'customEvent',
        eventCategory: 'User Engagement',
        eventAction: 'Call to Action',
        eventLabel: 'Email Signup - Footer',
      })
    }
  }

  return (
    <EmailCapture
      buttonText={staticText.getIn(['data', 'formButtonText'])}
      inputPlaceholder={staticText.getIn(['data', 'formPlaceHolder'])}
      className={['footer-email-capture__email-capture', testClass]}
      submitFooterEmailDataLayer={submitFooterEmailDataLayer}
      signupEvent={footerSignupEvent}
      success={emailSignup.get('success')}
      formName="footerEmailCapture"
      onFormSubmit={doEmailSignup}
      siteSegment={siteSegment}
    />
  )
}

class FooterEmailCapture extends PureComponent {
  render () {
    const { props } = this
    const { staticText, isAnonymous } = props
    if (isAnonymous) {
      return (
        <div className="footer-email-capture">
          <div className="footer-email-capture__content">
            <div className="footer-email-capture__intro-text">
              { staticText.getIn(['data', 'title']) }
            </div>
            { renderEmailCapture(props) }
          </div>
        </div>
      )
    }
    return null
  }
}

FooterEmailCapture.propTypes = {
  doEmailSignup: PropTypes.func.isRequired,
  emailSignup: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  siteSegment: ImmutablePropTypes.map.isRequired,
}

FooterEmailCapture.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connect(
    state => ({
      emailSignup: state.emailSignup,
      isAnonymous: !state.auth.get('jwt'),
      siteSegment: state.detail.getIn(['data', 'siteSegment'], Map()),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return { doEmailSignup: actions.emailSignup.doEmailSignup }
    },
  ),
  connectStaticText({ storeKey: 'footerEmailCapture' }),
)(FooterEmailCapture)
