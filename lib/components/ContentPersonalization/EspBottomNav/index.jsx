import React from 'react'

import Link from 'components/Link'

export default function EspBottomNav ({
  ctaLabel = '',
  backText,
  showInfoLabel = false,
  onNext,
  selectMoreText,
}) {
  return (
    <div className="esp-bottom-nav">
      {backText && (
        <Link
          className="esp-bottom-nav__cta form-button form-button--secondary"
          to="/account/settings"
        >
          {backText}
        </Link>
      )}
      {showInfoLabel && (
        <span className="esp-bottom-nav__info-label">{selectMoreText}</span>
      )}
      {ctaLabel !== false && (
        <button
          className="esp-bottom-nav__cta form-button form-button--primary"
          onClick={onNext}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
