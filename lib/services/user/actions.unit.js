import { describe, it } from 'mocha'
import { assert } from 'chai'
import { List } from 'immutable'
import {
  setUserUsernameAvailabilityProcessing,
  SET_USER_USERNAME_AVAILABILITY_PROCESSING,
  setUserUsernameAvailability,
  SET_USER_USERNAME_AVAILABILITY,
  resetUserUsernameAvailability,
  RESET_USER_USERNAME_AVAILABILITY,
  setUserEmailAvailabilityProcessing,
  SET_USER_EMAIL_AVAILABILITY_PROCESSING,
  setUserEmailAvailability,
  SET_USER_EMAIL_AVAILABILITY,
  resetUserEmailAvailability,
  RESET_USER_EMAIL_AVAILABILITY,
  clearUserDataLanguageDialog,
  CLEAR_USER_DATA_LANGUAGE_DIALOG,
  setUserDataLanguageDialog,
  SET_USER_DATA_LANGUAGE_DIALOG,
  setUserDataLanguage,
  SET_USER_DATA_LANGUAGE,
  resetUserDataLanguage,
  RESET_USER_DATA_LANGUAGE,
  setUserDataLanguagePrimary,
  SET_USER_DATA_LANGUAGE_PRIMARY,
  setUserDataEntitled,
  SET_USER_DATA_ENTITLED,
  setUserDataLanguageAlertBarAcceptedAction,
  SET_USER_DATA_LANGUAGE_ALERT_BAR_ACCEPTED,
  SET_USER_PROFILE_IMAGES_PROCESSING,
  setUserProfileImagesProcessing,
  SET_USER_PROFILE_IMAGES,
  setUserProfileImages,
  SET_USER_PROFILE_IMAGES_DELETE,
  setUserProfileImagesDelete,
  CLEAR_USER_PROFILE_DATA,
  clearUserProfileData,
  SET_USER_UPDATE_DATA,
  setUserUpdateData,
  SET_UPDATE_USER_PROCESSING,
  setUpdateUserProcessing,
} from './actions'

describe('service user actions', () => {
  describe('Function: setUserUsernameAvailabilityProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_USER_USERNAME_AVAILABILITY_PROCESSING,
        payload: value,
      }
      assert.deepEqual(action, setUserUsernameAvailabilityProcessing(value))
    })
  })
  describe('Function: setUserUsernameAvailability()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_USER_USERNAME_AVAILABILITY,
        payload: value,
      }
      assert.deepEqual(action, setUserUsernameAvailability(value))
    })
  })
  describe('Function: resetUserUsernameAvailability()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_USER_USERNAME_AVAILABILITY,
      }
      assert.deepEqual(action, resetUserUsernameAvailability())
    })
  })
  describe('Function: setUserEmailAvailabilityProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_USER_EMAIL_AVAILABILITY_PROCESSING,
        payload: value,
      }
      assert.deepEqual(action, setUserEmailAvailabilityProcessing(value))
    })
  })
  describe('Function: setUserEmailAvailability()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_USER_EMAIL_AVAILABILITY,
        payload: value,
      }
      assert.deepEqual(action, setUserEmailAvailability(value))
    })
  })
  describe('Function: resetUserEmailAvailability()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_USER_EMAIL_AVAILABILITY,
      }
      assert.deepEqual(action, resetUserEmailAvailability())
    })
  })
  describe('Function: setUserProfileImagesProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_USER_PROFILE_IMAGES_PROCESSING,
        payload: value,
      }
      assert.deepEqual(action, setUserProfileImagesProcessing(value))
    })
  })
  describe('Function: setUserProfileImages()', () => {
    it('should create an action', () => {
      const data = {
        success: true,
        statusCode: 200,
      }
      const processing = true
      const action = {
        type: SET_USER_PROFILE_IMAGES,
        payload: { data, processing },
      }
      assert.deepEqual(action, setUserProfileImages(data, processing))
    })
  })
  describe('Function: setUserProfileImagesDelete()', () => {
    it('should create an action', () => {
      const data = {
        success: true,
        statusCode: 204,
      }
      const processing = true
      const action = {
        type: SET_USER_PROFILE_IMAGES_DELETE,
        payload: { data, processing },
      }
      assert.deepEqual(action, setUserProfileImagesDelete(data, processing))
    })
  })
  describe('Function: clearUserProfileData()', () => {
    it('should create an action', () => {
      const action = {
        type: CLEAR_USER_PROFILE_DATA,
      }
      assert.deepEqual(action, clearUserProfileData())
    })
  })
  describe('Function: setUpdateUserProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_UPDATE_USER_PROCESSING,
        payload: value,
      }
      assert.deepEqual(action, setUpdateUserProcessing(value))
    })
  })
  describe('Function: setUserUpdateData()', () => {
    it('should create an action', () => {
      const data = {
        success: true,
        statusCode: 200,
      }
      const processing = true
      const action = {
        type: SET_USER_UPDATE_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(action, setUserUpdateData(data, processing))
    })
  })
  describe('Function: clearUserDataLanguageDialog()', () => {
    it('should create an action', () => {
      const action = {
        type: CLEAR_USER_DATA_LANGUAGE_DIALOG,
      }
      assert.deepEqual(action, clearUserDataLanguageDialog())
    })
  })
  describe('Function: setUserDataLanguageDialog()', () => {
    it('should create an action', () => {
      const value = List(['en', 'es'])
      const action = {
        type: SET_USER_DATA_LANGUAGE_DIALOG,
        payload: { value },
      }
      assert.deepEqual(action, setUserDataLanguageDialog(value))
    })
  })
  describe('Function: setUserDataLanguage()', () => {
    it('should create an action', () => {
      const value = List(['en', 'es'])
      const processing = true
      const action = {
        type: SET_USER_DATA_LANGUAGE,
        payload: { value, processing },
      }
      assert.deepEqual(action, setUserDataLanguage(value, processing))
    })
  })
  describe('Function: resetUserDataLanguage()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: RESET_USER_DATA_LANGUAGE,
        payload: { processing },
      }
      assert.deepEqual(action, resetUserDataLanguage(processing))
    })
  })
  describe('Function: setUserDataLanguagePrimary()', () => {
    it('should create an action', () => {
      const value = 'en'
      const processing = true
      const action = {
        type: SET_USER_DATA_LANGUAGE_PRIMARY,
        payload: { value, processing },
      }
      assert.deepEqual(action, setUserDataLanguagePrimary(value, processing))
    })
  })
  describe('Function: setUserDataEntitled()', () => {
    it('should create an action', () => {
      const value = true
      const processing = true
      const action = {
        type: SET_USER_DATA_ENTITLED,
        payload: { value, processing },
      }
      assert.deepEqual(action, setUserDataEntitled(value, processing))
    })
  })
  describe('Function: setUserDataLanguageAlertBarAcceptedAction()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_USER_DATA_LANGUAGE_ALERT_BAR_ACCEPTED,
        payload: { value },
      }
      assert.deepEqual(action, setUserDataLanguageAlertBarAcceptedAction(value))
    })
  })
})
