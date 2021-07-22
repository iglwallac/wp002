import React, { useCallback } from 'react'
import { connect as connectRedux } from 'react-redux'
import { compose } from 'recompose'
import { Map } from 'immutable'
import { Button, TYPES } from 'components/Button.v2'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import { URL_REFER_JOIN } from 'services/url/constants'
import { TextInput } from 'components/FormInput.v2'
import FormsyForm from 'formsy-react'
import { getBoundActions } from 'actions'
import { getPrimary } from 'services/languages'
import { EN } from 'services/languages/constants'
import { ICON_TYPES } from 'components/Icon.v2'
import { TYPE_PORTAL_V2_SHARE } from 'services/dialog'

const dataLayer = global.dataLayer

function onReturnFocus () {
  return null
}

function InviteFriendReferralLink (props) {
  const { staticText, userReferrals, fixed, user, renderModal } = props
  const query = userReferrals.getIn(['data', 'referralId'])
  const referralLink = query ? `${origin}${URL_REFER_JOIN}?rfd=${query}&utm_source=iaf` : `${origin}${URL_REFER_JOIN}?utm_source=iaf`
  const userLanguage = getPrimary(user.getIn(['data', 'language']))

  const onClickCopyHandler = useCallback(() => {
    let eventLabel = 'header cta'

    if (!fixed) {
      eventLabel = 'copy link cta iaf nav'
    }

    dataLayer.push({
      event: 'customEvent',
      eventCategory: 'user engagement',
      eventAction: 'call to action',
      eventLabel,
    })
  }, [])

  const onClickShare = useCallback(() => {
    renderModal(TYPE_PORTAL_V2_SHARE, {
      description: staticText.get('shareDescription', ''),
      title: staticText.get('shareLink', ''),
      url: referralLink,
      onReturnFocus,
      staticText,
    })
  }, [staticText, referralLink])

  const handleInviteFriendPopup = () => {
    const { showInviteFriendPopup } = props
    const showingInviteFriendPopup = userReferrals.getIn(['showInviteFriendPopup'])
    showInviteFriendPopup(!showingInviteFriendPopup)
  }

  const getClassName = (baseName) => {
    const className = [baseName]

    if (fixed) {
      className.push(`${baseName}--fixed`)
    }
    if (userLanguage !== EN) {
      className.push(`${baseName}--${userLanguage}`)
    }

    return className.join(' ')
  }

  return (
    <div className={getClassName('invite-friend-link')}>
      <Button
        onClick={handleInviteFriendPopup}
        className="invite-friend-link__close-btn"
        icon={ICON_TYPES.CLOSE}
        type={TYPES.ICON}
      />
      <div className={getClassName('invite-friend-link__content')}>
        <div className="invite-friend-link__title">{staticText.get('inviteFriend', '')}</div>
        <FormsyForm className="invite-friend-link__form">
          <TextInput
            autocomplete="off"
            value={referralLink}
            label={staticText.get('yourLink', '')}
            className="invite-friend-link__message-input"
            name="banner-invite-url"
            maxLength={255}
            readonly
            copyable
            block
            showCheckMark
            onClick={onClickCopyHandler}
          />
          <Button
            className="invite-friend-link__share-btn"
            type={TYPES.PRIMARY}
            onClick={onClickShare}
          >
            {staticText.get('share', '')}
          </Button>
        </FormsyForm>
      </div>
    </div>
  )
}

InviteFriendReferralLink.propTypes = {
  userReferrals: ImmutablePropTypes.map.isRequired,
  showInviteFriendPopup: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  renderModal: PropTypes.func.isRequired,
  fixed: PropTypes.bool,
}

export default compose(
  connectRedux(
    state => ({
      staticText: state.staticText.getIn(['data', 'inviteFriendReferralLink', 'data'], Map()),
      userReferrals: state.userReferrals,
      auth: state.auth,
      user: state.user,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        showInviteFriendPopup: actions.userReferrals.showInviteFriendPopup,
        renderModal: actions.dialog.renderModal,
      }
    },
  ),
)(InviteFriendReferralLink)
