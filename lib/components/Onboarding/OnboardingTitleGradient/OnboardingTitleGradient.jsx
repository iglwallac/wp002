import React from 'react'
import GaiaLogo, { TYPE_WHITE } from 'components/GaiaLogo/GaiaLogo'
import PropTypes from 'prop-types'
import Button from 'components/Button'
import Icon from 'components/Icon'
import { H1 } from 'components/Heading'

const titleGradient = (props) => {
  const {
    copy,
    title,
    description,
    handleBackClick,
    screenNumber,
    duration,
  } = props

  const blobNumber = screenNumber || 1

  return (
    <div
      className={`onboarding-title-gradient onboarding-title-gradient__${blobNumber} onboarding-title-gradient__${duration ? 'duration' : ''}`}
    >
      <div className="onboarding-title-gradient__logo-container">
        <GaiaLogo
          type={TYPE_WHITE}
          className={['onboarding__logo']}
        />
      </div>
      <div className="onboarding-title-gradient__container">
        <div className="onboarding-title-gradient__text-container">
          <H1 inverted className="onboarding-title-gradient__title">
            { title }
          </H1>
          <p className="onboarding-title-gradient__description">
            { description }
          </p>
        </div>
      </div>
      <div className="onboarding-title-gradient__button-container">
        <Icon
          iconClass={['icon--left', 'onboarding-title-gradient__left']}
          onClick={handleBackClick}
        />
        <Button
          buttonClass="onboarding-title-gradient__button"
          text={copy.get('back')}
          onClick={handleBackClick}
        />
      </div>
    </div>
  )
}

titleGradient.propTypes = {
  title: PropTypes.string.isRequired,
}

export default titleGradient
