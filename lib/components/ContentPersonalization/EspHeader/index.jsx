import React from 'react'
import Button from 'components/Button'
import { H2 } from 'components/Heading'

function EspHeader ({ title, description, backText }) {
  return (
    <div className="esp-header">
      <Button
        text={backText}
        buttonClass="esp-header__back"
        iconClass={['icon', 'icon--left']}
        url="/account/settings"
      />
      <H2 className="esp-header__title">
        { title }
      </H2>
      <p className="esp-header__description">
        { description }
      </p>
    </div>
  )
}

export default EspHeader
