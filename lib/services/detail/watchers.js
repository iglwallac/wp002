import { isSynced as resolverIsSynced } from 'components/Resolver/synced'
import { List } from 'immutable'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { get as getDetail, getPlaceholder } from 'services/detail'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import {
  SET_DETAIL_DATA_PLACEHOLDER,
  SET_DETAIL_ID_PATH_TYPE,
  SET_DETAIL_DATA,
} from 'services/detail/actions'
import { set as setInboundTracking } from 'services/inbound-tracking'
import { SET_INBOUND_TRACKING_DATA } from 'services/inbound-tracking/actions'
import { get as getConfig } from 'config'
import _get from 'lodash/get'
import { isSeries, isVideo } from 'services/url'

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

function detailIsSynced (detail, resolver) {
  const resolvedId = resolver.getIn(['data', 'id'])
  return (
    resolvedId === detail.get('id') &&
    resolvedId === detail.getIn(['data', 'id'])
  )
}

async function getDetailData (dispatch, options) {
  const { id, path, type, auth, language } = options
  try {
    dispatch({
      type: SET_DETAIL_ID_PATH_TYPE,
      payload: { id, path, type, processing: true },
    })

    const data = await getDetail({ id, auth, language })
    dispatch({
      type: SET_DETAIL_DATA,
      payload: { data, processing: false },
    })
  } catch (e) {
    // Do nothing for now
  }
}

function setDetailDataPlaceholder (dispatch) {
  dispatch({
    type: SET_DETAIL_DATA_PLACEHOLDER,
    payload: { data: getPlaceholder(), processing: false },
  })
}

// -----------------------------------
// Watcher for checking data "server side"
// -----------------------------------
export function watchSetAppBootstrapPhase ({ before }) {
  return before(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state, action }) => {
    const { app, resolver, user, detail } = state
    const { payload } = action
    const resolvedId = resolver.getIn(['data', 'id'])
    const currentBootstrapComplete = app.get('bootstrapComplete')
    const nextBootstrapComplete = _get(payload, 'isComplete')
    const resolverProcessing = resolver.get('processing')
    const detailPlaceholderExists = detail.get('placeholderExists')
    const resolverDetailPathSynced = resolver.getIn(['path']) === detail.get('path')

    // set placeholder, if needed
    if (
      resolverProcessing ||
      (!detailPlaceholderExists && !resolverDetailPathSynced)
    ) {
      setDetailDataPlaceholder(dispatch)
    }

    // get data, only once
    if (nextBootstrapComplete && nextBootstrapComplete !== currentBootstrapComplete) {
      getDetailData(dispatch, {
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
    const { resolver, detail, user } = state
    const resolvedId = resolver.getIn(['data', 'id'])
    const resolverSynced = resolverIsSynced(resolver, location)
    const detailSynced = detailIsSynced(detail, resolver)
    const resolverProcessing = resolver.get('processing')
    const detailPlaceholderExists = detail.get('placeholderExists')
    const resolverDetailPathSynced = resolver.getIn(['path']) === detail.get('path')
    // We are only interested when/if entity data has been updated

    // set placeholder, if needed
    if (
      resolverProcessing ||
      (!detailPlaceholderExists && !resolverDetailPathSynced)
    ) {
      setDetailDataPlaceholder(dispatch)
    }

    // get data
    if (
      resolvedId > 0 &&
      resolverSynced &&
      !detailSynced &&
      !detail.get('processing')
    ) {
      getDetailData(dispatch, {
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
  return after(SET_DETAIL_DATA, async ({ dispatch, state }) => {
    const { auth, detail, inboundTracking } = state
    const detailId = detail.getIn(['data', 'id'])
    // set tracking
    const recordedId = inboundTracking.getIn(['data', 'ci_id'])
    const contentType = detail.getIn(['data', 'impressionType'])
    const uid = auth.get('uid')

    if (recordedId !== detailId) {
      try {
        const data = await setInboundTracking({
          uid,
          data: {
            ci_type: contentType,
            ci_id: detailId,
          },
          auth,
        })

        dispatch({
          type: SET_INBOUND_TRACKING_DATA,
          payload: { data, processing: false },
        })
      } catch (e) {
        // do nothing for now
      }
    }
  })
    .when(shouldUpdateData)
}
