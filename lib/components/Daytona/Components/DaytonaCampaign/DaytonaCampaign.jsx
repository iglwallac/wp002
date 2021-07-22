import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import find from 'lodash/find'
import isNil from 'lodash/isNil'
import concat from 'lodash/concat'
import assign from 'lodash/assign'
import toLower from 'lodash/toLower'
import isNumber from 'lodash/isNumber'
import isFunction from 'lodash/isFunction'
import { connect as connectRedux } from 'react-redux'
import { getCampaign, getVariation, getSubject, variationShouldRender } from 'services/testarossa'

function variationIsMatch (variation, ids, notVariation) {
  const friendlyId = get(variation, 'friendlyId')
  if (!isNil(ids)) {
    const variationIds = concat([], ids)
    const match = find(variationIds, (id) => {
      return id === friendlyId
    })
    return isNumber(match)
  } else if (!isNil(notVariation)) {
    const notVariationIds = concat([], notVariation)
    const match = find(notVariationIds, (id) => {
      return id === friendlyId
    })
    return !isNumber(match)
  }
  return true
}


function getInitialState (props) {
  const { bootstrapComplete } = props
  if (bootstrapComplete) {
    return { ready: true }
  }
  return { ready: false }
}

class DaytonaCampaign extends React.Component {
  //
  static getDerivedStateFromProps (props, prevState) {
    const { ready, records: prevRecords, context: prevContext } = prevState
    const { records, context, failure, shutdown, condition, notVariation } = props
    if (ready !== true || failure || shutdown) return null
    if (records !== prevRecords || context !== prevContext) {
      const { id, variation: vid } = props
      const campaign = getCampaign({ id })
      const subject = getSubject({ campaign })
      const variation = getVariation({ campaign })
      const production = get(campaign, 'production')
      if (production
        && variationIsMatch(variation, vid, notVariation)
        && variationShouldRender({ campaign, variation })) {
        const conditionWasMet = isFunction(condition)
          ? !!condition(campaign, variation, subject)
          : true

        if (conditionWasMet) {
          const campaignId = toLower(id)
          const variationId = get(variation, 'friendlyId')
          return {
            subject: assign({}, subject),
            variationId,
            campaignId,
            variation,
            campaign,
            context,
            records,
          }
        }
      }
      return {
        variationId: null,
        campaignId: null,
        variation: null,
        campaign: null,
        subject: null,
        context,
        records,
      }
    }
    return null
  }

  constructor (props) {
    super(props)
    this.state = getInitialState(props)
  }

  componentDidMount () {
    const { state } = this
    const { ready } = state
    if (ready !== true) {
      // solves an ssr -> csr issue
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState(() => ({
        ready: true,
      }))
    }
  }

  render () {
    const { state, props } = this
    const { variation, campaign, subject } = state
    if (campaign && variation) {
      const { children, unwrap } = props
      const component = isFunction(children)
        ? children(campaign, variation, subject)
        : children
      return unwrap
        ? (component)
        : (
          <section
            className={`daytona-campaign ${state.campaignId}`}
            data-variation={state.variationId}
          >{component}
          </section>
        )
    }
    return null
  }
}

DaytonaCampaign.propTypes = {
  unwrap: PropTypes.bool,
  condition: PropTypes.func,
  id: PropTypes.string.isRequired,
  variation: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.array,
  ]),
}

export default connectRedux((state) => {
  const { testarossa, app } = state
  const records = testarossa.get('records')
  const context = testarossa.get('context')
  const failure = testarossa.get('failure')
  const shutdown = testarossa.get('shutdown')
  const bootstrapComplete = app.get('bootstrapComplete')
  return { records, context, failure, shutdown, bootstrapComplete }
})(DaytonaCampaign)
