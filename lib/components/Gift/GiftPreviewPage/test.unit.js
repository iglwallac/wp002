/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import PropTypes from 'prop-types'
import { createStore as reduxCreateStore } from 'redux'
import { fromJS, Map } from 'immutable'
import { assert } from 'chai'
import rootReducer from 'reducers'
import { mount } from 'enzyme'
import { createHistory } from 'services/resolver'
import { createLocation } from 'test'
import GiftPreviewPage from 'components/Gift/GiftPreviewPage'
import { GIFT_THEME_TYPE_BIRTHDAY, GIFT_STEP_FOUR } from 'services/gift'
import enStaticText from './lang_en.json'

const PATHNAME = '/gift/preview'

const firstName = 'Dan'
const lastName = 'Smith'
const email = 'dan@example.com'
const confirmEmail = email
const giverAnonymous = true
const recipientFirstName = 'Don'
const recipientLastName = 'Jones'
const recipientEmail = 'don@example.com'
const recipientConfirmEmail = recipientEmail
const recipientSendDate = '11/23/2019'
const recipientMessage = 'test message'
const giverTermsConditions = true

const giftPreviewPageData = {
  step: {
    active: GIFT_STEP_FOUR,
    complete: [
      1,
      2,
      3,
    ],
  },
  theme: {
    selected: GIFT_THEME_TYPE_BIRTHDAY,
  },
  checkout: {
    data: {
      giver: {
        firstName,
        lastName,
        email,
        confirmEmail,
        giverAnonymous,
        giverTermsConditions,
      },
      recipient: {
        firstName: recipientFirstName,
        lastName: recipientLastName,
        email: recipientEmail,
        confirmEmail: recipientConfirmEmail,
        sendDate: recipientSendDate,
        message: recipientMessage,
      },
    },
  },
}

function mountWrapper (component, options = {}) {
  const { history = createHistory(PATHNAME) } = options
  const store = reduxCreateStore(
    rootReducer,
    createGiftPreviewState())
  return mount(component, {
    context: {
      store,
      history,
    },
    childContextTypes: {
      store: PropTypes.object,
      history: PropTypes.object,
    },
  })
}

function createGiftPreviewState () {
  return {
    staticText: fromJS({
      data: {
        giftPreviewPage: { data: enStaticText },
      },
    }),
    resolver: Map({
      path: PATHNAME,
      location: createLocation({ pathname: PATHNAME }),
    }),
    gift: fromJS(giftPreviewPageData),
  }
}

describe('GiftPreviewPage', () => {
  describe('initial GiftPreviewPage mount', () => {
    let wrapper
    before(() => {
      wrapper = mountWrapper(<GiftPreviewPage />)
    })
    after(() => { wrapper.unmount() })
    it('Should render div with className=gift-preview', () => {
      const result = wrapper.exists('.gift-preview')
      assert.isTrue(result, 'GiftPreviewPage does not exist')
    })
    it('Should render the GiftProgressMeter with className=gift-progress-meter', () => {
      const result = wrapper.exists('.gift-progress-meter')
      assert.isTrue(result, 'GiftProgressMeter does not exist')
    })
    it('Should render step 4 as active for GiftProgressMeter', () => {
      const result = wrapper.find('.gift-progress-meter__number--active')
      assert.equal(result.text(), GIFT_STEP_FOUR, 'GiftProgressMeter should be on step 4')
    })
    it('Should render a form', () => {
      const result = wrapper.exists('.gift-preview__form')
      assert.isTrue(result, 'GiftPreviewPage should have a form')
    })
    it('Should render terms and conditions text', () => {
      const result = wrapper.find('.gift-preview__terms')
      assert.exists(result.text(), 'GiftPreviewPage Terms & Conditions text should exist')
    })
    it(`Checked should be ${giverTermsConditions} as the giverTermsConditions form checkbox value`, () => {
      const result = wrapper.find('#input-giverTermsConditions').props().checked
      assert.equal(result, giverTermsConditions, `GiftPreviewPage giverTermsConditions form checkbox value should be ${giverTermsConditions}`)
    })
    it('Should render a clickable continue button given the state', () => {
      const result = wrapper.exists('.form-button--primary')
      assert.isTrue(result, 'GiftPreviewPage should have a clickable Continue button')
    })
    it('Should render a preview image', () => {
      const result = wrapper.exists('.gift-preview__image')
      assert.isTrue(result, 'GiftPreviewPage should have a preview image')
    })
  })
})
