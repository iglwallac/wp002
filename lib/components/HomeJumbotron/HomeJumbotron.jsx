import PropTypes from 'prop-types'
import React from 'react'
import Title from 'components/Title'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import _partial from 'lodash/partial'
import _toString from 'lodash/toString'
import immutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'

function getButtonClassName (baseClassName, userLanguage) {
  return ['button--primary', baseClassName].concat(
    userLanguage ? `${baseClassName}--${_toString(userLanguage)}` : [],
  )
}

function HomeJumbotron (props) {
  const { setHomeScrollTo, staticText, userLanguage } = props

  return (
    <div className="home-jumbotron">
      <div className="home-jumbotron__content">
        <Title className={['home-jumbotron__title']}>
          {staticText.getIn(['data', 'titleStart'])}
          <span className="home-jumbotron__line-break">
            {staticText.getIn(['data', 'titleEnd'])}
          </span>
        </Title>
        <ButtonSignUp
          text={staticText.getIn(['data', 'signUpNow'])}
          buttonClass={getButtonClassName(
            'home-jumbotron__prompt',
            userLanguage,
          )}
          onClick={_partial(setHomeScrollTo, 'section-carousel')}
          type={BUTTON_SIGN_UP_TYPE_BUTTON}
          scrollToTop
        />
      </div>
      <span
        onClick={_partial(setHomeScrollTo, 'section-carousel')}
        className="home-jumbotron__arrow"
      />
    </div>
  )
}

HomeJumbotron.propTypes = {
  setHomeScrollTo: PropTypes.func.isRequired,
  staticText: immutablePropTypes.map.isRequired,
  userLanguage: PropTypes.string,
}

export default connectStaticText({ storeKey: 'homeJumbotron' })(HomeJumbotron)
