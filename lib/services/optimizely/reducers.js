import _get from 'lodash/get'
import { Map, List } from 'immutable'
import {
  SET_OPTIMIZELY_ACTIVE_PAGE,
  SET_OPTIMIZELY_USER_ATTRIBUTES,
  SET_OPTIMIZELY_EXPERIMENT_DECISION,
  SET_OPTIMIZELY_EVENT,
  SET_OPTIMIZELY_DISABLED,
  NO_EVENT_TYPE_FOUND,
  NO_PAGE_NAME_FOUND,
} from 'services/optimizely/actions'

const MAX_STACK_SIZE = 50
export const intialState = Map()

export default function (state = intialState, action) {
  const type = _get(action, 'type', '')
  const payload = _get(action, 'payload', {})

  switch (type) {
    case SET_OPTIMIZELY_EVENT:
      return state.update('events', List(), (data) => {
        const eventType = _get(payload, 'eventType', NO_EVENT_TYPE_FOUND)
        const tags = _get(payload, 'tags', Map())

        if (data.size > MAX_STACK_SIZE) {
          // eslint-disable-next-line no-param-reassign
          data = data.unshift()
        }
        return data.push(Map({ eventType, tags }))
      })

    case SET_OPTIMIZELY_ACTIVE_PAGE:
      return state.update('page', List(), (data) => {
        if (data.size > MAX_STACK_SIZE) {
          // eslint-disable-next-line no-param-reassign
          data = data.unshift()
        }
        return data.push(_get(payload, 'pageName', NO_PAGE_NAME_FOUND))
      })

    case SET_OPTIMIZELY_USER_ATTRIBUTES: {
      const attributes = _get(payload, 'attributes', Map())
      const prevAttributes = state.get('attributes', Map())
      return state.set('attributes', prevAttributes.merge(attributes))
    }

    case SET_OPTIMIZELY_EXPERIMENT_DECISION:
      return state.update('experiments', Map(), (experiments) => {
        const decision = _get(payload, 'decision')
        const experimentId = _get(decision, 'experimentId')
        return experiments.set(experimentId, Map(decision))
      })

    case SET_OPTIMIZELY_DISABLED: {
      return state.set('disabled', payload)
    }

    default:
      return state
  }
}
