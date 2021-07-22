import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { H2, HEADING_TYPES } from 'components/Heading'
import EmailCapture from 'components/EmailCapture'

function DiscoverGaia (props) {
  const { siteSegment, staticText, emailSignupSuccess, doEmailSignup, formName } = props
  return (
    <div className="discover-gaia">
      <div className="discover-gaia__wrapper">
        <div className="discover-gaia__info">
          <H2 as={HEADING_TYPES.H4}>
            {staticText.getIn(['data', 'discoverWhatGaiaHasToOffer'])}
          </H2>
          <div className="discover-gaia__description">
            {staticText.getIn(['data', 'getInstantAccess'])}
          </div>
        </div>
        <div className="discover-gaia__email-capture-wrapper">
          <EmailCapture
            className={['discover-gaia__email-capture']}
            inputPlaceholder={staticText.getIn(['data', 'emailPlaceholder'])}
            onFormSubmit={doEmailSignup}
            formName={formName}
            siteSegment={siteSegment}
            buttonText={staticText.getIn(['data', 'signMeUp'])}
            success={emailSignupSuccess}
            inverted={false}
            name="discoverEmailSignup"
          />
        </div>
      </div>
    </div>
  )
}

DiscoverGaia.propTypes = {
  siteSegment: ImmutablePropTypes.map,
  staticText: ImmutablePropTypes.map.isRequired,
  emailSignupSuccess: PropTypes.bool,
  doEmailSignup: PropTypes.func.isRequired,
  formName: PropTypes.string.isRequired,
}

DiscoverGaia.defaultProps = {
  siteSegment: Map(),
}

export default compose(
  connectRedux(({
    emailSignup,
  }) => ({
    emailSignupSuccess: emailSignup.get('success'),
  }), (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      doEmailSignup: actions.emailSignup.doEmailSignup,
    }
  }),
  connectStaticText({ storeKey: 'discoverGaia' }),
)(DiscoverGaia)
