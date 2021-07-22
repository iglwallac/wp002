import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import { VelocityTransitionGroup } from 'velocity-react'
import _partial from 'lodash/partial'
import _isString from 'lodash/isString'
import { getBoundActions } from 'actions'
import EmailCapture from 'components/EmailCapture'
import Link, { TARGET_BLANK } from 'components/Link'
import Icon from 'components/Icon'
import { get as getConfig } from 'config'
import { connect as connectStaticText } from 'components/StaticText/connect'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_LINK } from 'components/ButtonSignUp'

function renderEmailCapture (props, onClose, showEmailCapture) {
  const { video, staticText, emailSignup, doEmailSignup } = props
  const siteSegment = video.getIn(['data', 'siteSegment'], Map())
  const introtext = staticText.getIn(['data', 'introText'])
  const enterAnimation = {
    animation: 'slideDown',
    duration: 300,
  }
  const leaveAnimation = {
    animation: 'slideUp',
    duration: 300,
  }
  const pathIsGive = _isString(video.get('path'))
    ? video.get('path').slice(0, 5) === '/give'
    : false
  const formName = pathIsGive ? 'shareView' : 'PREVIEW_POPUP'
  return (
    <VelocityTransitionGroup
      enter={enterAnimation}
      leave={leaveAnimation}
      runOnMount
    >
      {showEmailCapture ? (
        <div className="video-email-capture__email-capture-wrapper">
          <Icon
            iconClass={[
              'icon--close',
              'icon--white',
              'video-email-capture__close',
            ]}
            onClick={onClose}
          />
          <div className="video-email-capture__email-capture-input-wrapper">
            <div className="video-email-capture__email-capture-input-inner-wrapper">
              <div className="video-email-capture__email-capture-introtext">
                {introtext}
              </div>
              <EmailCapture
                buttonText={staticText.getIn(['data', 'submit'])}
                inputPlaceholder={staticText.getIn(['data', 'yourEmail'])}
                formName={formName}
                success={emailSignup.get('success')}
                siteSegment={siteSegment}
                onFormSubmit={doEmailSignup}
              />
              <div className="video-email-capture__footer">
                <Link
                  to={getConfig().origin}
                  className="video-email-capture__footer-link"
                  target={TARGET_BLANK}
                >
                  {staticText.getIn(['data', 'exploreGaia'])}
                </Link>
                <ButtonSignUp
                  type={BUTTON_SIGN_UP_TYPE_LINK}
                  text={staticText.getIn(['data', 'signUpNow'])}
                  className="video-email-capture__footer-link"
                  target={TARGET_BLANK}
                  scrollToTop
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </VelocityTransitionGroup>
  )
}

function renderSignUpBanner (
  props,
  showEmailCapture,
  emailSignupSuccess,
  signUpClick,
) {
  const { emailCaptureBannerHeight, staticText } = props
  const bannerStyles = { height: emailCaptureBannerHeight }
  const questionText = staticText.getIn(['data', 'enjoyingVideo'])
  const signUpLinkText = staticText.getIn(['data', 'getMoreFromGaia'])
  if (showEmailCapture || !emailSignupSuccess) {
    return (
      <div className="video-email-capture__banner" style={bannerStyles}>
        <span className="video-email-capture__question-text">
          {`${questionText} `}
        </span>
        <span
          onClick={signUpClick}
          className="video-email-capture__sign-up-link"
        >
          {signUpLinkText}
        </span>
      </div>
    )
  }
  return (
    <div
      className="video-email-capture__banner-placeholder"
      style={bannerStyles}
    />
  )
}
class VideoEmailCapture extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showEmailCapture: false,
    }
  }

  onSignUpClick = () => {
    this.setState(() => ({ showEmailCapture: true }))
  }
  onSignUpCloseClick = () => {
    this.setState(() => ({ showEmailCapture: false }))
  }

  render () {
    const props = this.props
    const state = this.state
    const { emailSignup } = props
    const { showEmailCapture } = state
    const emailSignupSuccess = emailSignup.get('success')
    const onSignUpClickPartial = _partial(this.onSignUpClick)
    const onSignUpCloseClickPartial = _partial(this.onSignUpCloseClick)


    return (
      <div className="video-email-capture">
        {renderSignUpBanner(
          props,
          showEmailCapture,
          emailSignupSuccess,
          onSignUpClickPartial,
        )}
        {renderEmailCapture(props, onSignUpCloseClickPartial, showEmailCapture)}
      </div>
    )
  }
}

VideoEmailCapture.propTypes = {
  emailCaptureBannerHeight: PropTypes.number,
  doEmailSignup: PropTypes.func.isRequired,
  emailSignup: ImmutablePropTypes.map.isRequired,
  video: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({
    storeKey: 'videoEmailCapture',
  }),
  connect(
    state => ({
      emailSignup: state.emailSignup,
      video: state.video,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        doEmailSignup: actions.emailSignup.doEmailSignup,
      }
    },
  ),
)(VideoEmailCapture)
