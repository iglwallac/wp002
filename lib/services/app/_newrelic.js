import get from 'lodash/get'
import { push as newRelicPush } from 'browser/new-relic'
import { setRoute as setRouteNewRelic } from 'new-relic-transaction'

export function setNewRelicRoute (location, auth) {
  newRelicPush((newrelic) => {
    setRouteNewRelic({
      query: get(location, 'query', {}),
      pathname: get(location, 'pathname', ''),
      username: auth.get('username'),
      authToken: auth.get('jwt'),
      uid: auth.get('uid'),
      newrelic,
    })
  })
}

export function addNewRelicAction (name, data) {
  newRelicPush((newrelic) => {
    newrelic.addPageAction(name, data)
  })
}
