import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { truncate } from 'theme/web-app'
import { isYoga, isMyYoga } from 'services/url'
import HeroImage from 'components/HeroImage'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import { H1 } from 'components/Heading'

function getClassName (hasAuth) {
  const className = ['jumbotron-category']

  if (!hasAuth) {
    className.push('jumbotron-category__show-cta')
  }

  return className.join(' ')
}

function JumbotronCategory (props) {
  const { auth, location, staticText, heroImage, title, description } = props
  const hasAuth = auth.get('jwt', false)
  const pathname = location.pathname
  const signupText =
    isMyYoga(pathname) || isYoga(pathname)
      ? staticText.get('signUpToStartPracticing')
      : staticText.get('signUpToStartWatching')
  return (
    <div className={getClassName(hasAuth)}>
      <HeroImage
        className={['jumbtron-category__background-hero']}
        hasOverlay={false}
        smallUrl={heroImage.get('700x300')}
        mediumSmallUrl={heroImage.get('700x300')}
        mediumUrl={heroImage.get('1070x300')}
        largeUrl={heroImage.get('1440x300')}
      />
      <div className="jumbotron-category__wrapper">
        <div className="jumbotron-category__title-wrapper">
          <H1 className="jumbotron-category__title">{title}</H1>
        </div>
        <p className="jumbotron-category__description">
          {truncate(description, 250)}
        </p>
        <div
          style={{ display: 'none' }}
          className="jumbotron-category__read-more"
        >
          {staticText.get('exploreAllVideos')}
        </div>
      </div>
      {!hasAuth ? (
        <div className="jumbotron-category__signup-container">
          <ButtonSignUp
            text={signupText}
            buttonClass={['button--primary', 'jumbotron-category__signup-cta']}
            scrollToTop
            type={BUTTON_SIGN_UP_TYPE_BUTTON}
          />
        </div>
      ) : null}
    </div>
  )
}

JumbotronCategory.propTypes = {
  auth: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  heroImage: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'jumbotronCategory', 'data']),
}))(JumbotronCategory)
