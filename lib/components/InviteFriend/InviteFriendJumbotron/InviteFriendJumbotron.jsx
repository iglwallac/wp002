import React, { useCallback } from 'react'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'

const dataLayer = global.dataLayer

function InviteFriendJumbotron (props) {
  const { staticText } = props

  const onClickCtaHandler = useCallback(() => {
    if (dataLayer) {
      dataLayer.push({
        event: 'customEvent',
        eventCategory: 'user engagement',
        eventAction: 'call to action',
        eventLabel: 'header cta',
      })
    }
  }, [])

  return (
    <div className="invite-friend-jumbotron">
      <div className="invite-friend-jumbotron__overlay" />
      <div className="invite-friend-jumbotron__content">
        <div className="invite-friend-jumbotron__header">
          { staticText.getIn(['data', 'youreInvited']) }
        </div>
        <div className="invite-friend-jumbotron__description">
          {staticText.getIn(['data', 'largestResource'])}
        </div>
        <div className="invite-friend-jumbotron__cta">
          <ButtonSignUp
            buttonClass={['button--primary invite-friend-jumbotron__cta-btn']}
            text={staticText.getIn(['data', 'startTrial'])}
            onClick={onClickCtaHandler}
            type={BUTTON_SIGN_UP_TYPE_BUTTON}
          />
        </div>
      </div>
    </div>
  )
}

InviteFriendJumbotron.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'inviteFriendJumbotron' }),
)(InviteFriendJumbotron)
