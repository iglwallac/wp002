import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map, List, fromJS } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setUserUsernameAvailabilityProcessing,
  setUserUsernameAvailability,
  resetUserUsernameAvailability,
  setUserEmailAvailabilityProcessing,
  setUserEmailAvailability,
  resetUserEmailAvailability,
  clearUserDataLanguageDialog,
  setUserDataLanguageDialog,
  setUserDataLanguage,
  resetUserDataLanguage,
  setUserDataLanguagePrimary,
  setUserDataEntitled,
  setUserDataLanguageAlertBarAcceptedAction,
  setUserProfileImagesProcessing,
  setUserProfileImages,
  setUserProfileImagesDelete,
  clearUserProfileData,
  setUserUpdateData,
  setUpdateUserProcessing,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service checkout reducers', () => {
  describe('Reducer SET_USER_USERNAME_AVAILABILITY_PROCESSING', () => {
    it('should set usernameAvailabilityProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUserUsernameAvailabilityProcessing(value),
      )
      assert.equal(value, state.get('usernameAvailabilityProcessing'))
    })
  })
  describe('Reducer SET_USER_USERNAME_AVAILABILITY', () => {
    it('should set usernameAvailable and remove availabilityProcessing in state', () => {
      const value = true
      const testState = initialState.merge(
        Map({
          usernameAvailabilityProcessing: true,
        }),
      )
      const state = reducers(testState, setUserUsernameAvailability(value))
      assert.equal(value, state.get('usernameAvailable'))
      assert.isFalse(state.has('usernameAvailabilityProcessing'))
    })
  })
  describe('Reducer RESET_USER_USERNAME_AVAILABILITY', () => {
    it('should delete usernameAvailable in state', () => {
      const testState = initialState.set('usernameAvailable', true)
      const state = reducers(testState, resetUserUsernameAvailability())
      assert.isFalse(state.has('usernameAvailable'))
    })
  })
  describe('Reducer SET_USER_EMAIL_AVAILABILITY_PROCESSING', () => {
    it('should set emailAvailabilityProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUserEmailAvailabilityProcessing(value),
      )
      assert.equal(value, state.get('emailAvailabilityProcessing'))
    })
  })
  describe('Reducer SET_USER_EMAIL_AVAILABILITY', () => {
    it('should set emailAvailable and remove emailAvailabilityProcessing in state', () => {
      const value = true
      const testState = initialState.merge(
        Map({
          emailAvailabilityProcessing: true,
        }),
      )
      const state = reducers(testState, setUserEmailAvailability(value))
      assert.equal(value, state.get('emailAvailable'))
      assert.isFalse(state.has('emailAvailabilityProcessing'))
    })
  })
  describe('Reducer RESET_USER_EMAIL_AVAILABILITY', () => {
    it('should delete emailAvailable in state', () => {
      const testState = initialState.set('emailAvailable', true)
      const state = reducers(testState, resetUserEmailAvailability())
      assert.isFalse(state.has('emailAvailable'))
    })
  })
  describe('Reducer SET_USER_PROFILE_IMAGES_PROCESSING', () => {
    it('should set setUserProfileImagesProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUserProfileImagesProcessing(value),
      )
      assert.equal(value, state.get('userProfileImagesProcessing'))
    })
  })
  describe('Reducer SET_USER_PROFILE_IMAGES', () => {
    it('should set user.userProfileImages and user.userProfileImagesProcessing in state', () => {
      const data = fromJS({
        success: true,
        statusCode: 200,
      })
      const processing = true
      const state = reducers(
        initialState,
        setUserProfileImages(data, processing),
      )
      assert.equal(
        data,
        state.get('userProfileImages'),
      )
      assert.equal(processing, state.get('userProfileImagesProcessing'))
    })
  })
  describe('Reducer SET_USER_PROFILE_IMAGES_DELETE', () => {
    it('should set user.deleteUserProfileImages and user.userProfileImagesProcessing in state', () => {
      const data = fromJS({
        success: true,
        statusCode: 204,
      })
      const processing = true
      const state = reducers(
        initialState,
        setUserProfileImagesDelete(data, processing),
      )
      assert.equal(
        data,
        state.get('deleteUserProfileImages'),
      )
      assert.equal(processing, state.get('userProfileImagesProcessing'))
    })
  })
  describe('Reducer CLEAR_USER_PROFILE_DATA', () => {
    it('should delete userProfileImages and deleteUserProfileImages in state', () => {
      const userProfileImagesData = Map({
        success: true,
        statusCode: 200,
      })
      const deleteUserProfileImagesData = Map({
        success: true,
        statusCode: 204,
      })
      const testState = initialState
        .set('userProfileImages', userProfileImagesData)
        .set('deleteUserProfileImages', deleteUserProfileImagesData)
      const state = reducers(testState, clearUserProfileData())
      assert.isFalse(state.has('userProfileImages'))
      assert.isFalse(state.has('deleteUserProfileImages'))
    })
  })
  describe('Reducer SET_UPDATE_USER_PROCESSING', () => {
    it('should set updateUserProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUpdateUserProcessing(value),
      )
      assert.equal(value, state.get('updateUserProcessing'))
    })
  })
  describe('Reducer SET_USER_UPDATE_DATA', () => {
    it('should set user.userUpdateData and user.updateUserProcessing in state', () => {
      const data = fromJS({
        success: true,
        statusCode: 200,
      })
      const processing = true
      const state = reducers(
        initialState,
        setUserUpdateData(data, processing),
      )
      assert.equal(
        data,
        state.get('updateUser'),
      )
      assert.equal(processing, state.get('updateUserProcessing'))
    })
  })
  describe('Reducer CLEAR_USER_DATA_LANGUAGE_DIALOG', () => {
    it('should remove [\'data\', \'languageDialog\'] and set processing in state', () => {
      const testState = initialState.setIn(['data', 'languageDialog'], List(['es']))
      const state = reducers(
        testState,
        clearUserDataLanguageDialog(),
      )
      assert.isFalse(state.hasIn(['data', 'languageDialog']))
    })
  })
  describe('Reducer SET_USER_DATA_LANGUAGE_DIALOG', () => {
    it('should set [\'data\', \'languageDialog\'] to List([\'en\', \'es\']) and set processing in state', () => {
      const value = List(['en', 'es'])
      const state = reducers(
        initialState,
        setUserDataLanguageDialog(value),
      )
      assert.equal(value, state.getIn(['data', 'languageDialog']))
    })
  })
  describe('Reducer SET_USER_DATA_LANGUAGE', () => {
    it('should set [\'data\', \'language\'] to List([\'en\', \'es\']) and set processing in state', () => {
      const value = List(['en', 'es'])
      const processing = true
      const state = reducers(
        initialState,
        setUserDataLanguage(value, processing),
      )
      assert.equal(value, state.getIn(['data', 'language']))
      assert.equal(processing, state.get('processing'))
    })
  })
  describe('Reducer RESET_USER_DATA_LANGUAGE', () => {
    it('should delete [\'data\', \'language\'] in state', () => {
      const processing = true
      const state = reducers(initialState, resetUserDataLanguage(processing))
      assert.isUndefined(state.getIn(['data', 'language']))
      assert.equal(processing, state.get('processing'))
    })
  })
  describe('Reducer SET_USER_DATA_LANGUAGE_PRIMARY', () => {
    it('should set [\'data\', \'language\', 0] to en in state', () => {
      const value = 'en'
      const processing = true
      const state = reducers(
        initialState,
        setUserDataLanguagePrimary(value, processing),
      )
      assert.equal(value, state.getIn(['data', 'language', 0]))
      assert.equal(processing, state.get('processing'))
    })
    it('should set [\'data\', \'language\', 0] to en and remove en from index 1 in state', () => {
      const value = 'en'
      const processing = true
      const expected = List(['en'])
      const testState = initialState.setIn(
        ['data', 'language'],
        List(['es', 'en']),
      )
      const state = reducers(
        testState,
        setUserDataLanguagePrimary(value, processing),
      )
      assert.equal(expected, state.getIn(['data', 'language']))
      assert.equal(processing, state.get('processing'))
    })
    it('should set [\'data\', \'language\', 0] to en and leave es at index 1 in state', () => {
      const value = 'en'
      const processing = true
      const expected = List(['en', 'es'])
      const testState = initialState.setIn(
        ['data', 'language'],
        List(['de', 'es']),
      )
      const state = reducers(
        testState,
        setUserDataLanguagePrimary(value, processing),
      )
      assert.equal(expected, state.getIn(['data', 'language']))
      assert.equal(processing, state.get('processing'))
    })
  })
  describe('Reducer SET_USER_DATA_ENTITLED', () => {
    it('should set [\'data\', \'entitled\'] and processing in state', () => {
      const value = true
      const state = reducers(initialState, setUserDataEntitled(value))
      assert.equal(value, state.getIn(['data', 'entitled']))
      assert.equal(false, state.get('processing'))
    })
  })
  describe('Reducer SET_USER_DATA_LANGUAGE_ALERT_BAR_ACCEPTED', () => {
    it('should set [\'data\', \'languageAlertBarAccepted\'] to true', () => {
      const value = true
      const state = reducers(initialState, setUserDataLanguageAlertBarAcceptedAction(value))
      assert.equal(value, state.getIn(['data', 'languageAlertBarAccepted']))
    })
  })
})
