import React from 'react'
import Button from 'components/Button'
import Link from 'components/Link'
import GaiaLogo, { TYPE_TEAL } from 'components/GaiaLogo/GaiaLogo'
import { H1 } from 'components/Heading'

function OnboardingLaunchPage ({ title, subtitle, paragraph1, paragraph2,
  onLaunch, letsGoText, onSkip, skipCTA }) {
  return (
    <div className="onboarding-launch-page">
      <div className="onboarding-launch-page__container">
        <div className="onboarding-launch-page__gradient-bar" />
        <div className="onboarding-launch-page__launch-gradient">
          <div className="onboarding-launch-page__logo-container">
            <GaiaLogo
              type={TYPE_TEAL}
              className={['onboarding-launch-page__logo']}
            />
          </div>
          <div className="onboarding-launch-page__intro-text-wrapper">
            <H1 className="onboarding-launch-page__intro-title">
              <span>{title}</span>
              <span>{subtitle}</span>
            </H1>
            <p className="onboarding-launch-page__intro-text">{paragraph1}</p>
            <p className="onboarding-launch-page__intro-text">{paragraph2}</p>
          </div>
          <div className="onboarding-launch-page__cta-container">
            <Button
              buttonClass="onboarding-launch-page__button"
              text={letsGoText}
              onClick={onLaunch}
            />
            <Link
              className="onboarding-launch-page__skip-cta"
              to="/"
              text={skipCTA}
              onClick={onSkip}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingLaunchPage
