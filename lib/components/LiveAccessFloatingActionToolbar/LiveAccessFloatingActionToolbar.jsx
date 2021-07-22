import React from 'react'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRedux } from 'react-redux'
import { List, Map } from 'immutable'
import { TYPE_CONTENT_SERIES } from 'services/content-type'
import { isEntitled } from 'services/subscription'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import { LIVE_ACCESS_SUBSCRIPTION_CODE } from 'services/live-access-events/constants'
import { URL_LIVE_ACCESS } from 'services/url/constants'

const PREMIUM_SUBSCRIPTION = 802

export function isLiveAccessFeature (feature, contentPolicyPolicyId = null) {
  const subscriptions = feature.getIn(['offerings', 'subscriptions'], List())
  return contentPolicyPolicyId === PREMIUM_SUBSCRIPTION ||
    subscriptions.first() === LIVE_ACCESS_SUBSCRIPTION_CODE
}

export function signUpText ({ type, subscriptions, staticText }) {
  if (!isEntitled(subscriptions)) {
    return staticText.getIn(['data', 'signupToWatch'])
  }
  if (type === TYPE_CONTENT_SERIES) {
    return staticText.getIn(['data', 'watchFirstEpisodeFree'], '')
  }

  return staticText.getIn(['data', 'upgradeToWatch'], '')
}
function LiveAccessFloatingActionToolbar (props) {
  const { staticText, subscriptions, type } = props
  return (
    <div className="live-access-floating-action-signup-container">
      <div className="live-access-floating-action-toolbar">
        <div className="live-access-floating-action-toolbar__container">
          <div className="watch-access">
            <div className="Watch-access-allowed">
              <div className="live-access-floating-action-toolbar__buttons">
                <ButtonSignUp
                  text={signUpText({ staticText, type, subscriptions })}
                  buttonClass={['button--primary', 'live-access-floating-action-toolbar__primary-action']}
                  type={BUTTON_SIGN_UP_TYPE_BUTTON}
                  scrollToTop
                />
                <div className="live-access-floating-action-toolbar__text-container">
                  <div className="live-access-floating-action-toolbar__blurb">
                    {staticText.getIn(['data', 'interestedInLiveAccess'])}
                  </div>
                  <div className="live-access-floating-action-toolbar__learn-more">
                    <a href={URL_LIVE_ACCESS}>{staticText.getIn(['data', 'learnMore'])}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

LiveAccessFloatingActionToolbar.propTypes = {
  staticText: ImmutablePropTypes.map,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        feature: state.detail.getIn(['data', 'feature'], Map()),
        type: state.detail.getIn(['data', 'type', 'content']),
        subscriptions: state.auth.get('subscriptions', List()),
      }
    },
  ),
  connectStaticText({ storeKey: 'liveAccessFloatingActionToolbar' }),
)(LiveAccessFloatingActionToolbar)
