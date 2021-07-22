import _get from 'lodash/get'
import { List, Map } from 'immutable'
import { isSynced as resolverIsSynced } from 'components/Resolver/synced'
import { legacyBatchGet as getUserNodeInfo } from 'services/user-node-info'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { get as getJumbotron } from 'services/jumbotron'
import { STORE_KEY_DETAIL } from 'services/store-keys'
import { isSeries, isVideo } from 'services/url'
import {
  SET_JUMBOTRON_USER_INFO_PROCESSING,
  APPEND_JUMBOTRON_DATA_USER_INFO,
  SET_JUMBOTRON_ID_TYPE_PATH,
  SET_JUMBOTRON_DATA,
} from 'services/jumbotron/actions'
import { get as getConfig } from 'config'

const config = getConfig()
const detailPageV2 = _get(config, ['features', 'detailPageV2'])

function shouldUpdateData ({ state }) {
  const { resolver } = state
  const path = resolver.getIn(['path'])

  if ((isSeries(path) || isVideo(path)) && detailPageV2) {
    return true
  }
  return false
}

function jumbotronIsSynced (jumbotron, resolver) {
  const resolvedId = resolver.getIn(['data', 'id'])
  return (
    resolvedId === jumbotron.get('id') &&
    resolvedId === jumbotron.getIn(['data', 'id'])
  )
}

async function getJumbotronData (dispatch, options) {
  const { id, path, type, auth, language } = options
  try {
    dispatch({
      type: SET_JUMBOTRON_ID_TYPE_PATH,
      payload: { storeKey: STORE_KEY_DETAIL, id, path, type, processing: true },
    })

    const data = await getJumbotron({ id, type, auth, language })
    dispatch({
      type: SET_JUMBOTRON_DATA,
      payload: { storeKey: STORE_KEY_DETAIL, data, processing: false },
    })
  } catch (e) {
    // Do nothing for now
  }
}

async function getJumbotronDataUserInfo (dispatch, options) {
  const { auth, id } = options

  try {
    dispatch({
      type: SET_JUMBOTRON_USER_INFO_PROCESSING,
      payload: { storeKey: STORE_KEY_DETAIL, userInfoProcessing: true },
    })

    const userInfo = await getUserNodeInfo({ ids: [id], auth })

    dispatch({
      type: APPEND_JUMBOTRON_DATA_USER_INFO,
      payload: { storeKey: STORE_KEY_DETAIL, userInfo, processing: false },
    })
  } catch (e) {
    // Do nothing for now
  }
}

// -----------------------------------
// Watcher for checking data "server side"
// -----------------------------------
export function watchSetAppBootstrapPhase ({ before }) {
  return before(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state, action }) => {
    const { app, resolver, user } = state
    const { payload } = action
    const resolvedId = resolver.getIn(['data', 'id'])
    const currentBootstrapComplete = app.get('bootstrapComplete')
    const nextBootstrapComplete = _get(payload, 'isComplete')

    // get data, only once
    if (nextBootstrapComplete && nextBootstrapComplete !== currentBootstrapComplete) {
      getJumbotronData(dispatch, {
        id: resolvedId,
        path: resolver.getIn(['path']),
        type: resolver.getIn(['data', 'type']),
        language: user.getIn(['data', 'language'], List()),
      })
    }
  })
    .when(shouldUpdateData)
}

// -----------------------------------
// Watcher for componentDidMount/DidUpdate on Detail pages
// -----------------------------------
export function watchSetResolverData ({ after }) {
  return after(SET_RESOLVER_DATA, async ({ dispatch, state }) => {
    const { resolver, jumbotron, user } = state
    const resolvedId = resolver.getIn(['data', 'id'])
    const resolverSynced = resolverIsSynced(resolver, location)
    const jumbotronSynced = jumbotronIsSynced(jumbotron.get('detail', Map()), resolver)

    // get data
    if (
      resolvedId > 0 &&
      resolverSynced &&
      !jumbotronSynced &&
      !jumbotron.getIn(['detail', 'processing'])
    ) {
      getJumbotronData(dispatch, {
        id: resolvedId,
        path: resolver.getIn(['path']),
        type: resolver.getIn(['data', 'type']),
        language: user.getIn(['data', 'language'], List()),
      })
    }
  })
    .when(shouldUpdateData)
}

// -----------------------------------
// Watcher for SET_DETAIL_DATA
// -----------------------------------
export function watchSetDetailData ({ after }) {
  return after(SET_JUMBOTRON_DATA, async ({ dispatch, state }) => {
    const { auth, jumbotron, resolver } = state
    const jumbotronState = jumbotron.get(STORE_KEY_DETAIL, Map())
    const jumbotronData = jumbotronState.get('data', Map())
    const jumbotronSynced = jumbotronIsSynced(jumbotronState, resolver)
    const userInfoSynced = !!jumbotronData.get('userInfo')

    if (
      auth.get('jwt') &&
      jumbotronSynced &&
      !jumbotronState.get('processing') &&
      !userInfoSynced &&
      !jumbotronState.get('userInfoProcessing')
    ) {
      getJumbotronDataUserInfo(dispatch, {
        id: jumbotronState.get('id'),
        auth,
      })
    }
  })
    .when(shouldUpdateData)
}
