import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Button from 'components/Button'
import {
  LIVE_ACCESS_SUBSCRIPTION_CODE, UPGRADE_NOW_URL,
  JOIN_NOW_URL, JOIN_NOW_QUERY,
} from 'components/EventsPage/constants'
import { createPlayerSrc } from 'services/brightcove'
import Banner from './Banner'
import JoinLiveAccess from './JoinLiveAccess'
import Benefits from './Benefits'
import Featured from './Featured'
import Company from './Company'

const LiveAccessPage = ({ subscriptions, staticText }) => {
  const button = useMemo(() =>
    generateCTA({ subscriptions, staticText }), [staticText, subscriptions])
  return (
    <div className="live-access-page">
      <Banner
        title={staticText.getIn(['data', 'liveAccess'])}
        description={staticText.getIn(['data', 'bannerText'])}
        button={button}
        mediaId={205153}
        playerSrc={createPlayerSrc(1263232739001, 6239539511001)}
      />
      <JoinLiveAccess
        button={button}
      />
      <Benefits staticText={staticText} />
      <Featured />
      <Company staticText={staticText} />
    </div>
  )
}

function generateCTA ({ subscriptions, staticText }) {
  const isLiveAccessMember = subscriptions &&
      subscriptions.includes(LIVE_ACCESS_SUBSCRIPTION_CODE)
  const isEntitled = subscriptions && subscriptions.size
  const buttonText = (isLiveAccessMember && staticText.getIn(['data', 'manageAccount'])) ||
      (isEntitled && staticText.getIn(['data', 'upgradeNow'])) ||
      staticText.getIn(['data', 'joinNow'])
  const buttonURL = !isEntitled ? JOIN_NOW_URL : UPGRADE_NOW_URL
  const buttonQuery = isEntitled ? null : JOIN_NOW_QUERY
  return (
    <Button
      text={buttonText}
      url={buttonURL}
      query={buttonQuery}
      buttonClass="button button--primary"
    />
  )
}

LiveAccessPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        language: state.user.getIn(['data', 'language', 0], 'en'),
        subscriptions: state.auth.get('subscriptions'),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
      }
    },
  ),
  connectStaticText({ storeKey: 'liveAccessPage' }),
)(LiveAccessPage)
