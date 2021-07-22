import get from 'lodash/get'
import forEach from 'lodash/forEach'
import findIndex from 'lodash/findIndex'
import isNumber from 'lodash/isNumber'

const actionQueue = {}

export function unloadQueuedActions () {
  forEach(actionQueue, (value, key) => {
    delete actionQueue[key]
  })
}

export function dispatchWhen (action, func) {
  actionQueue[action] = actionQueue[action] || []
  actionQueue[action].push(func)
}

export function removeDispatcher (action, func) {
  if (func) {
    const queue = get(actionQueue, action, [])
    const index = findIndex(queue, f => f === func)
    if (isNumber(index) && index > -1) {
      queue.splice(index, 1)
    }
    return
  }
  actionQueue[action] = []
}

export function dispatchQueuedActions (action, data) {
  const queue = get(actionQueue, action, [])
  forEach(queue, func => func(data))
  delete actionQueue[action]
}
