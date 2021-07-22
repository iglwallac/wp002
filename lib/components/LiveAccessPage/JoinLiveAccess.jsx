import React from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { PLAN_SKU_LIVE } from 'services/plans'
import { Card } from 'components/Card'
import { H2 } from 'components/Heading'

const LiveAccessCard = ({ title, button, priceString, perYearString }) => {
  const length = priceString.length
  const costClassName = `live-access-page__join-live-access__card__cost live-access-page__join-live-access__card__cost${(length > 8 && '--tiny')
    || (length > 6 && '--small')
    || (length > 4 && '--medium')
    || ''}`
  return (
    <Card>
      <div className="live-access-page__join-live-access__card__title">
        {title}
      </div>
      <div className={costClassName}>
        {priceString}
        <span className="live-access-page__join-live-access__card__cost__per-year">
          {perYearString}
        </span>
      </div>
      <div className="live-access-page__join-live-access__card__cta-container">
        {button}
      </div>
    </Card>
  )
}

const JoinLiveAccess = (props) => {
  const { button, plans, language, staticText } = props

  const plansData = plans.getIn(['data', 'plans'])
  const livePlanData = plansData && plansData.find(e => e.get('sku') === PLAN_SKU_LIVE)
  const priceString = (livePlanData && new Intl.NumberFormat(language,
    {
      style: 'currency',
      currency: livePlanData.get('currencyIso'),
      minimumFractionDigits: 0,
    }).format(livePlanData.get('costs').first())) || ''
  return (
    <div className="live-access-page__join-live-access">
      <H2 className="live-access-page__join-live-access__title">
        {staticText.getIn(['data', 'watchLiveEvents'])}
      </H2>
      <div className="live-access-page__join-live-access__description">
        {staticText.getIn(['data', 'description'])}
      </div>
      <div className="live-access-page__join-live-access__card-wrapper">
        <LiveAccessCard
          button={button}
          priceString={priceString}
          perYearString={staticText.getIn(['data', 'perYear'])}
          title={staticText.getIn(['data', 'liveAccess'])}
        />
      </div>
    </div>
  )
}

JoinLiveAccess.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        plans: state.plans,
        language: state.user.getIn(['data', 'language', 0], 'en'),
      }
    },
  ),
  connectStaticText({ storeKey: 'liveAccessPage' }),
)(JoinLiveAccess)

