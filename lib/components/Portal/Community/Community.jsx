import { List } from 'immutable'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import TileSubscription from 'components/TileSubscription'
import { Tabs, Tab, TABS_JUSTIFY } from 'components/Tabs'
import { requestAnimationFrame } from 'services/animate'
import Row, { STYLES } from 'components/Row.v2'


function createAccessor (Accessor, item) {
  if (!item) return null
  const url = item.get('url', '') || ''
  return (
    <Accessor
      className={url ? '' : 'no-follow'}
      title={item.get('title', '')}
      to={url}
    />
  )
}

function handleGaEvent () {
  if (global.dataLayer) {
    global.dataLayer.push({
      event: 'customEvent',
      eventCategory: 'User Engagement',
      eventAction: 'carousel click',
      eventLabel: 'followers and following',
    })
  }
}

function renderItem (item) {
  return (
    <TileSubscription
      title={item.get('title')}
      hero={item.get('image')}
      onClick={handleGaEvent}
      url={item.get('url')}
    />
  )
}

function renderRow (items, auth, viewAllLabel, setMode) {
  const tileItems = items.map(s => s.get('tile'))
  return (
    <Row
      createAccessor={createAccessor}
      ctaLabel={viewAllLabel}
      style={STYLES.S23456}
      ctaOnClick={setMode}
      items={tileItems}
      auth={auth}
    >
      {item => renderItem(item)}
    </Row>
  )
}

export default function Community (props) {
  const {
    staticText,
    setMode,
    portal,
    modes,
    auth,
  } = props
  const subscribersLabel = staticText.get('followers')
  const subscriptionsLabel = staticText.get('following')
  const subscribersCount = portal.getIn(['subscribers', 'count'], 0)
  const subscriptionsCount = portal.getIn(['subscriptions', 'count'], 0)
  const subscribers = portal.getIn(['subscribers', 'subscribers'], List())
  const subscriptions = portal.getIn(['subscriptions', 'subscriptions'], List())
  const subscribersViewAll = subscribersCount > 12 ? staticText.get('rowViewAll').replace('{totalItems}', subscribersCount) : ''
  const subscriptionsViewAll = subscriptionsCount > 12 ? staticText.get('rowViewAll').replace('{totalItems}', subscriptionsCount) : ''

  const setModeFollowers = useCallback(() => {
    setMode(modes.FOLLOWERS)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }, [])

  const setModeFollowing = useCallback(() => {
    setMode(modes.FOLLOWING)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }, [])

  if (subscribers.size === 0 && subscriptions.size === 0) {
    return null
  }

  const tabs = []

  if (subscribers.size > 0) {
    tabs.push(
      <Tab label={subscribersLabel} key={subscribersLabel}>
        {renderRow(subscribers, auth, subscribersViewAll, setModeFollowers)}
      </Tab>,
    )
  }

  if (subscriptions.size > 0) {
    tabs.push(
      <Tab label={subscriptionsLabel} key={subscriptionsLabel}>
        {renderRow(subscriptions, auth, subscriptionsViewAll, setModeFollowing)}
      </Tab>,
    )
  }

  return (
    <section className="portal-v2-community">
      <div className="portal-v2-community__divider-line" role="presentation" />
      <div className="portal-v2-community__tabs">
        <Tabs justify={TABS_JUSTIFY.LEFT} >
          {tabs}
        </Tabs>
      </div>
    </section>
  )
}

Community.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  portal: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  setMode: PropTypes.func.isRequired,
  modes: PropTypes.object.isRequired,
}
