import React from 'react'
import get from 'lodash/get'
import find from 'lodash/find'
import concat from 'lodash/concat'
import isNil from 'lodash/isNil'
import findIndex from 'lodash/findIndex'
import isNumber from 'lodash/isNumber'
import isFunction from 'lodash/isFunction'
import { connect as connectRedux } from 'react-redux'
import { getCampaign, getVariation, getSubject, variationShouldRender } from 'services/testarossa'
import DaytonaDefault from '../DaytonaDefault'
import DaytonaCase from '../DaytonaCase'

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


function getChildren (props) {
  return concat([], props.children || [])
}

function getDefault (children) {
  return findIndex(children, c => (
    c && c.type === DaytonaDefault
  ))
}

function pickChild (children) {
  const index = findIndex(children, (child) => {
    const { type, props } = child
    const { campaign: id, variation: vids, condition, notVariation } = props
    if (type === DaytonaCase) {
      const campaign = getCampaign({ id })
      const subject = getSubject({ campaign })
      const variation = getVariation({ campaign })
      const production = get(campaign, 'production')
      if (production
        && variationIsMatch(variation, vids, notVariation)
        && variationShouldRender({ campaign, variation })) {
        const conditionWasMet = isFunction(condition)
          ? !!condition(campaign, variation, subject) : true
        return conditionWasMet
      }
    } else if (type === DaytonaSwitch) {
      return pickChild(getChildren(props))
    }
    return false
  })
  if (index < 0) {
    return getDefault(children)
  }
  return index
}

function getInitialState (props) {
  const { bootstrapComplete } = props
  if (bootstrapComplete) {
    return { ready: true }
  }
  const children = getChildren(props)
  const index = getDefault(children)
  return { index, ready: false }
}

class DaytonaSwitch extends React.Component {
  //
  static getDerivedStateFromProps (props, prevState) {
    const { ready } = prevState
    const { records, context, shutdown, failure } = props
    const { records: prevRecords, context: prevContext } = prevState
    if (ready !== true) return null
    if (failure || shutdown) {
      const index = getDefault(getChildren(props))
      return { index, context, records }
    }
    if (records !== prevRecords || context !== prevContext) {
      const index = pickChild(getChildren(props))
      return { index, context, records }
    }
    return null
  }

  constructor (props) {
    super(props)
    this.state = getInitialState(props)
  }

  componentDidMount () {
    const { state, props } = this
    const { ready } = state
    if (ready !== true) {
      const { records, context } = props
      const children = getChildren(props)
      const index = pickChild(children)
      // solves an ssr -> csr issue
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState(() => ({
        ready: true,
        records,
        context,
        index,
      }))
    }
  }

  render () {
    const { state, props } = this
    const { index } = state
    const children = getChildren(props)
    return children[index] || null
  }
}

const connectedDaytonaSwitch = connectRedux((state) => {
  const { testarossa, app } = state
  const records = testarossa.get('records')
  const context = testarossa.get('context')
  const failure = testarossa.get('failure')
  const shutdown = testarossa.get('shutdown')
  const bootstrapComplete = app.get('bootstrapComplete')
  return { records, context, failure, shutdown, bootstrapComplete }
})(DaytonaSwitch)

export default connectedDaytonaSwitch
