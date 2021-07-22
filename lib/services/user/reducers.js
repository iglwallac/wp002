import has from 'lodash/has'
import { Map, List, fromJS } from 'immutable'
import { SET_HIDDEN_CONTENT_ADD } from 'services/hidden-content-preferences/actions'
import { NOTIFICATIONS_SET_SUBSCRIBER } from 'services/notifications/actions'
import { SET_FEATURE_TRACKING_DATA } from 'services/feature-tracking/actions'
import * as actions from './actions'

export const initialState = Map()

function setContactData (state, action) {
  const { payload } = action
  const subscriptions = fromJS(payload)
  const globalSubscription = subscriptions.find(s => (
    s.get('subscriptionKey') === 'optin'
  )) || Map()
  const editableSubscriptions = subscriptions.filter(s => (
    s.get('subscriptionKey') !== 'optin'
  ))
  const selectedSubscriptionCount = editableSubscriptions.reduce((c, s) => (
    s.get('isSubscribed') ? c + 1 : c
  ), 0)
  return state.withMutations(mutateState => mutateState
    .setIn(['data', 'emarsys'], Map({
      unavailable: subscriptions.size < 1,
      selectedSubscriptionCount,
      editableSubscriptions,
      globalSubscription,
      subscriptions,
    })))
}

