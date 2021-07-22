import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import ButtonAdmin, {
  BUTTON_ADMIN_ALIGN_RIGHT_BOTTOM,
} from 'components/ButtonAdmin'
import HeroImage from 'components/HeroImage'

function getClassName (hasAuth) {
  const className = ['jumbotron-series']

  if (!hasAuth) {
    className.push('jumbotron-series__show-cta')
  }

  return className.join(' ')
}

function JumbotronSeries (props) {
  const { id, auth, heroImage, type, staticText } = props
  const hasAuth = auth.get('jwt', false)
  return (
    <div className={getClassName(hasAuth)}>
      <div className="jumbotron-series__wrapper">
        <HeroImage
          className={['jumbotron-series__background-hero']}
          hasOverlay={false}
          smallUrl={heroImage.get('small')}
          mediumSmallUrl={heroImage.get('mediumSmall')}
          mediumUrl={heroImage.get('medium')}
          largeUrl={heroImage.get('large')}
        />
      </div>
      { !hasAuth &&
        <div className="jumbotron-series__signup-container">
          <ButtonSignUp
            text={staticText.get('signUpToStartWatching')}
            buttonClass={['button--primary', 'jumbotron-series__signup-cta']}
            type={BUTTON_SIGN_UP_TYPE_BUTTON}
            scrollToTop
          />
        </div>
      }
      <ButtonAdmin
        id={id}
        auth={auth}
        align={BUTTON_ADMIN_ALIGN_RIGHT_BOTTOM}
        type={type}
      />
    </div>
  )
}

JumbotronSeries.propTypes = {
  id: PropTypes.number,
  auth: PropTypes.object.isRequired,
  heroImage: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'jumbotronSeries', 'data']),
  feature: state.detail.getIn(['data', 'feature']),
  contentPolicyPolicyId: state.detail.getIn(['data', 'contentPolicyPolicyId']),
}))(JumbotronSeries)
