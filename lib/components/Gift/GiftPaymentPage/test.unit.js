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
import GiftPaymentPage from 'components/Gift/GiftPaymentPage'
import { GIFT_THEME_TYPE_BIRTHDAY, GIFT_STEP_FIVE } from 'services/gift'
import enStaticText from './lang_en.json'

const PATHNAME = '/gift/payment'

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
const paymentType = 'existing'

const giftPaymentPageData = {
  step: {
    active: GIFT_STEP_FIVE,
    complete: [
      1,
      2,
      3,
      4,
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
      paymentType,
    },
  },
}

function mountWrapper (component, options = {}) {
  const { history = createHistory(PATHNAME) } = options
  const store = reduxCreateStore(
    rootReducer,
    createGiftPaymentState())
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

function createGiftPaymentState () {
  return {
    staticText: fromJS({
      data: {
        giftPaymentPage: { data: enStaticText },
      },
    }),
    resolver: Map({
      path: PATHNAME,
      location: createLocation({ pathname: PATHNAME }),
    }),
    gift: fromJS(giftPaymentPageData),
  }
}

describe('GiftPaymentPage', () => {
  describe('initial GiftPaymentPage mount', () => {
    let wrapper
    before(() => {
      wrapper = mountWrapper(<GiftPaymentPage />)
    })
    after(() => { wrapper.unmount() })
    it('Should render div with className=gift-payment', () => {
      const result = wrapper.exists('.gift-payment')
      assert.isTrue(result, 'GiftPaymentPage does not exist')
    })
    it('Should render the GiftProgressMeter with className=gift-progress-meter', () => {
      const result = wrapper.exists('.gift-progress-meter')
      assert.isTrue(result, 'GiftProgressMeter does not exist')
    })
    it('Should render step 5 as active for GiftProgressMeter', () => {
      const result = wrapper.find('.gift-progress-meter__number--active')
      assert.equal(result.text(), GIFT_STEP_FIVE, 'GiftProgressMeter should be on step 5')
    })
    it('Should render a form', () => {
      const result = wrapper.exists('.gift-payment__form')
      assert.isTrue(result, 'GiftPaymentPage should have a form')
    })
    it('Should render a clickable submit button given the state', () => {
      const result = wrapper.exists('.form-button--primary')
      assert.isTrue(result, 'GiftPaymentPage should have a clickable submit button')
    })
  })
})
