import get from 'lodash/get'
import assign from 'lodash/assign'
import parseInt from 'lodash/parseInt'
import cloneDeep from 'lodash/cloneDeep'
import { get as apiGet, post as apiPost, TYPE_BROOKLYN_JSON } from 'api-client'

export const LAUNCH_PAGE = 'launch page'
export const TOPICS_PAGE = 'topics page'
export const PRACTICE_PAGE = 'practice page'
export const DURATION_PAGE = 'duration page'
export const FINAL_PAGE = 'final page'
export const PRACTICES_ARRAY = ['fitness', 'yoga', 'meditation']

// Duration Page is fast follow
export const SCREEN_MAP = {
  yoga: {
    0: LAUNCH_PAGE,
    1: TOPICS_PAGE,
    2: PRACTICE_PAGE,
    3: PRACTICE_PAGE,
    // 4: DURATION_PAGE,
    4: FINAL_PAGE,
  },
  fitness: {
    0: LAUNCH_PAGE,
    1: TOPICS_PAGE,
    2: PRACTICE_PAGE,
    // 3: DURATION_PAGE,
    3: FINAL_PAGE,
  },
  meditation: {
    0: LAUNCH_PAGE,
    1: TOPICS_PAGE,
    2: PRACTICE_PAGE,
    // 3: DURATION_PAGE,
    3: FINAL_PAGE,
  },
  other: {
    0: LAUNCH_PAGE,
    1: TOPICS_PAGE,
    2: FINAL_PAGE,
  },
}

export const formatPost = (topics, options, duration) => {
  const weightedTopics = topics.map((topic, i) => {
    if (i === 0) return { tid: topic.get('tid'), vid: topic.get('vid'), weight: 1 }
    if (i === 1) return { tid: topic.get('tid'), vid: topic.get('vid'), weight: 0.7 }
    if (i === 2) return { tid: topic.get('tid'), vid: topic.get('vid'), weight: 0.3 }
    return null
  })
  const formattedOptions = options.map((option) => {
    return {
      tid: option.get('tid'),
      vid: option.get('vid'),
      weight: 1,
    }
  })
  const terms = weightedTopics.toJS().concat(formattedOptions.toJS())
  const data = { terms }
  if (duration) {
    data.duration = duration
  }
  return data
}

const SCHEMA = {
  uid: -1,
  terms: [],
  _dataError: null,
}

/**
 * Post Onboarding Selection:
 */

function handlePostResponse (uid, res, _dataError) {
  return assign(cloneDeep(SCHEMA), {
    uid: parseInt(uid),
    _dataError,
  })
}

export async function apiPostOnboardingSelection (options = {}) {
  const { selection, auth, uid, version = 'v4' } = options || {}
  try {
    // endpoint expects a string so this coversion is required :/
    const terms = JSON.stringify([selection])
    const res = await apiPost(
      `${version}/user/onboard`,
      { terms },
      { auth },
      TYPE_BROOKLYN_JSON,
    )
    return handlePostResponse(uid, res)
  } catch (e) {
    return handlePostResponse(uid, {}, true)
  }
}

/**
 * Get Recommender Status:
 */

const RECOMMENDER_STATUS_SCHEMA = {
  onboardVectorsLength: 0,
  multFactor: null,
  _dataError: null,
}

function handleGetRecommenderStatueResponse (res, _dataError) {
  const data = get(res, 'body', {})
  return assign(cloneDeep(RECOMMENDER_STATUS_SCHEMA), {
    onboardVectorsLength: parseInt(get(data, 'onboardVectorsLength', 0)),
    multFactor: get(data, 'multFactor', null),
    _dataError,
  })
}

export async function apiGetRecommenderStatus (options = {}) {
  try {
    const { auth } = options
    const res = await apiGet('v2/recommender-status', null, { auth }, TYPE_BROOKLYN_JSON)
    return handleGetRecommenderStatueResponse(res)
  } catch (e) {
    return handleGetRecommenderStatueResponse({}, true)
  }
}

/**
 * Get Onboarding Status:
 */

function handleGetStatusResponse (res, _dataError) {
  const data = get(res, 'body', {})
  return assign(cloneDeep(SCHEMA), {
    uid: parseInt(get(data, 'uid', -1)),
    _dataError,
    onboardComplete: get(data, 'onboardComplete', false),
    onboardVersion: get(data, 'onboardVersion', ''),
    terms: get(data, 'terms', []),
  })
}

export async function apiGetOnboardingStatus (options = {}) {
  try {
    const { auth } = options
    const res = await apiGet('user/onboard', { retryOnError: true }, { auth }, TYPE_BROOKLYN_JSON)
    return handleGetStatusResponse(res)
  } catch (e) {
    return handleGetStatusResponse({}, true)
  }
}
