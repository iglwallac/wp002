import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { H2 } from 'components/Heading'
import Button from 'components/Button'

const BUTTON_CLASS = [
  'modal-share__continue-btn',
  'form-button--primary',
  'form-button',
]

export default function ShareInterstitial (props) {
  const { staticText, onContinue } = props
  const onClick = useCallback((e) => {
    e.preventDefault()
    onContinue()
  }, [])
  return (
    <div className="modal-share__first-share">
      <div className="modal-share__title">
        <H2>
          {staticText.getIn(['data', 'friendsWatch'])}
        </H2>
      </div>
      <div className="modal-share__description">
        {staticText.getIn(['data', 'yourMembershipIncludes'])}
      </div>
      <div className="modal-share__desc-grid">
        <div className="modal-share__desc-cell">
          <div className="modal-share__desc-icon icon-v2 icon-v2--friends" />
          <div className="modal-share__description modal-share__desc-text">
            {staticText.getIn(['data', 'shareTheLink'])}
          </div>
        </div>
        <div className="modal-share__desc-cell">
          <div className="modal-share__desc-icon icon-v2 icon-v2--play-circle" />
          <div className="modal-share__description modal-share__desc-text">
            {staticText.getIn(['data', 'theyCanWatch'])}
          </div>
        </div>
        <div className="modal-share__desc-cell">
          <div className="modal-share__desc-icon icon-v2 icon-v2--clock" />
          <div className="modal-share__description modal-share__desc-text">
            {staticText.getIn(['data', 'friendsHave24'])}
          </div>
        </div>
      </div>
      <div className="modal-share__btn__wrapper">
        <Button
          text={staticText.getIn(['data', 'continueToShare'])}
          buttonClass={BUTTON_CLASS}
          onClick={onClick}
        />
      </div>
    </div>
  )
}

ShareInterstitial.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  onContinue: PropTypes.func.isRequired,
}
