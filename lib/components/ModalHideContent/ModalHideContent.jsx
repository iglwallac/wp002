import React from 'react'
import { Button, TYPES as BUTTON_TYPES, SIZES as BUTTON_SIZES } from 'components/Button.v2'
import { URL_ACCOUNT_SETTINGS } from 'services/url/constants'

function componentFromHTML (html) {
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

function ModalHideContent (props = {}) {
  const { staticText, onClick } = props

  return (
    <div>
      <div className="hidecontent__tooltip__body-container">
        <div className="hidecontent__tooltip__body-container__text">
          {componentFromHTML(staticText.getIn(['data', 'hideContentTooltipText1']))}
        </div>
        <div className="hidecontent__tooltip__body-container__text no_top_padding">
          {componentFromHTML(staticText.getIn(['data', 'hideContentTooltipText2']))}
        </div>
      </div>
      <div className="hidecontent__tooltip__button-container">
        <Button
          className="hidecontent__tooltip__button"
          onClick={() => { onClick() }}
          size={BUTTON_SIZES.DEFAULT}
          type={BUTTON_TYPES.PRIMARY}
        >{staticText.getIn(['data', 'hideContentTooltipButtonText'])}</Button>
        <Button
          className="hidecontent__tooltip__button"
          onClick={() => { onClick(true) }}
          url={URL_ACCOUNT_SETTINGS}
          size={BUTTON_SIZES.DEFAULT}
          type={BUTTON_TYPES.SECONDARY}
        >{staticText.getIn(['data', 'hideContentTooltipButton2Text'])}</Button>
      </div>
    </div>
  )
}

export default (ModalHideContent)
