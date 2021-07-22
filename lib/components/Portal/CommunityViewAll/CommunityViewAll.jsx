import ImmutablePropTypes from 'react-immutable-proptypes'
import TileSubscription from 'components/TileSubscription'
import { Tabs, Tab, TABS_JUSTIFY } from 'components/Tabs'
import { requestAnimationFrame } from 'services/animate'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import { Button, TYPES } from 'components/Button.v2'
import Row, { STYLES } from 'components/Row.v2'
import Pager from 'components/Pager.v2'
import PropTypes from 'prop-types'
import { List } from 'immutable'
import React from 'react'

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

function handleChangePage (next, updatePagination) {
  updatePagination(next)
  requestAnimationFrame(() => window.scrollTo(0, 0))
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

function renderRow (items, auth, total, updatePagination, page, paginationLimit) {
  const tileItems = items.map(s => s.get('tile'))
  return (
    <React.Fragment>
      <div className="portal-v2-community-view-all__divider-line" role="presentation" />
      <Row
        createAccessor={createAccessor}
        style={STYLES.S12345}
        items={tileItems}
        auth={auth}
        asGrid
      >
        {item => renderItem(item)}
      </Row>
      <Pager
        onChangePage={next => handleChangePage(next, updatePagination)}
        pp={paginationLimit}
        total={total}
        p={page}
      />
    </React.Fragment>
  )
}


export default function CommunityViewAll (props) {
  const {
    updatePagination,
    paginationLimit,
    staticText,
    setMode,
    portal,
    modes,
    auth,
  } = props
  const mode = portal.get('mode')
  const viewAll = portal.getIn(['viewAll', 'items'], List())
  const viewAllTotal = portal.getIn(['viewAll', 'total'], 0)

  if (viewAllTotal === 0) {
    return null
  }

  const subscribersCount = portal.getIn(['subscribers', 'count'], 0)
  const subscriptionsCount = portal.getIn(['subscriptions', 'count'], 0)
  const subscribersLabel = `${subscribersCount} ${staticText.get('followers')}`
  const subscriptionsLabel = `${subscriptionsCount} ${staticText.get('following')}`
  const multipleTabs = subscribersCount > 0 && subscriptionsCount > 0
  const page = portal.getIn(['viewAll', 'p'], 1)
  const TABS = [
    {
      mode: modes.FOLLOWERS,
      label: subscribersLabel,
    },
    {
      mode: modes.FOLLOWING,
      label: subscriptionsLabel,
    },
  ]
  const activeTab = multipleTabs ? TABS.findIndex(t => t.mode === mode) : 0

  const onBack = () => {
    setMode(modes.DEFAULT)
  }

  const handleTabChange = (index) => {
    if (multipleTabs) {
      const nextMode = TABS[index].mode
      setMode(nextMode)
    }
  }

  const tabs = []

  // we are allowing the user to tab between subscribers (followers) and
  // subscriptions (following) in this view if count is greater than zero
  if (subscribersCount > 0) {
    tabs.push(
      <Tab label={subscribersLabel} key={subscribersLabel}>
        {renderRow(viewAll, auth, viewAllTotal, updatePagination, page, paginationLimit)}
      </Tab>,
    )
  }

  if (subscriptionsCount > 0) {
    tabs.push(
      <Tab label={subscriptionsLabel} key={subscriptionsLabel}>
        {renderRow(viewAll, auth, viewAllTotal, updatePagination, page, paginationLimit)}
      </Tab>,
    )
  }

  return (
    <div className="portal-v2-community-view-all">
      <Button
        className="portal-v2-community-view-all__back"
        type={TYPES.GHOST}
        onClick={onBack}
      >
        <Icon type={ICON_TYPES.CHEVRON_LEFT} />
        {staticText.get('back')}
      </Button>
      <section className="portal-v2-community-view-all__tabs">
        <Tabs justify={TABS_JUSTIFY.LEFT} activeTab={activeTab} onChange={handleTabChange}>
          {tabs}
        </Tabs>
      </section>
    </div>
  )
}

CommunityViewAll.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  paginationLimit: PropTypes.number.isRequired,
  updatePagination: PropTypes.func.isRequired,
  portal: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  modes: PropTypes.object.isRequired,
  setMode: PropTypes.func.isRequired,
}
