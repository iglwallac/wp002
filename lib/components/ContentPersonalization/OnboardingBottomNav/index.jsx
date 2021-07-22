import React from 'react'

import Button from 'components/Button'
import IconV2 from 'components/Icon.v2'

export default function OnboardingBottomNav ({
  ctaLabel = '',
  ctaIconType = null,
  showInfoLabel = false,
  onNext,
  onPrev,
  backText,
  selectMoreText,
}) {
  return (
    <div className="onboarding-bottom-nav">
      <div>
        <Button
          text={backText}
          buttonClass="onboarding-bottom-nav__back"
          iconClass={['icon', 'icon--left']}
          onClick={onPrev}
        />
      </div>
      <div>
        {showInfoLabel && (
          <span className="onboarding-bottom-nav__info-label">{selectMoreText}</span>
        )}
        {ctaLabel !== false && (
          <button
            className="onboarding-bottom-nav__cta form-button form-button--primary"
            onClick={onNext}
          >
            {ctaLabel}
            {ctaIconType && (
              <IconV2 type={ctaIconType} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