function updateContactData (store, action) {
  const { payload } = action
  const { fields, optin } = payload
  const data = store.getIn(['data', 'emarsys'], Map())
  const all = data.get('subscriptions', List()).map((s) => {
    const key = s.get('subscriptionKey')
    if (key === 'optin') return s.set('isSubscribed', optin)
    if (has(fields, key)) return s.set('isSubscribed', fields[key])
    return s
  })
  return setContactData(store, {
    payload: all.toJS(),
  })
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_USER_ANONYMOUS_UUID: {
      const { payload = {} } = action
      const { uuid } = payload
      return state.update('data', Map(), data => (
        uuid ? data.set('anonymousUuid', uuid) : data
      ))
    }
    case actions.SET_USER_DATA:
      return state.withMutations(mutateState => mutateState
        .update('data', Map(), data =>
          data.merge(fromJS(action.payload.data)),
        )
        .set('processing', action.payload.processing))
    case actions.SET_USER_DATA_ENTITLED:
      return state.withMutations(mutateState => mutateState
        .update('data', Map(), data =>
          data.set('entitled', action.payload.value),
        )
        .set('processing', action.payload.processing))
    case actions.SET_USER_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_USER_USERNAME_AVAILABILITY_PROCESSING:
      return state.set('usernameAvailabilityProcessing', action.payload)
    case actions.SET_USER_USERNAME_AVAILABILITY:
      return state.withMutations(mutateState => mutateState
        .set('usernameAvailable', action.payload)
        .delete('usernameAvailabilityProcessing'))
    case actions.RESET_USER_USERNAME_AVAILABILITY:
      return state.delete('usernameAvailable')
    case actions.SET_USER_EMAIL_AVAILABILITY_PROCESSING:
      return state.set('emailAvailabilityProcessing', action.payload)
    case actions.SET_USER_CONTACT_DATA:
      return setContactData(state, action)
    case actions.UPDATE_USER_CONTACT_DATA:
      return updateContactData(state, action)
    case actions.SET_USER_CHILD_ACCOUNT:
      return state.withMutations(mutateState => mutateState
        .set('childProfile', action.payload)
        .delete('emailAvailabilityProcessing'))
    case actions.SET_USER_EMAIL_AVAILABILITY:
      return state.withMutations(mutateState => mutateState
        .set('emailAvailable', action.payload)
        .delete('emailAvailabilityProcessing'))
    case actions.RESET_USER_EMAIL_AVAILABILITY:
      return state.delete('emailAvailable', action.payload)
    case actions.SET_USER_PROFILE_IMAGES_PROCESSING:
      return state.set('userProfileImagesProcessing', action.payload)
    case actions.SET_USER_PROFILE_IMAGES:
      return state.withMutations(mutateState => mutateState
        .set('userProfileImages', fromJS(action.payload.data))
        .set('userProfileImagesProcessing', action.payload.processing))
    case actions.SET_USER_PROFILE_IMAGES_DELETE:
      return state.withMutations(mutateState => mutateState
        .set('deleteUserProfileImages', fromJS(action.payload.data))
        .set('userProfileImagesProcessing', action.payload.processing))
    case actions.CLEAR_USER_PROFILE_DATA:
      return state
        .delete('userProfileImages')
        .delete('deleteUserProfileImages')
        .delete('updateUser')
        .delete('updateUserProcessing')
        .delete('userProfileImagesProcessing')
    case actions.SET_UPDATE_USER_PROCESSING:
      return state.set('updateUserProcessing', action.payload)
    case SET_HIDDEN_CONTENT_ADD:
    case NOTIFICATIONS_SET_SUBSCRIBER:
      return state.withMutations(mutateState => mutateState
        .setIn(['data', 'mcttActivated'], true))
    case SET_FEATURE_TRACKING_DATA: {
      const { payload = {} } = action
      const { data = {} } = payload
      if (data) {
        if (data.has('hidePmSectionIds')
          || data.has('mhSpotlightCollapsed')
          || data.has('disableVideoInfo')
          || data.has('disableAutoPlayNext')) {
          return state.withMutations(mutateState => mutateState
            .setIn(['data', 'mcttActivated'], true))
        }
      }
      return state
    }
    case actions.SET_USER_UPDATE_DATA:
      return state.withMutations(mutateState => mutateState
        .set('updateUser', fromJS(action.payload.data))
        .set('updateUserProcessing', action.payload.processing))
    case actions.SET_USER_DATA_LANGUAGE:
      return state.withMutations(mutateState => mutateState
        .setIn(
          ['data', 'language'],
          List.isList(action.payload.value)
            ? action.payload.value
            : List(action.payload.value),
        )
        .set('processing', action.payload.processing))
    case actions.CLEAR_USER_DATA_LANGUAGE_DIALOG:
      return state.withMutations(mutateState => mutateState
        .deleteIn(['data', 'languageDialog']))
    case actions.SET_USER_DATA_LANGUAGE_DIALOG:
      return state.withMutations(mutateState => mutateState
        .setIn(
          ['data', 'languageDialog'],
          List.isList(action.payload.value)
            ? action.payload.value
            : List(action.payload.value),
        ))
    case actions.RESET_USER_DATA_LANGUAGE:
      return state.withMutations(mutateState => mutateState
        .delete(['data', 'language'])
        .set('processing', action.payload.processing))
    case actions.SET_USER_DATA_LANGUAGE_PRIMARY:
      return state.withMutations(mutateState => mutateState
        .updateIn(['data', 'language'], List(), (
          language,
        ) => {
          // eslint-disable-next-line no-param-reassign
          language = language.set(0, action.payload.value)
          // Find any records besides the first
          const index = language.findIndex(
            (val, key) => key > 0 && val === action.payload.value,
          )
          // Remove any other records of the primary past index 0
          if (index > 0) {
            // eslint-disable-next-line no-param-reassign
            language = language.delete(index)
          }
          return language
        })
        .set('processing', action.payload.processing))
    case actions.SET_USER_LANGUAGE_SELECT_STEP:
      return state.set('languageSelectStep', action.payload)
    case actions.SET_USER_DATA_LANGUAGE_ALERT_BAR_ACCEPTED:
      return state.setIn(['data', 'languageAlertBarAccepted'], action.payload.value)
    case actions.SET_ANONYMOUS_USER_EMAIL_PREFERENCES_PROCESSING:
      return state.set('anonymousEmailPreferencesProcessing', action.payload)
    case actions.SET_ANONYMOUS_USER_EMAIL_PREFERENCES_DATA:
      return state.withMutations(mutateState => mutateState
        .setIn(['data', 'anonymousEmailPreferences'], fromJS(action.payload.data))
        .delete('anonymousEmailPreferencesProcessing'))
    case actions.RESET_ANONYMOUS_USER_EMAIL_PREFERENCES:
      return state.withMutations(mutateState => mutateState
        .deleteIn(['data', 'anonymousEmailPreferences'])
        .delete('anonymousEmailPreferencesProcessing'))
    case actions.SET_USER_PORTAL_METADATA:
      return state.setIn(['data', 'portal'], fromJS(action.payload.data))
    case actions.MODAL_FREE_TRIAL_EXPIRED_DISMISSED:
      return state.setIn(['data', 'modalFreeTrialExpiredDismissed'], action.payload)
    default:
      return state
  }
}
