import React from 'react'
import GaiaLogo, { TYPE_WHITE } from 'components/GaiaLogo/GaiaLogo'
import PropTypes from 'prop-types'
import { H1 } from 'components/Heading'

const titleGradient = ({ title, description, stepsLabel }) => {
  return (
    <div
      className="onboarding-header onboarding-header__1"
    >
      <div className="onboarding-header__logo-container">
        <GaiaLogo
          type={TYPE_WHITE}
          className={['onboarding__logo']}
        />
      </div>
      <div className="onboarding-header__container">
        <div className="onboarding-header__text-container">
          <p className="onboarding-header__steps">{stepsLabel}</p>
          <H1 className="onboarding-header__title">
            { title }
          </H1>
          <p className="onboarding-header__description">
            { description }
          </p>
        </div>
      </div>
    </div>
  )
}

titleGradient.propTypes = {
  title: PropTypes.string.isRequired,
}

export default titleGradient
