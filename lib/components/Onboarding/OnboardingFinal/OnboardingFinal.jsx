import React from 'react'
import GaiaLogo, { TYPE_WHITE } from 'components/GaiaLogo/GaiaLogo'
import DropInVideoPlayer, { BASIC_CONTROL_OPTIONS_VOLUME, BASIC_CONTROL_OPTIONS_VOLUME_LABEL } from 'components/DropInVideoPlayer'
import Button from 'components/Button'
import { H1 } from 'components/Heading'

const FinalPage = (props) => {
  const { copy, recommenderReady, history, isPractice } = props
  const mediaId = copy.get('onBoardingMediaId')
  const activeClass = recommenderReady ? '--active' : ''
  const finalText = isPractice ? copy.get('finalStartPracticing') : copy.get('finalStartWatching')

  return (
    <div className="onboarding__final">
      <div className="onboarding__logo-container onboarding__final-logo-container">
        <GaiaLogo
          type={TYPE_WHITE}
          className={['onboarding__logo']}
        />
      </div>
      <div className="onboarding__final-content-wrapper">
        <div className="onboarding__title onboarding__final-text-container">
          <H1 className="onboarding__title onboarding__final-title">
            { copy.get('finalTitle') }
          </H1>
          <p className="onboarding__text onboarding__final-text">{copy.get('finalParagraph')}</p>
        </div>

        <div className="onboarding__video-container">
          <DropInVideoPlayer
            autoplay
            mediaId={mediaId}
            playsinline
            controls={{
              type: 'basic',
              visibleControls: [BASIC_CONTROL_OPTIONS_VOLUME, BASIC_CONTROL_OPTIONS_VOLUME_LABEL],
            }}
            handleVideoEnd={() => history.push('/')}
            // volume
          />
        </div>

        <div
          className={`onboarding-spinner__link onboarding-spinner__link${activeClass}`}
        >
          <Button
            buttonClass={['button--secondary', 'button--inverted', 'onboarding__final--button']}
            text={finalText}
            url={'/'}
          />
        </div>

      </div>
    </div>
  )
}

export default FinalPage
