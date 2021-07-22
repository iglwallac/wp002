import React from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { EMAIL_SIGNUP_INVITE_FRIEND } from 'services/email-signup'
import CtaDevices from 'components/CtaDevices'
import PlanGridV2 from 'components/PlanGrid.v2/PlanGridV2'
import TrustPilot from 'components/TrustPilot'
import DiscoverGaia from 'components/DiscoverGaia'
import InviteFriendJumbotron from 'components/InviteFriend/InviteFriendJumbotron'
import WatchTransformBelong from 'components/InviteFriend/WatchTransformBelong'
import InviteFriend8kGrid from 'components/InviteFriend/InviteFriend8kGrid'
import {
  FR,
} from 'services/languages/constants'
import { getPrimary } from 'services/languages'

function InviteFriendPage ({
  history,
  auth,
  userLanguage,
}) {
  const isAnonymous = !auth.get('jwt')
  const currentLang = getPrimary(userLanguage)

  return (
    <section className="invite-friend">
      <div className="invite-friend__container">
        <header className="invite-friend__jumbotron-section invite-friend__header">
          <InviteFriendJumbotron />
        </header>
        <div className="invite-friend__watch-transform-belong">
          <WatchTransformBelong />
        </div>
        <div className="invite-friend__grid">
          <InviteFriend8kGrid />
        </div>
        <div className="invite-friend__trust-pilot">
          <TrustPilot
            typeTwoColumn
          />
          {/* // TrustPilot */}
        </div>
        {
          isAnonymous ?
            <div className="invite-friend__dicover-gaia">
              <DiscoverGaia formName={EMAIL_SIGNUP_INVITE_FRIEND} />
            </div>
            : null
        }
        {
          currentLang === FR ?
            null
            : <div className="invite-friend__devices">
              <CtaDevices />
            </div>
        }
        {
          isAnonymous ?
            <div className="invite-friend__plan-grid">
              <PlanGridV2 history={history} />
            </div> : null
        }
      </div>
    </section>
  )
}

InviteFriendPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  history: PropTypes.object.isRequired,
  user: PropTypes.object,
}

export default connectRedux(({
  auth,
  user,
}) => ({
  auth,
  userLanguage: user.getIn(['data', 'language']),
}))(InviteFriendPage)
