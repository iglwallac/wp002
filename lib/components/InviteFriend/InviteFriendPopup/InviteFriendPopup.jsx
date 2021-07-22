import React, { useRef, useEffect } from 'react'
import { connect as connectRedux } from 'react-redux'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import Link from 'components/Link'
import { URL_REFER, TARGET_BLANK } from 'services/url/constants'
import { connect as connectStaticText } from 'components/StaticText/connect'
import InviteFriendReferralLink from 'components/InviteFriend/InviteFriendReferralLink'
import { getPrimary } from 'services/languages'
import { EN } from 'services/languages/constants'

function InviteFriendPopup (props) {
  const { staticText, userReferrals, showInviteFriendPopup, user } = props
  const shouldShowInviteFriendPopup = userReferrals.getIn(['showInviteFriendPopup'])
  const signedUp = staticText.getIn(['data', 'signedUp'])
  const oneSignedUp = staticText.getIn(['data', 'oneSignedUp'])
  const totalReferrals = userReferrals.getIn(['data', 'referrals', 'count'], 0)
  const foreverAlone = staticText.getIn(['data', 'noFriends'])
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const node = useRef()
  const friendsSignedUp = () => {
    if (totalReferrals === 0) {
      return foreverAlone
    } else if (totalReferrals === 1) {
      return `${totalReferrals} ${oneSignedUp}`
    }
    return `${totalReferrals} ${signedUp}`
  }

  const handleClick = (e) => {
    const currentNode = node.current
    if (currentNode === undefined || currentNode === null) {
      return
    }
    if (e.target.className === 'header__popup-link' || e.target.className === 'header__invite-link') {
      return
    }
    if (currentNode.contains(e.target)) {
      // inside click
      return
    }
    // outside click
    showInviteFriendPopup(false)
  }

  const getClassName = (elementName) => {
    const classes = []
    const className = 'invite-friend-popup'

    if (elementName) {
      classes.push(`${className}__${elementName}`)
    }

    if (userLanguage !== EN) {
      classes.push(`${className}__${elementName}--${userLanguage}`)
    }

    return classes.join(' ')
  }

  useEffect(() => {
    // add when mounted
    document.addEventListener('mousedown', handleClick)
    // return function to be called when unmounted
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  if (shouldShowInviteFriendPopup) {
    return (
      <div ref={node} className="invite-friend-popup">
        <div className={getClassName('referral-link')}>
          <InviteFriendReferralLink />
        </div>
        <div className={getClassName('message')}>
          {staticText.getIn(['data', 'atGaia'])}
        </div>
        <div className={getClassName('referral-count-container')}>
          <Link
            target={TARGET_BLANK}
            to={URL_REFER}
            className={getClassName('referral-count')}
            onClick={() => showInviteFriendPopup(false)}
          >
            {friendsSignedUp()} {`${staticText.getIn(['data', 'seeDetails'])}`}
          </Link>
        </div>
      </div>
    )
  }
  return (null)
}

InviteFriendPopup.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  userReferrals: ImmutablePropTypes.map.isRequired,
  showInviteFriendPopup: PropTypes.func.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'inviteFriendPopup' }),
  connectRedux(
    state => ({
      auth: state.auth,
      userReferrals: state.userReferrals,
      user: state.user,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        showInviteFriendPopup: actions.userReferrals.showInviteFriendPopup,
      }
    },
  ),
)(InviteFriendPopup)
