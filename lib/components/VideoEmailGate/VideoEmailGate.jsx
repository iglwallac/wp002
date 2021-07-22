
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import EmailCapture from 'components/EmailCapture'
import Icon from 'components/Icon'
import Button from 'components/Button'
import { H1, H2, H6, HEADING_TYPES } from 'components/Heading'
import Sherpa, { TYPE_SMALL } from 'components/Sherpa'
import { FORM_NAME_PREVIEW_GATE } from 'services/form'
import { TYPE_LOGIN } from 'services/dialog'

class VideoEmailGate extends PureComponent {
  componentDidMount () {
    if (global.dataLayer) {
      global.dataLayer.push({
        event: 'customEvent',
        eventCategory: 'pop-up',
        eventAction: 'gate displayed',
        eventLabel: 'preview gate',
      })
    }
  }

  componentWillUnmount () {
    const { emailSignup, setEmailSignupPreviewGateVisible } = this.props
    const emailSignupCompleted = emailSignup.get('completed')
    const previewGateVisible = emailSignup.get('previewGateVisible')

    if (emailSignupCompleted && global.dataLayer) {
      global.dataLayer.push({
        event: 'customEvent',
        eventCategory: 'email collection',
        eventAction: 'email submitted',
        eventLabel: 'preview gate',
      })
    }

    if (previewGateVisible) {
      setEmailSignupPreviewGateVisible(false)
    }
  }

  onClickClose = () => {
    const { history, emailSignup, video, setEmailSignupPreviewGateVisible } = this.props
    const emailSignupCompleted = emailSignup.get('completed')
    const basePath = video.get('path')
    // if email signup is complete,
    // stay on the video page, remove the preview gate and play the preview
    if (emailSignupCompleted) {
      return setEmailSignupPreviewGateVisible(false)
    }

    if (global.dataLayer) {
      global.dataLayer.push({
        event: 'customEvent',
        eventCategory: 'pop-up',
        eventAction: 'gate closed',
        eventLabel: 'preview gate',
      })
    }
    // go to the detail page
    return history.push(basePath)
  }

  onClickLoginButton = () => {
    const { setOverlayDialogVisible } = this.props

    setOverlayDialogVisible(TYPE_LOGIN)

    if (global.dataLayer) {
      global.dataLayer.push({
        event: 'customEvent',
        eventCategory: 'pop-up',
        eventAction: 'login',
        eventLabel: 'preview gate',
      })
    }
  }

  getBackgroundImage = (img) => {
    const style = {
      backgroundImage: `url(${img})`,
    }
    return style
  }

  render () {
    const { props } = this
    const {
      video,
      staticText,
      emailSignup,
      doEmailSignup,
    } = props
    const siteSegment = video.getIn(['data', 'siteSegment'], Map())
    const image = video.getIn(['data', 'poster'])
    const processing = emailSignup.get('processing')
    const success = emailSignup.get('success')

    return (
      <div className="video-email-gate" style={this.getBackgroundImage(image)}>
        <div className="video-email-gate__overlay" />
        <Icon
          onClick={this.onClickClose}
          iconClass={['icon--close', 'video-email-gate__close']}
        />
        <div className="video-email-gate__content">
          {
            !success ?
              <div className="video-email-gate__title-wrapper">
                <div className="video-email-gate__border" />
                <H1 inverted className="video-email-gate__title">{staticText.getIn(['data', 'title'])}</H1>
                <H2 inverted className="video-email-gate__subtitle">{staticText.getIn(['data', 'enterEmailToUnlock'])}</H2>
              </div>
              : null
          }
          {
            processing ?
              <div className="video-email-gate__sherpa">
                <Sherpa type={TYPE_SMALL} />
              </div>
              :
              <React.Fragment>
                <EmailCapture
                  className={['video-email-gate__email-capture']}
                  buttonText={staticText.getIn(['data', 'unlockVideo'])}
                  inputPlaceholder={staticText.getIn(['data', 'emailAddress'])}
                  formName={FORM_NAME_PREVIEW_GATE}
                  success={emailSignup.get('success')}
                  successText={staticText.getIn(['data', 'thanks'])}
                  siteSegment={siteSegment}
                  onFormSubmit={doEmailSignup}
                />
                {
                  !success ?
                    <div className="video-email-gate__login">
                      <H6 as={HEADING_TYPES.H5} className="video-email-gate__login-text">{staticText.getIn(['data', 'alreadyAMember'])}</H6>
                      <Button
                        text={staticText.getIn(['data', 'login'])}
                        buttonClass={['button--primary', 'video-email-gate__login-btn']}
                        onClick={this.onClickLoginButton}
                      />
                    </div>
                    : null
                }
              </React.Fragment>
          }
        </div>
      </div>
    )
  }
}

VideoEmailGate.propTypes = {
  history: PropTypes.object.isRequired,
  video: ImmutablePropTypes.map.isRequired,
  emailSignup: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  doEmailSignup: PropTypes.func.isRequired,
  setEmailSignupPreviewGateVisible: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      video: state.video,
      emailSignup: state.emailSignup,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        doEmailSignup: actions.emailSignup.doEmailSignup,
        setEmailSignupPreviewGateVisible: actions.emailSignup.setEmailSignupPreviewGateVisible,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      }
    },
  ),
  connectStaticText({ storeKey: 'videoEmailGate' }),
)(VideoEmailGate)
