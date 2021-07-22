import React from 'react'
import GaiaLogo, { TYPE_WHITE } from 'components/GaiaLogo/GaiaLogo'
import DropInVideoPlayer, { BASIC_CONTROL_OPTIONS_VOLUME, BASIC_CONTROL_OPTIONS_VOLUME_LABEL } from 'components/DropInVideoPlayer'
import Button from 'components/Button'
import { H1 } from 'components/Heading'

const OnboardingFinalPage = ({
  title,
  description,
  mediaId,
  recommenderReady,
  history,
  finalText,
}) => {
  const activeClass = recommenderReady ? '--active' : ''

  return (
    <div className="onboarding-final-page">
      <div className="onboarding-final-page__logo-container">
        <GaiaLogo
          type={TYPE_WHITE}
          className={['onboarding-final-page__logo']}
        />
      </div>
      <div className="onboarding-final-page__final-content-wrapper">
        <div className="onboarding-final-page__title onboarding-final-page__final-text-container">
          <H1 className="onboarding-final-page__title onboarding-final-page__final-title">
            {title}
          </H1>
          <p className="onboarding-final-page__text onboarding-final-page__final-text">
            {description}
          </p>
        </div>

        <div className="onboarding-final-page__video-container">
          <DropInVideoPlayer
            autoplay
            mediaId={mediaId}
            playsinline
            controls={{
              type: 'basic',
              visibleControls: [BASIC_CONTROL_OPTIONS_VOLUME, BASIC_CONTROL_OPTIONS_VOLUME_LABEL],
            }}
            handleVideoEnd={() => history.push('/')}
          />
        </div>

        <div
          className={`onboarding-spinner__link onboarding-spinner__link${activeClass}`}
        >
          <Button
            buttonClass={['button--secondary', 'button--inverted', 'onboarding-final-page__final--button']}
            text={finalText}
            url={'/'}
          />
        </div>

      </div>
    </div>
  )
}

export default OnboardingFinalPage
