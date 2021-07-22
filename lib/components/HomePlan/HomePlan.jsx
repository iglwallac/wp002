import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import PlanGrid from 'components/PlanGrid'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRedux } from 'react-redux'

function HomePlan (props) {
  const { staticText, history, location } = props
  return (
    <div className="home-plan">
      <div className="home-plan__content">
        <p className="home-plan__alternate-headline">
          {staticText.getIn(['data', 'title'])}
        </p>
        <PlanGrid history={history} location={location} />
      </div>
    </div>
  )
}

HomePlan.propTypes = {
  inboundTracking: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  optimizely: ImmutablePropTypes.map.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(state => ({
    inboundTracking: state.inboundTracking,
    plans: state.plans,
    optimizely: state.optimizely,
  })),
  connectStaticText({ storeKey: 'homePlan' }),
)(HomePlan)
